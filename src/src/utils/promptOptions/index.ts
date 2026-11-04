/**
 * promptOptions 模組入口：由 definitions.ts 的選項定義生成各元件所需的樣板資料。
 *
 * 生成目標:
 *   - App.vue data() 預設值            → getPromptOptionData()
 *   - App.vue watch                    → getPromptOptionWatchers()
 *   - App.vue init() dataListsKeys     → promptOptionStorageKeys
 *   - App.vue init() 載入回填          → loadPromptOptions()
 *   - phystonPrompt.vue props          → getPromptOptionProps()
 *   - promptFormat.vue props / emits  → getPromptOptionProps() / getPromptOptionEmits('promptFormat')
 *   - promptFormat.vue checkbox 樣板   → getPromptOptionChecks('promptFormat')
 */

import { IPromptOptionKey, IPromptOptionKeyAndLegacyStorage, IPromptOptionKeyLegacyStorage, IPromptOptionValue, IPromptOptionValueDefaultKey, IPromptOptionValueRecord, IPromptOptionValueRecordWithLegacy, promptOptions } from './definitions'
import { EnumPromptOptionAfterSave, IPromptOptionCheck, IPromptOptionCheckWithValue, type IPromptOptionComponent, type IPromptOptionPropBoolean, type IPromptOptionWatcher } from './types'

export { promptOptions } from './definitions'
export type { IPromptOptionAfterSave, IPromptOptionComponent, IPromptOptionPropBoolean, IPromptOptionWatcher } from './types'

/**
 * watcher handler 內部所需的 App 實例最小結構。
 *
 * 只宣告 handler 實際存取的成員，避免與 App.vue 全域型別耦合。
 */
interface I_PromptOptionWatchHost {
    /**
     * 初始化完成前為 false，用於抑制載入期間的寫入。
     */
    startWatchSave: boolean
    /** 後端存檔 API，選項鍵即存檔鍵 / backend persistence where the option key is the storage key */
    gradioAPI: { setData: (key: string, value: unknown) => Promise<unknown> }
    /** 需要重新產生輸出的 prompt 清單 / prompts whose refs get refreshed after save */
    prompts: ReadonlyArray<{ id: string }>
    /** 以 prompt id 索引的子元件 ref，用於呼叫 applySplitByPeriod() / updatePrompt() */
    $refs: Record<string, Array<{ applySplitByPeriod: () => void; updatePrompt: () => void }>>
}

/**
 * 以所有選項鍵建立「鍵 → 預設值」的完整記錄表。
 * 作為 App.vue data() 預設值與測試 helper 的共用產生點，確保兩者不會各自漂移。
 *
 * @param defaultKey - 取用的預設值欄位 ('dataDefault' | 'propDefault')
 * @returns 以所有 IPromptOptionKey 為索引的預設值記錄表
 */
export function _getPromptOptionValueRecord(defaultKey?: IPromptOptionValueDefaultKey) {
    defaultKey = defaultKey || 'propDefault'
    const data = {} as IPromptOptionValueRecord
    for (const option of promptOptions) {
        data[option.key] = option[defaultKey]
    }
    return data
}

/**
 * 生成 App.vue data() 使用的預設值表。
 *
 * 預設值取自 dataDefault（可能與子元件 propDefault 不同，如 autoRemoveSpace）。
 *
 * @deprecated
 */
export function getPromptOptionData() {
    return _getPromptOptionValueRecord('dataDefault')
}

/**
 * 生成 App.vue watch 使用的監聽器表。
 *
 * 行為由 afterSave 決定：
 *   saveOnly          → 僅儲存（原樣保留原行為）
 *   updatePrompt      → 儲存後對所有 prompt 執行 updatePrompt()
 *   resplitAndPrompt  → 儲存後先 applySplitByPeriod() 再 updatePrompt()
 */
export function getPromptOptionWatchers(): Record<IPromptOptionKey, IPromptOptionWatcher> {
    const watchers = {} as Record<IPromptOptionKey, IPromptOptionWatcher>
    for (const option of promptOptions) {
        watchers[option.key] = {
            handler: function (this: I_PromptOptionWatchHost, value: boolean) {
                /**
                 * 初始化期間 startWatchSave 為 false，期間的 watch 觸發源自 init() 回填，
                 * 若照常儲存會以尚未就緒的狀態覆蓋後端存檔，因此直接略過。
                 */
                if (!this.startWatchSave) return
                console.log(`on${option.key}Change`, value)
                /**
                 * 先完成持久化再重整 UI，確保重新產生的輸出反映的是已存檔的值；
                 * 存檔失敗時靜默忽略，避免未處理的 Promise rejection 中斷介面操作。
                 */
                this.gradioAPI.setData(option.key, value).then(() => {
                    if (option.afterSave === EnumPromptOptionAfterSave.saveOnly) return
                    /**
                     * 各 prompt 的 ref 可能尚未掛載（例如面板尚未渲染），
                     * 缺少 ref 時略過該筆，不將邊界檢查外洩至 mixin。
                     */
                    this.prompts.forEach(item => {
                        const promptRef = this.$refs[item.id] && this.$refs[item.id][0]
                        if (!promptRef) return
                        /**
                         * resplitAndPrompt 需先在 tags 陣列層重新分割，updatePrompt() 才有正確的輸入。
                         */
                        if (option.afterSave === EnumPromptOptionAfterSave.resplitAndPrompt) promptRef.applySplitByPeriod()
                        promptRef.updatePrompt()
                    })
                }).catch(() => {
                })
            },
            immediate: false,
        }
    }
    return watchers
}

