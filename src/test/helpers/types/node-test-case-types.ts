
import type { TestContext } from 'node:test'
import type {
	IGenPromptHooks,
} from '#/src/utils/promptTags/genPrompt'
import type { IUpdatePromptHost } from '#/src/utils/promptTags/updatePrompt'
import { IHostPromptOptions } from '#/src/utils/promptTags/types'
import { IPromptTag, IPromptTagValue, IPromptTagValueRuntimeInput } from '#/src/utils/promptTags/tag-types'
import { IPromptOptionValueRecordWithLegacyRuntime } from '#/src/utils/promptOptions/definitions'

/**
 * splitTags 的額外參數 tuple。
 * 與 splitTags(tags, autoBreakBeforeWrap, autoBreakAfterWrap, options) 對應。
 */
export type ISplitTagsArgs = [
	autoBreakBeforeWrap?: boolean,
	autoBreakAfterWrap?: boolean,
	options?: IPromptOptionValueRecordWithLegacyRuntime,
]

/**
 * splitByPeriod 的額外參數 tuple。
 * 與 splitByPeriod(str, options) 對應。
 */
export type ISplitByPeriodArgs = [
	options?: IHostPromptOptions,
]

/**
 * splitTags 的函式簽名。
 * 供 helpers 注入被測／原版函式時描述型別，避免各處重複描述。
 * 對應 src/utils/splitTags.splitTags(tags, autoBreakBeforeWrap, autoBreakAfterWrap, options)。
 */
export type ISplitTagsFn = (
	tags: IPromptTagValueRuntimeInput,
	...args: ISplitTagsArgs
) => IPromptTagValue[]

/**
 * splitByPeriod 的函式簽名。
 * 第一個參數為 unknown（被測函式內建非字串防禦），回傳 IPromptTagValue[]。
 */
export type ISplitByPeriodFn = (
	str: unknown,
	...args: ISplitByPeriodArgs
) => IPromptTagValue[]

/**
 * data-driven 測試案例的共用泛型基底。
 * 供 runCases 系列的案例使用：輸入、額外參數、期望值、自訂斷言與 skip。
 * 案例的斷言來源，可任選其一或多個併用：
 *   - 僅 expected                — t.assert.deepEqual 完全比對回傳值
 *   - 僅 partialExpected         — t.assert.partialDeepStrictEqual 部分比對（子結構相符即可）
 *   - 僅 assert                  — 執行自訂斷言 callback(result, t)
 *   - 多者併用                   — 全部執行，任一失敗即中止該案例
 *   - 全部省略                   — 不寫任何斷言，只留下結果紀錄；
 *                                  需 caseAllowSnapshotOnly: true 或 suiteAllowSnapshotOnly 明確允許
 * 斷言 callback 一律接收 node:test 的 TestContext t，
 * 可直接呼叫 t.assert.*（含 partialDeepStrictEqual）擴充驗證。
 * 快照與允許各有 suite / case 兩級，名稱以前綴區分：
 *   - suiteSnapshot / suiteAllowSnapshotOnly — 整組生效，給專存快照的測試組
 *   - caseSnapshot / caseAllowSnapshotOnly   — 只作用於單一案例；
 *     allow 表示「允許省略斷言」，不是強制此案例只能寫快照
 * 快照是回歸紀錄，不是斷言：允許省略斷言的案例只被記錄，不被驗證。
 * 一般測試組不開 suiteAllowSnapshotOnly，少數只記錄的案例自行標記 caseAllowSnapshotOnly: true；
 * 新增案例漏寫 expected/assert 時仍會立即失敗。
 * 各被測函式的案例型別皆由此衍生，避免重複定義同一組欄位。
 */
export interface IRunCase<
	TInput = unknown,
	TArgs extends unknown[] = [],
	TResult = unknown,
