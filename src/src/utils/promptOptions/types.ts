/**
 * promptOptions 模組的型別定義。
 */
import type { ITSTypeAndStringLiteral } from 'ts-type'
import { IPromptOptionCheckUi, IPromptOptionCheckUiLabelLangKey, IPromptOptionDefinition, IPromptOptionKey, IPromptOptionValue } from './definitions'

/**
 * 實際會 emit 該選項 v-model 事件（update:key）的子元件。
 * Child components that actually emit the option's v-model event (update:key).
 *
 * Note：Vue 3 的 emits 僅是宣告/排除 $attrs 穿透，$emit 未宣告仍可觸達父層；
 * 因此 emits 宣告應只列「實際會 emit」的事件，其餘（僅由父層 prop 傳入）不宣告。
 */
export const enum EnumPromptOptionComponent {
    phystonPrompt = 'phystonPrompt',
    promptFormat = 'promptFormat',
}

/**
 * 實際會 emit 該選項 v-model 事件（update:key）的子元件。
 *
 * 相容於 js 調用
 */
export type IPromptOptionComponent = ITSTypeAndStringLiteral<EnumPromptOptionComponent>

/**
 * 選項儲存完成後的後續動作。
 * Follow-up action executed after an option value is persisted.
 */
export const enum EnumPromptOptionAfterSave {
    /** 僅儲存 (Persist)，不重新產生輸出 */
    saveOnly = 'saveOnly',
    /** 儲存後對所有 prompt 執行 updatePrompt() */
    updatePrompt = 'updatePrompt',
    /** 儲存後先重新分割 tags 陣列，再重新產生輸出 */
    resplitAndPrompt = 'resplitAndPrompt',
}

/**
 * 選項儲存完成後的後續動作。
 *
 * 相容於 js 調用
 */
export type IPromptOptionAfterSave = ITSTypeAndStringLiteral<EnumPromptOptionAfterSave>

/**
 * 單一「prompts 系列選項」的定義。
 *
 * 一筆定義同時驅動：App.vue 的 data() / watch / dataListsKeys / init()，
 * 以及 phystonPrompt.vue 與 promptFormat.vue 的 props、emits。
 */
export interface IPromptOptionDefinitionCore {
    /**
     * App.vue data() 的預設值。
     */
    dataDefault: boolean
    /**
     * 子元件 props 的預設值（父層未傳入時套用）。
     */
    propDefault: boolean
    /**
     * 儲存完成後的後續動作。
     * Follow-up action after the value is persisted.
     */
    afterSave: IPromptOptionAfterSave
    /**
     * 實際會 emit 此選項 v-model 事件的子元件（決定 emits 宣告，不影響 props）。
     */
    emittedBy: readonly IPromptOptionComponent[]
    /**
     * 選項行為說明，僅供維護者閱讀，不影響執行。
     */
    note: string
}

/**
 * checkbox 樣板結構的單筆項目（產生器輸出型別）。
 *
 * 欄位皆為靜態資料：由 getPromptOptionChecks 一次生成，
 * 元件端以 emitEvent 直接 $emit、以 key / labelLangKey / parentKey 渲染。
 */
export interface IPromptOptionCheck extends IPromptOptionCheckUi, Pick<IPromptOptionDefinition, 'key'> {
    /**
     * v-model 事件名（'update:key'）：由 _buildPromptOptionEmit 構建，
     * 元件模板直接以 $emit(emitEvent, ...) 呼叫。
     */
    emitEvent: `update:${IPromptOptionKey}`
}

/**
 * 補上「目前值」的 checkbox 結構（withPromptOptionCheckValues 輸出型別）。
 *
 * value 取自呼叫端傳入的值記錄表；記錄表允許缺鍵（Partial），缺鍵時為 undefined。
 */
export interface IPromptOptionCheckWithValue extends IPromptOptionCheck {
    /**
     * 選項目前值。
     * Current value of the option (undefined when the value record lacks the key).
     */
    value: IPromptOptionValue | undefined
}

/**
 * Vue watch 選項物件（產生器輸出型別）。
 */
export interface IPromptOptionWatcher {
    handler: (this: unknown, value: boolean, oldValue: boolean) => void
    immediate: boolean
}

/**
 * Vue props 定義物件（產生器輸出型別）。
 */
export interface IPromptOptionPropBoolean {
    type: BooleanConstructor
    default: boolean
}
