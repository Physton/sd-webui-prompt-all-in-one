import type { TestContext } from 'node:test'
import { IPromptTagValue } from '#/src/utils/promptTags/tag-types'
import { promptInvisibleMojibakes } from '../../src/utils/splitPromptTypes'
import type {
	IUpdatePromptSummary,
	ISplitTagsPipelineCase,
} from './types/node-test-case-types'

/**
 * 斷言：不得出現孤兒逗號 tag。
 *
 * 來源 issue：孤立雙引號（如 JSON 殘骸 `", "}, }`）開啟引號狀態後，
 * 舊版 splitTags 的分行不重置 quoteChar，導致後續整行被引號吞掉、
 * 逗號全部失效，lora 後處理再把分隔逗號切成值恰為 "," 的孤兒 tag，
 * 最終 genPrompt 輸出 `, ,,`。
 *
 * 檢查項目：
 *   1. 不得存在值恰為 "," 的 tag（孤兒分隔逗號）。
 *   2. 不得存在以 "," 結尾的 tag（分隔符被誤留在 tag 內容尾端）。
 */
export function assertNoOrphanCommaTags(tagResult: IPromptTagValue[], t: TestContext)
{
	const orphans = tagResult.filter(tag => tag === ',')
	t.assert.deepEqual(orphans, [],
		`不應存在孤兒逗號 tag（值恰為 ","）: ${JSON.stringify(orphans)}`,
	)

	const trailing = tagResult.filter(tag => tag !== ',' && /,$/.test(tag))
	t.assert.deepEqual(trailing, [],
		`不應存在尾隨逗號 tag（分隔符殘留在 tag 內容）: ${JSON.stringify(trailing.map(v => v.slice(-40)))}`,
	)
}

/**
 * 斷言：所有 <lora:...> tag 都是完整獨立的 tag。
 *
 * 來源 issue 同上：孤兒逗號出現時，lora 前的 before 殘片會帶尾隨逗號，
 * 破壞 lora 單元的完整性。
 */
export function assertLoraTagsIntact(tagResult: IPromptTagValue[], t: TestContext)
{
	const broken = tagResult.filter(tag => tag.startsWith('<lora:') && !/^<lora:[^>]+>$/.test(tag))
	t.assert.deepEqual(broken, [],
		`lora tag 應為完整獨立單元: ${JSON.stringify(broken)}`,
	)
}

/**
 * issues 回歸案例共用斷言：孤兒逗號 + lora 完整性。
 */
export function assertNoOrphanCommaRegressions(tagResult: IPromptTagValue[], t: TestContext)
{
	assertNoOrphanCommaTags(tagResult, t)
	assertLoraTagsIntact(tagResult, t)
}

/**
 * 斷言：結果中不得殘留不可見字元（\x00 NULL、\u200b 零寬空格）
 * 或其 mojibake 序列（Latin-1：â + C1 + C1；Windows-1252：â + € + ‹）。
 * 來源：輸入清理（trimPromptText）應在 splitTags 入口完成清除。
 */
export function assertNoInvisibleChars(tagResult: IPromptTagValue[], t: TestContext)
{
	const INVISIBLE_RE = new RegExp(`[\\x00\\u200b]|${promptInvisibleMojibakes.join('|')}`)
	const polluted = tagResult.filter(tag => INVISIBLE_RE.test(tag))
	t.assert.deepEqual(polluted, [],
		`不得殘留不可見字元: ${JSON.stringify(polluted)}`,
	)
}

/**
 * 斷言：首尾 tag 不得多餘水平空白（邊界空白應已修剪；\n 標記除外）。
 */
export function assertNoEdgeWhitespace(tagResult: IPromptTagValue[], t: TestContext)
{
	const segments = tagResult.filter(tag => tag !== '\n')
	const first = segments[0] ?? ''
	const last = segments[segments.length - 1] ?? ''
	t.assert.equal(/^[^\S\n]|[^\S\n]$/.test(first), false,
		`首段不得有前導空白: ${JSON.stringify(first)}`,
	)
	t.assert.equal(/[^\S\n]$/.test(last), false,
		`末段不得有尾隨空白: ${JSON.stringify(last)}`,
	)
}

/**
 * 斷言：管線最終結果中 '#' 的數量與原始輸入完全相同。
 *
 * '#' 是提示詞中獨立成行的標記（不帶標點）：splitTags 負責切段、
 * splitByPeriod 負責切句，兩者都只能「切開」文字，
 * 不得新增或丟棄標記字元。數量守恆即代表管線沒有吞字或造字。
 *
 * 供案例的 assertPipeline 欄位使用（見 helpers/node-test-case-types）。
 *
 * @param finalResult - splitTags → splitByPeriod 的最終結果
 * @param t           - node:test 的 TestContext（提供 assert）
 * @param tc          - 測試案例（以 input 計算基準數量）
 */
export function assertHashCountPreserved(
	finalResult: IPromptTagValue[],
	t: TestContext,
	tc: ISplitTagsPipelineCase,
)
{
	const count = (text: unknown) => String(text).split('#').length - 1
	const expected = count(tc.input)
	const actual = count(finalResult.join(''))
	t.assert.equal(actual, expected,
		`管線輸出的 '#' 數量應與輸入相同：input=${expected}, output=${actual}`,
	)
}

