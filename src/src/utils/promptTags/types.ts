import { IPromptOptionValueRecordWithLegacy, IPromptOptionValueRecordWithLegacyRuntime } from '../promptOptions/definitions';

/**
 * 產生 prompt 所需的選項集合。
 *
 * 等同 phystonPrompt.vue 的 this 所取得的參數
 */
export type IHostPromptOptions = IPromptOptionValueRecordWithLegacyRuntime & {
	/**
	 * loadExtraNetworks() 是否已呼叫過（App data 的同名鏡像 prop）。
	 * genPromptCore 據此只在尚未載入時，於首次輸出 extra networks tag 時要求載入。
	 */
	requestLoadExtraNetworksCalled?: boolean;
	/** 目前編輯的是反向提示詞：一般 tag 會加上 neg-tag */
	neg?: boolean;
}