> {
	/** 傳入被測函式的第一個參數 */
	input: TInput
	/** 額外參數陣列（會 spread 到被測函式(input, ...args)） */
	args?: TArgs
	/** 附加說明（顯示在測試標題中） */
	note?: string
	/**
	 * 期望回傳值：以 t.assert.deepEqual 完全比對。
	 * 與 partialExpected / assert 共存時全部執行，不是二選一；
	 * 明寫 undefined 表示「期望回傳 undefined」的合法結果。
	 */
	expected?: TResult
	/**
	 * 部分比對期望：以 t.assert.partialDeepStrictEqual 檢查，
	 * 只要求子結構相符，其餘欄位不受限。
	 * 與 expected / assert 共存時全部執行。
	 */
	partialExpected?: TResult
	/**
	 * 自訂斷言 fn(result, t)：t 為 node:test 的 TestContext，
	 * 可直接使用 t.assert.*（含 partialDeepStrictEqual）。
	 * 與 expected / partialExpected 共存時全部執行。
	 */
	assert?: (result: TResult, t: TestContext) => void
	/**
	 * case 級：允許此案例省略 expected/assert，只留下結果快照（不做斷言）。
	 *   - 省略 — 依 suite 的 suiteAllowSnapshotOnly 決定；未允許時必須提供 expected/assert
	 *   - true — 此案例省略斷言仍成立，不需 suite 開啟 suiteAllowSnapshotOnly
	 *   - false — 取消 suite 的允許：即使 suiteAllowSnapshotOnly 為 true，此案例仍須提供 expected/assert
	 * 與 expected / assert 併存時照常執行斷言，不構成宣告矛盾。
	 */
	caseAllowSnapshotOnly?: boolean
	/**
	 * case 級：true 時此案例寫入快照；僅此一種有效值。
	 * 省略與 false 皆不另外處理，一律跟隨 suite 的 suiteSnapshot。
	 */
	caseSnapshot?: boolean
	/** true 時跳過此案例 */
	skip?: boolean
}

/**
 * splitByPeriod 單獨測試案例。
 * 格式與 fixture/data-splitByPeriod.ts 表頭說明一致。
 */
export type ISplitByPeriodCase = IRunCase<unknown, ISplitByPeriodArgs, IPromptTagValue[]>

/**
 * splitTags 測試案例。
 * 格式與 fixture/data-splitTags.ts 表頭說明一致。
 */
export interface ISplitTagsCase {
	/** 傳入 splitTags 的第一個參數（非字串防禦值亦可） */
	input: IPromptTagValueRuntimeInput
	/** 額外參數陣列 [autoBreakBeforeWrap, autoBreakAfterWrap, options] */
	args?: ISplitTagsArgs
	/** 附加說明（顯示在測試標題中） */
	note?: string
	/** 期望與 splitTags_original 的結果是否有差異 */
	expectOriginalChanged?: boolean
	/** 自訂斷言 fn(tagResult, t)——除快照外再鎖定關鍵行為 */
	assertResult?: (tagResult: IPromptTagValue[], t: TestContext) => void
	/** true 時跳過此案例（由 helpers/node-test-helpers.forEachCase 統一處理） */
	skip?: boolean
}

/**
 * splitTags → splitByPeriod 串接管線案例。
 * 在 ISplitTagsCase 之上追加管線階段的欄位。
 */
export interface ISplitTagsPipelineCase extends ISplitTagsCase {
	/** 逐 tag 傳入 splitByPeriod 的選項 */
	splitByPeriodOptions?: IHostPromptOptions
	/** 期望 splitByPeriod 是否改變了 splitTags 的輸出 */
	expectChanged?: boolean
	/**
	 * 管線最終結果的自訂斷言 fn(finalResult, t, tc)。
	 * 與 assertResult 的差異：拿到的是 splitByPeriod 之後的最終陣列，
	 * 可驗證「兩階段合計」的不變式（如分隔符數量守恆）。
	 */
	assertPipeline?: (finalResult: IPromptTagValue[], t: TestContext, tc: ISplitTagsPipelineCase) => void
}

/**
 * genPrompt 的額外參數 tuple。
 * 與 genPrompt(tags, ignoreDisabled, options, hooks) 對應；
 * 只需 options 時仍須把 ignoreDisabled 明寫為 false，避免參數位移。
 */