/**
 * dataListsKeys 需要的存檔鍵（含遷移用舊鍵）。
 */
export const promptOptionStorageKeys = promptOptions.flatMap(option =>
    [option.key, ...(option.legacyStorageKeys ?? [])] satisfies IPromptOptionKeyAndLegacyStorage[],
)

/**
 * 將 getDatas() 回傳的資料回填到目標物件（App.vue init() 內使用）。
 *
 * 任一選項主鍵為空時，依序嘗試其 legacyStorageKeys（舊鍵遷移）；
 * 主鍵與舊鍵皆為空則保留預設值。語義等同原本逐鍵的 if (data.x !== null) 區塊。
 */
export function loadPromptOptions(target: IPromptOptionValueRecord, data: IPromptOptionValueRecordWithLegacy): void {
    for (const option of promptOptions) {
        let value = data[option.key]
        /**
         * 主鍵尚未儲存過時嘗試舊鍵：更名前的使用者設定仍可沿用，避免升級後設定被重置。
         */
        if (value === null || value === undefined) {
            for (const legacyKey of option.legacyStorageKeys ?? []) {
                const legacyValue = data[legacyKey]
                /**
                 * 命中第一個有值的舊鍵即停止：舊鍵之間不存在可合併的語意，先列者優先。
                 */
                if (legacyValue !== null && legacyValue !== undefined) {
                    value = legacyValue
                    break
                }
            }
        }
        /**
         * 主鍵與舊鍵皆未儲存時保留呼叫端傳入的預設值，維持 data() 的初始狀態。
         */
        if (value === null || value === undefined) continue
        target[option.key] = value
    }
}

/**
 * 生成子元件（phystonPrompt.vue / promptFormat.vue）的 props 表。
 *
 * 所有 prompts 系列選項皆為 Boolean；預設值取自 propDefault。
 */
export function getPromptOptionProps() {
    const props = {} as Record<IPromptOptionKey, IPromptOptionPropBoolean>
    for (const option of promptOptions) {
        props[option.key] = {type: Boolean, default: option.propDefault}
    }
    return props
}

/**
 * 構建選項的 v-model 事件名（'update:key'）。
 */
export function _buildPromptOptionEmit(key: IPromptOptionKey) {
    return `update:${key}` as const
}

/**
 * 生成指定子元件的 emits（v-model 事件名 'update:key'）列表。
 *
 * 僅列入該元件實際會 emit 的選項（definitions 的 emittedBy）：
 * Vue 3 的 emits 是宣告而非開關——未宣告的 $emit 仍會觸達父層，
 * 因此宣告應反映「實際用途」，避免維護一份會與現實脫節的清單。
 */
export function getPromptOptionEmits(component: IPromptOptionComponent) {
    return promptOptions
        .filter(option => option.emittedBy.includes(component))
        .map(option => _buildPromptOptionEmit(option.key))
}

/**
 * 生成指定元件 checkbox 面板的樣板結構清單（順序即定義表順序 = UI 呈現順序）。
 *
 * 僅列入填寫了 checkUi 的選項；emitEvent 由 _buildPromptOptionEmit 統一構建。
 * 「目前值（value）」與「子選項啟用時才顯示」屬執行期狀態，不在此處理，
 * 分別由 withPromptOptionCheckValues / filterPromptOptionCheckVisible 封裝。
 */
export function getPromptOptionChecks(component: IPromptOptionComponent): IPromptOptionCheck[] {
    const checks: IPromptOptionCheck[] = []
    for (const option of promptOptions) {
        if (!option.emittedBy.includes(component)) continue
        if (!option.checkUi) continue
        checks.push({
            key: option.key,
            labelLangKey: option.checkUi.labelLangKey,
            parentKey: option.checkUi.parentKey,
            emitEvent: _buildPromptOptionEmit(option.key),
        })
    }
    return checks
}

/**
 * 為 checkbox 結構補上目前值 value。
 *
 * values 允許缺失部分鍵值：缺鍵時該筆 value 為 undefined，checkbox 呈現未勾選。
 * 傳入 Vue 元件實例（this）時，屬性讀取經過響應式 proxy，
 * 在 computed 內呼叫可正確收集依賴——任一選項 prop 變動都會觸發重算。
 */
export function withPromptOptionCheckValues(
    checks: readonly IPromptOptionCheck[],
    values: Partial<IPromptOptionValueRecordWithLegacy>,
): IPromptOptionCheckWithValue[] {
    return checks.map(option => {
        return {
            ...option,
            value: values[option.key],
        }
    })
}

/**
 * 依父選項目前值過濾子選項。
 *
 * 無 parentKey 者一律保留；有 parentKey 者僅在 values[parentKey] 為真時保留
 * （父選項啟用時子選項才顯示）。泛型回傳保留輸入的欄位結構。
 */
export function filterPromptOptionCheckVisible<T extends IPromptOptionCheck>(
    checks: readonly T[],
    values: Partial<IPromptOptionValueRecordWithLegacy>,
): T[] {
    return checks.filter(option => !option.parentKey || values[option.parentKey])
}
