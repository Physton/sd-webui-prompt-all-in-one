import { updatePromptCore } from '../../src/utils/promptTags/updatePrompt'
import type {
	ICreateUpdatePromptHostResult,
	IUpdatePromptAppendRecord,
	IUpdatePromptHostOptions,
	IUpdatePromptSummary,
	IUpdatePromptTestsOptions,
} from './types/node-test-case-types'
import { EnumPromptPlaceholder, type IUpdatePromptSnap } from './types/snap-types'
import { caseTitle, forEachCase } from './node-test-helpers'
import { assertUpdatePromptContract } from './node-test-helper2'
import { IPromptTag, IPromptTagType, IPromptTagValue } from '#/src/utils/promptTags/tag-types'

/**
 * 建立 updatePrompt 的宿主替身。
 *
 * 元件的 updatePrompt() 只負責編排，實際行為（插入標籤、重新整理、
 * 產生 prompt、提交結果）全由宿主注入。此函式以最小替身實作同一份介面：
 *   - appendTag 依 index splice（對應 _appendTag 的插入語意，空值直接忽略）
 *   - refresh   對應 updateTags()，可選擇重入 updatePrompt 模擬遞迴
 *   - genPrompt 對應 this.genPrompt()，可注入被抽出的真函式
 *   - commit    對應寫入 this.prompt / textarea 的那段程式
 *
 * @param opts - 見 IUpdatePromptHostOptions
 */
export function createUpdatePromptHost({
	tags,
	options = {},
	genPrompt,
	reenter = false,
}: IUpdatePromptHostOptions): ICreateUpdatePromptHostResult {
	const workingTags: IPromptTag[] = tags.map(tag => ({ ...tag }))
	const appended: IUpdatePromptAppendRecord[] = []
	const summary: IUpdatePromptSummary = {
		appended,
		refreshCount: 0,
		genPromptCount: 0,
		committed: [],
		tags: workingTags,
	}

	const host = {
		tags: workingTags,
		options,
		appendTag(value: IPromptTagValue, localValue: string, disabled: boolean, index: number, type: IPromptTagType) {
			appended.push({ value, localValue, disabled, index, type })
			/** 與 _appendTag 一致：空值不建立標籤 */
			if (value === '') return
			workingTags.splice(index, 0, { type, value, localValue, disabled })
		},
		refresh() {
			summary.refreshCount++
			if (reenter) updatePromptCore(host)
		},
		genPrompt() {
			summary.genPromptCount++
			/**
			 * 未注入真 genPrompt 時回傳 EnumPromptPlaceholder.GenPrompt（刻意非空）。
			 *
			 * 為何不回傳 ''：updatePrompt 在無插入時會 commit(host.genPrompt())，
			 * 回傳空字串會讓 commit 變成「有提交但內容為空」，與「未提交」難以區分。
			 * 回傳可辨識的佔位字串，快照的 committed 就會明確出現該佔位值，
			 * 讀者一眼可辨「此案例走的是宿主替身、非真組字邏輯」。
			 * 對照欄位：快照 args.usesRealGenPrompt=false 即代表使用此佔位
			 * （見 helpers/types/snap-types.IUpdatePromptSnapArgs）。
			 * 值本身定義於 EnumPromptPlaceholder（見 helpers/types/snap-types），
			 * 與各 fixture 的 expectedPrompt 共用同一份。
			 */
			return genPrompt ? genPrompt(workingTags) : EnumPromptPlaceholder.GenPrompt
		},
		commit(prompt: string) {
			summary.committed.push(prompt)
		},
	}

	return { host, summary }
}

/**
 * 執行一組 updatePrompt 測試案例。
 *
 * 與 runSplitTagsTests 相同的做法：被測函式由呼叫端注入，
 * 這裡只負責「建立宿主替身 → 執行 → 編排契約 → 對照期望 → 組裝快照」。
 *
 * 流程：
 *   Step 1  建立宿主替身（見本檔 createUpdatePromptHost）
 *   Step 2  執行 updatePrompt
 *   Step 3  編排契約（assertUpdatePromptContract）
 *   Step 4  對照期望（expectedWrapCount / expectedPrompt，或案例自訂 assert）
 *   Step 5  組裝快照 { input, args, appended, refreshCount, committed }
 *
 * 編排契約排在案例級期望與快照之前：與案例宣告與否無關，失敗即中止，
 * 該案例不會寫入快照。
 *
 * @param {Object}   opts
 * @param {Object[]} opts.cases        - 測試案例陣列
 * @param {Function} opts.updatePrompt - 被測的 updatePrompt
 * @param {Function} [opts.genPrompt]  - 注入真 genPrompt（複合測試）；不傳時以替身取代
 * @param {boolean}  [opts.reenter=false]  - refresh 時重入 updatePrompt（模擬元件遞迴）
 */
export function runUpdatePromptTests({
	cases,
	updatePrompt,
	genPrompt,
	reenter = false,
}: IUpdatePromptTestsOptions): void {
    forEachCase(
        cases,
        /** 案例以 tags 描述輸入，這裡補上 input 供 caseTitle 產生可讀標題 */
        tc => caseTitle({ ...tc, input: tc.tags }),
        (tc, t) => {
            /** Step 1: 建立宿主替身 */
            const { host, summary } = createUpdatePromptHost({
                tags: tc.tags,
                options: tc.options,
                genPrompt: genPrompt && ((tags) => genPrompt(tags, false, tc.genPromptOptions)),
                reenter,
            })

            /** Step 2: 執行 */
            updatePrompt(host)

            /** Step 3: 編排契約 */
            assertUpdatePromptContract(summary, { reenter }, t)

            /** Step 4: 對照期望 */
            if (tc.assert) {
                tc.assert(summary, t)
            } else {
                if (tc.expectedWrapCount !== undefined) {
                    t.assert.equal(summary.appended.length, tc.expectedWrapCount,
                        `插入的換行數量不符：expected=${tc.expectedWrapCount}, actual=${summary.appended.length}`,
                    )
                }
                if (tc.expectedPrompt !== undefined) {
                    t.assert.deepEqual(summary.committed, [tc.expectedPrompt],
                        `提交的 prompt 不符：expected=${JSON.stringify([tc.expectedPrompt])}, actual=${JSON.stringify(summary.committed)}`,
                    )
                }
            }

            /** Step 5: 組裝快照（key 順序與既有 .snapshot 一致，不可隨意重排） */
            const snap: IUpdatePromptSnap = {
                input: tc.tags,
                args: {
                    options: {
                        autoBreakBeforeWrap: tc.options?.autoBreakBeforeWrap,
                        autoBreakAfterWrap: tc.options?.autoBreakAfterWrap,
                    },
                    usesRealGenPrompt: !!genPrompt,
                },
                appended: summary.appended,
                refreshCount: summary.refreshCount,
                committed: summary.committed,
            }
            t.assert.snapshot(snap)
        },
    )
}