export type IGenPromptArgs = [
	ignoreDisabled?: boolean,
	options?: IHostPromptOptions,
	hooks?: IGenPromptHooks,
]

/**
 * genPrompt 的函式簽名。
 * 供複合測試注入真 genPrompt、個別測試以替身取代時描述同一份型別。
 */
export type IGenPromptFn = (
	tags: IPromptTag[],
	...args: IGenPromptArgs
) => string

/**
 * updatePrompt 的函式簽名。
 * 被測函式無回傳值，只接收宿主（IUpdatePromptHost）並編排流程。
 */
export type IUpdatePromptFn = (host: IUpdatePromptHost) => void

/**
 * genPrompt 測試案例。
 * 與既有案例同構：input = 標籤陣列、args = 額外參數；
 * expected / partialExpected / assert 可共存（全部執行），
 * 或由案例自行標記 caseAllowSnapshotOnly: true 只留下結果快照（suite 不開 suiteAllowSnapshotOnly）。
 */
export type IGenPromptCase = IRunCase<IPromptTag[], IGenPromptArgs, string>

/** updatePrompt 宿主回報的執行摘要（由 helpers 建立的測試替身收集）。 */
export interface IUpdatePromptSummary {
	/** 宿主 appendTag 收到的參數（依呼叫順序） */
	appended: IUpdatePromptAppendRecord[]
	/** refresh 呼叫次數（元件實作為 updateTags()） */
	refreshCount: number
	/** genPrompt 呼叫次數 */
	genPromptCount: number
	/** commit 收到的 prompt（未提交時為空陣列） */
	committed: string[]
	/** 插入換行後的標籤陣列 */
	tags: IPromptTag[]
}

/** appendTag 的單次呼叫記錄。 */
export interface IUpdatePromptAppendRecord {
	value: string
	localValue: string
	disabled: boolean
	index: number
	type: string
}

/**
 * updatePrompt 測試案例。
 * 與既有案例同構，但被測函式無回傳值，改以 tags + 期望欄位描述，
 * 由 runner 建立宿主替身並收集 IUpdatePromptSummary。
 *
 * 選項以 IHostPromptOptions 置於 options，與宿主介面（IUpdatePromptHost.options）同形：
 * 案例描述的選項與 updatePrompt 實際認識的選項必須是同一份，改名或增減欄位時只改一處。
 */
export interface IUpdatePromptCase {
	/** 宿主持有的標籤陣列（會被插入換行 mutate，故每案例各自獨立建立） */
	tags: IPromptTag[]
	/**
	 * 換行插入選項（autoBreakBeforeWrap / autoBreakAfterWrap）。
	 * runner 直接放入 host.options；省略時視為兩旗標皆關閉。
	 */
	options?: IHostPromptOptions
	/**
	 * 複合測試專用：呼叫真 genPrompt 時的選項。
	 * 個別測試（未注入 genPrompt）會忽略此欄位。
	 */
	genPromptOptions?: IHostPromptOptions
	/** 附加說明（顯示在測試標題中） */
	note?: string
	/** 期望被 appendTag 插入的換行數量 */
	expectedWrapCount?: number
	/** 期望提交的 prompt；期望不提交時改以 assert 驗證 summary.committed */
	expectedPrompt?: string
	/** 自訂斷言 fn(summary, t)，若有則取代 expectedWrapCount / expectedPrompt */
	assert?: (summary: IUpdatePromptSummary, t: TestContext) => void
	/** true 時跳過此案例 */
	skip?: boolean
}

/**
 * createUpdatePromptHost 的選項。
 *
 * 選項以 IHostPromptOptions 傳入，與元件呼叫端（options: this）同形；
 * runner 將案例的 options（IUpdatePromptCase.options）原樣放入此欄位。
 */
