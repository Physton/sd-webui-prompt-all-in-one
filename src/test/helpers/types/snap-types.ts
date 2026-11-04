
import type {
	IGenPromptArgs,
	ISplitByPeriodArgs,
	IUpdatePromptAppendRecord,
} from './node-test-case-types'
import { IHostPromptOptions } from '#/src/utils/promptTags/types'
import { IPromptTag, IPromptTagValue } from '#/src/utils/promptTags/tag-types'

/**
 * 測試中使用的佔位字串列舉。
 *
 * updatePrompt 的宿主替身在「未注入真 genPrompt」時，commit 會收到此字串。
 * 它是快照契約的一部分：*.snapshot 檔的 committed 陣列內實際出現這個值，
 * 因此值本身不可任意修改，否則既有快照會全部失敗。
 */
export enum EnumPromptPlaceholder {
	/** 未注入真 genPrompt 時，宿主替身回傳的佔位 prompt */
	GenPrompt = '<genPrompt>',
}

/**
 * 與原版函式比較後附加到快照的欄位。
 * 由 helpers/node-test-helpers.attachOriginalComparison 附加；
 * 無原版可比時兩個欄位都不會寫入。
 */
export interface IOriginalComparisonSnap {
	/** 與原版結果是否有差異（原版不存在時不寫入此欄位） */
	changedFromOriginal?: boolean
	/** 僅在 changedFromOriginal=true 時附加的原版結果 */
	originalResult?: IPromptTagValue[]
}

/**
 * runCases 的通用快照（options.snapshot=true 時寫入）。
 * 結構固定為 { input, args?, result }，args 僅在案例有傳時才出現。
 */
export interface IRunCasesSnap<
	TInput = unknown,
	TArgs extends unknown[] = unknown[],
	TResult = unknown,
> {
	/** 案例輸入（tc.input） */
	input: TInput
	/** 額外參數（tc.args；未傳時省略） */
	args?: TArgs
	/** 被測函式的回傳值 */
	result: TResult
}

/** splitByPeriod 的快照（runCases + snapshot:true）。 */
export type ISplitByPeriodSnap = IRunCasesSnap<unknown, ISplitByPeriodArgs, IPromptTagValue[]>

/** genPrompt 的快照（runCases + snapshot:true）。 */
export type IGenPromptSnap = IRunCasesSnap<IPromptTag[], IGenPromptArgs, string>

/**
 * splitTags 單獨測試的快照（runSplitTagsTests，未接 splitByPeriod）。
 * 此時只記錄第一階段結果，欄位名為 result。
 */
export interface ISplitTagsSnap extends IOriginalComparisonSnap {
	/** 傳入 splitTags 的輸入（可能是非字串防禦值） */
	input: unknown
	/** splitTags 的切割結果 */
	result: IPromptTagValue[]
}

/**
 * splitTags → splitByPeriod 串接管線快照（runSplitTagsTests，已接 splitByPeriod）。
 * 管線時 splitTags 的結果改以 splitTagsResult 命名，並額外記錄管線階段。
 */
export interface ISplitTagsPipelineSnap extends IOriginalComparisonSnap {
	/** 傳入 splitTags 的輸入 */
	input: unknown
	/** 第一階段（splitTags）的切割結果 */
	splitTagsResult: IPromptTagValue[]
	/** splitByPeriod 是否改變了 splitTags 的輸出 */
	splitByPeriodChanged: boolean
	/** 僅在 splitByPeriodChanged=true 時寫入的管線最終結果 */
	splitByPeriodResult?: IPromptTagValue[]
}

/**
 * updatePrompt 快照的 args 區塊。
 * 選項巢狀於 options（與 IUpdatePromptHost.options 同形），
 * 未傳的旗標補 false、兩鍵固定出現，便於跨案例對照。
 */
export interface IUpdatePromptSnapArgs {
	/** 注入宿主的換行選項（tc.options，未傳的旗標補 false） */
	options: Required<Pick<IHostPromptOptions, 'autoBreakBeforeWrap' | 'autoBreakAfterWrap'>>
	/** 是否注入真 genPrompt（個別測試為 false，複合測試為 true） */
	usesRealGenPrompt: boolean
}

/**
 * updatePrompt 的快照（runUpdatePromptTests）。
 * 被測函式無回傳值，故以宿主替身收集的執行摘要落盤。
 */
export interface IUpdatePromptSnap {
	/** 案例持有的標籤陣列（tc.tags） */
	input: readonly IPromptTag[]
	/** 執行參數：注入宿主的選項（預設值已補齊）與是否注入真 genPrompt */
	args: IUpdatePromptSnapArgs
	/** 宿主 appendTag 收到的參數（依呼叫順序） */
	appended: IUpdatePromptAppendRecord[]
	/** refresh 呼叫次數 */
	refreshCount: number
	/** commit 收到的 prompt（未提交時為空陣列） */
	committed: string[]
}