/**
 * 斷言切割輸出的形狀不變式。
 *
 * 這幾條與案例宣告的斷言無關，故由 runner 對每個案例無條件驗證；
 * 快照僅為回歸紀錄，不構成驗證。
 *
 * 各條的實作依據：
 *   - splitTags.pushSegment 以 temp.trim() 推送、text==='' 直接 return
 *   - splitTags lora 後處理的 before/after 皆 .trim()，空值 continue（不產生空段）
 *   - splitTags 入口 trimPromptText 清除 \x00、\u200b 及其 mojibake 序列
 *   - splitTags 分行於 \n 即切割，故段內不會殘留 \n、段邊不會殘留水平空白
 *   - splitByPeriod 僅在分割符後接空白時切割，且分割符後的空白會被跳過；
 *     其輸入是已修剪的 splitTags 段落，故不會產生空段
 *     （splitByPeriod 單獨測試可合法回傳 ['abc.', '']，不適用此條）
 *
 * @param result - splitTags 或 splitTags → splitByPeriod 的輸出
 * @param t      - node:test 的 TestContext（提供 assert）
 */
export function assertSplitShape(result: IPromptTagValue[], t: TestContext): void {
	t.assert.equal(Array.isArray(result), true, '切割結果應為陣列')
	for (let i = 0; i < result.length; i++) {
		const segment = result[i]
		t.assert.equal(typeof segment, 'string',
			`第 ${i} 段應為字串: ${JSON.stringify(segment)}`)
		t.assert.notEqual(segment, '',
			`不得產生空段（第 ${i} 段）`)
	}
	assertNoInvisibleChars(result, t)
	assertNoEdgeWhitespace(result, t)
}

/**
 * updatePrompt 的編排契約。
 *
 * updatePrompt 只做編排，行為契約寫在函式自身（見 utils/promptTags/updatePrompt）：
 *   1. 有插入 → 依序 appendTag → refresh() → return（不 commit）
 *   2. 無插入 → commit(genPrompt())
 * 這幾條是「與案例期望無關」的必要條件，故對所有案例成立；
 * 案例級的 expectedWrapCount / expectedPrompt / assert 才負責驗證具體數值。
 *
 * @param summary - 宿主替身收集的執行摘要
 * @param opts    - reenter：refresh 是否重入 updatePrompt（決定有插入時是否最終提交）
 * @param t       - node:test 的 TestContext（提供 assert）
 */
export function assertUpdatePromptContract(
	summary: IUpdatePromptSummary,
	{ reenter }: { reenter: boolean },
	t: TestContext,
): void {
	/** appendTag 唯一用途是插入換行，參數形狀固定（見 updatePrompt 呼叫端） */
	for (let i = 0; i < summary.appended.length; i++) {
		const record = summary.appended[i]
		t.assert.equal(record.type, 'wrap', `第 ${i} 筆插入的 type 應為 'wrap'`)
		t.assert.equal(record.value, '\n', `第 ${i} 筆插入的 value 應為 "\\n"`)
		t.assert.equal(record.localValue, '\n', `第 ${i} 筆插入的 localValue 應為 "\\n"`)
		t.assert.equal(record.disabled, false, `第 ${i} 筆插入的 disabled 應為 false`)
		t.assert.equal(Number.isInteger(record.index) && record.index >= 0, true,
			`第 ${i} 筆插入的 index 應為非負整數: ${record.index}`)
	}

	/**
	 * 插入索引須嚴格遞增：回傳索引依遞增順序，且每次插入都要加上先前插入造成的位移
	 * （index = insertWrapIndexes[i] + i）。位移漏加會讓索引重複或倒退。
	 */
	const indexes = summary.appended.map(record => record.index)
	for (let i = 1; i < indexes.length; i++) {
		t.assert.equal(indexes[i] > indexes[i - 1], true,
			`插入索引須嚴格遞增（每次插入需加上先前插入的位移）: ${JSON.stringify(indexes)}`)
	}

	/** commit 至多一次；genPrompt 只在 commit 路徑被呼叫 */
	t.assert.equal(summary.committed.length <= 1, true,
		`commit 至多一次: ${JSON.stringify(summary.committed)}`)
	t.assert.equal(summary.genPromptCount, summary.committed.length,
		`genPrompt 只應在 commit 路徑呼叫：genPrompt=${summary.genPromptCount}, committed=${summary.committed.length}`)

	/** 有插入才 refresh；兩者等價 */
	t.assert.equal(summary.appended.length === 0, summary.refreshCount === 0,
		`無插入 ⟺ 無 refresh：appended=${summary.appended.length}, refresh=${summary.refreshCount}`)

	/** 無插入 → 走 commit，必有一筆提交 */
	if (summary.appended.length === 0) {
		t.assert.equal(summary.committed.length, 1,
			'無插入時應直接 commit 一筆')
		return
	}

	/** 有插入 → reenter 時 refresh 重入並最終提交；否則停在 refresh、不提交 */
	t.assert.equal(summary.committed.length, reenter ? 1 : 0,
		reenter
			? '有插入且 reenter 時，refresh 重入後最終應提交一筆'
			: '有插入時應停留在 refresh、不應提交')
}