export interface IUpdatePromptHostOptions {
	/**
	 * 宿主持有的標籤陣列。
	 * 傳入的陣列「不會」被 mutate：建立時會複製一份，
	 * 避免 fixture 內的案例資料被上一個案例的插入動作污染。
	 */
	tags: readonly IPromptTag[]
	/** 宿主的選項值，建立替身時放入 host.options */
	options: IHostPromptOptions
	/**
	 * 宿主替身的「產生 prompt」行為，契約為 (tags) => string。
	 *
	 * 注意：這「不是」真 genPrompt 的簽名——真 genPrompt 為 IGenPromptFn
	 * （多兩個參數，見 IUpdatePromptTestsOptions.genPrompt）。
	 * 宿主端只依 this.genPrompt() 的形式被呼叫（無參數、由閉包決定要用哪些 tags），
	 * 故此處刻意收窄為「給定當前 tags → 回傳字串」；複合測試由呼叫端把真 genPrompt
	 * 適配成此形狀（見 runUpdatePromptTests）。
	 * 不傳時替身回傳 EnumPromptPlaceholder.GenPrompt，讓個別測試只驗證編排流程、不受組字邏輯影響。
	 */
	genPrompt?: (tags: IPromptTag[]) => string
	/**
	 * true 時 refresh() 會重新呼叫 updatePrompt。
	 * 用來重現元件的實際行為：updatePrompt → updateTags → updatePrompt。
	 * 僅在「已無換行可插入」時才會收斂，fixture 資料須可收斂。
	 */
	reenter?: boolean
}

export interface ICreateUpdatePromptHostResult {
	host: IUpdatePromptHost;
	summary: IUpdatePromptSummary;
}

/** runCases 的選項。 */
export interface IRunCasesOptions {
	/** suite 級：true 時整組案例寫入快照 { input, args?, result } */
	suiteSnapshot?: boolean
	/**
	 * suite 級：true 時整組案例允許省略 expected/assert，只留下結果快照（不做斷言）。
	 * 案例不必逐筆標記 caseAllowSnapshotOnly，個別案例仍可以 caseAllowSnapshotOnly: false
	 * 收回這份允許、改回必須提供斷言。
	 * 只給「專門保存快照的測試組」使用；一般測試組請保持關閉，
	 * 讓少數只記錄的案例自行標記 caseAllowSnapshotOnly: true，其餘案例維持斷言。
	 * 快照是回歸紀錄而非斷言，故這類案例本身不被驗證，
	 * 且須搭配快照（suiteSnapshot 或該案例的 caseSnapshot: true），否則案例空跑。
	 * 預設 false：未提供 expected/assert 的案例一律拋錯。
	 */
	suiteAllowSnapshotOnly?: boolean
}

/** runSplitTagsTests 的選項（被測函式由呼叫端注入，這裡只負責編排與斷言）。 */
export interface ISplitTagsTestsOptions {
	/**
	 * 待執行案例。
	 * ISplitTagsCase 可直接傳入：管線欄位皆為 optional，
	 * 故 runner 內一律以 ISplitTagsPipelineCase 存取（非管線案例取到 undefined）。
	 */
	cases: readonly ISplitTagsPipelineCase[]
	/** 被測的 splitTags */
	splitTags: ISplitTagsFn
	/** 原版 splitTags；不傳表示不與原版比較 */
	originalFn?: ISplitTagsFn
	/** 管線第二階段；不傳表示只跑 splitTags、不接 splitByPeriod */
	splitByPeriod?: ISplitByPeriodFn
}

/** runUpdatePromptTests 的選項。 */
export interface IUpdatePromptTestsOptions {
	/** 待執行案例 */
	cases: readonly IUpdatePromptCase[]
	/** 被測的 updatePrompt */
	updatePrompt: IUpdatePromptFn
	/**
	 * 注入真 genPrompt（複合測試）；不傳時以宿主替身取代，
	 * 讓個別測試只驗證編排流程。
	 * 第二、三參數對應 genPrompt(tags, ignoreDisabled, options)。
	 */
	genPrompt?: IGenPromptFn
	/** true 時 refresh() 重入 updatePrompt（模擬元件遞迴） */
	reenter?: boolean
}
