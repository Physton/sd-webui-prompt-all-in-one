/**
 * 「prompts 系列選項」的定義表。
 * Definition table for the prompts-family options.
 *
 * 這裡的每一筆定義會同時驅動：
 *   - src/src/App.vue              ：data() 預設值、watch、dataListsKeys、init() 載入
 *   - src/src/components/phystonPrompt.vue ：props
 *   - src/src/components/promptFormat.vue  ：props、emits、checkbox 樣板（v-for，由 checkUi 生成）
 *
 * 新增選項時只需在此加入一筆定義（並補上 i18n），checkbox 樣板會自動生成，
 * 無需再逐一修改上述四處樣板碼，避免漏改造成「重新整理後設定遺失」一類的缺陷。
 *
 * 但仍須手動更新 src/src/App.vue 的 v-model 綁定：<physton-prompt> 與
 * <prompt-format> 兩處各補一行 v-model:kebab-case-key="dataKey"，
 * 否則選項值不會流入子元件（data 預設值、watch、dataListsKeys 仍由此表生成）。
 */

import { EnumPromptOptionAfterSave, EnumPromptOptionComponent, type IPromptOptionDefinitionCore } from './types'

interface I_PromptOptionDefinition extends IPromptOptionDefinitionCore {
    /**
     * 選項鍵名：同時作為 data 鍵、後端存檔鍵與 v-model 名稱。
     */
    key: string
    /**
     * 已更名或棄用的舊存檔鍵（僅供載入遷移讀取，不再寫入）。
     * Legacy storage keys kept read-only for migration on load.
     */
    legacyStorageKeys?: readonly string[]

    /**
     * checkbox 面板的呈現資訊：填寫後由定義表生成 checkbox 樣板結構（promptFormat.vue v-for）。
     * 未填寫者不生成 checkbox（如純 prop 選項）。
     */
    checkUi?: I_PromptOptionCheckUi<string, string>
}

interface I_PromptOptionCheckUi<I18nKey extends string, PromptOptionKey extends string> {
    /**
     * checkbox 說明文字的 i18n 鍵。
     * i18n key of the checkbox description.
     */
    labelLangKey: I18nKey
    /**
     * 父選項鍵名：填寫後成為子選項——僅在父選項啟用時顯示，並以縮排呈現。
     * Parent option key: shown only when the parent is enabled, rendered indented.
     */
    parentKey?: PromptOptionKey
}

/**
 * prompts 系列選項定義清單（順序即 UI / dataListsKeys 的呈現順序）。
 */
const _promptOptions = [
    {
        key: 'autoRemoveSpace',
        /** App.vue data() 的預設值 */
        dataDefault: false,
        /** 子元件未傳入時的預設 */
        propDefault: false,
        afterSave: EnumPromptOptionAfterSave.updatePrompt,
        /** phystonPrompt 頭部選單與 promptFormat checkbox 皆有會 emit 此選項的 UI / emitting UIs exist in both components */
        emittedBy: [EnumPromptOptionComponent.phystonPrompt, EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_remove_space'},
        note: '移除 tag 前後多餘空白；變更後需重新產生輸出。',
    },
    {
        key: 'autoRemoveLastComma',
        dataDefault: true,
        propDefault: true,
        afterSave: EnumPromptOptionAfterSave.updatePrompt,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_remove_last_comma'},
        note: '移除輸出結尾多餘逗號；變更後需重新產生輸出。',
    },
    {
        key: 'autoKeepWeightZero',
        dataDefault: true,
        propDefault: true,
        afterSave: EnumPromptOptionAfterSave.saveOnly,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_keep_weight_zero'},
        note: '權重為 0 時保留 (x:0)；僅需儲存設定。',
    },
    {
        key: 'autoKeepWeightOne',
        dataDefault: false,
        propDefault: false,
        afterSave: EnumPromptOptionAfterSave.saveOnly,
        /** 兩個子元件都沒有會 emit 此選項的 UI（無 checkbox），屬純 prop 選項 */
        emittedBy: [],
        note: '權重為 1 時保留 (x:1)；僅需儲存設定。',
    },
    {
        key: 'autoBreakBeforeWrap',
        dataDefault: true,
        propDefault: true,
        afterSave: EnumPromptOptionAfterSave.updatePrompt,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_break_before_wrap'},
        note: '分行標籤前自動插入 BREAK；變更後需重新產生輸出。',
    },
    {
        key: 'autoBreakAfterWrap',
        dataDefault: true,
        propDefault: true,
        afterSave: EnumPromptOptionAfterSave.updatePrompt,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_break_after_wrap'},
        note: '分行標籤後自動插入 BREAK；變更後需重新產生輸出。',
    },
    {
        key: 'autoRemoveLoraBeforeComma',
        dataDefault: false,
        propDefault: false,
        afterSave: EnumPromptOptionAfterSave.saveOnly,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_remove_lora_before_comma'},
        note: '移除 Lora 標籤前的逗號；僅需儲存設定。',
    },
    {
        key: 'autoRemoveLoraAfterComma',
        dataDefault: false,
        propDefault: false,
        afterSave: EnumPromptOptionAfterSave.saveOnly,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_remove_lora_after_comma'},
        note: '移除 Lora 標籤後的逗號；僅需儲存設定。',
    },
    {
        key: 'autoRemoveDuplicateLora',
        dataDefault: true,
        propDefault: true,
        afterSave: EnumPromptOptionAfterSave.updatePrompt,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_remove_duplicate_lora'},
        note: '消除重複 Lora / Lyco：以名稱為重複鍵（權重不視為差異），重複時保留最後一個、移除較早者。# 之後與 disabled 的 Lora 不參與去重。僅在 genPrompt() 輸出層過濾，不修改 tags 陣列，因此只需重新產生輸出。',
    },
    {
        key: 'useNovelAiWeightSymbol',
        dataDefault: false,
        propDefault: false,
        afterSave: EnumPromptOptionAfterSave.saveOnly,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_use_novel_ai_weight_symbol'},
        note: '使用 NovelAI 權重符號（[] 語法）；僅需儲存設定。',
    },
    {
        key: 'autoRemoveBeforeLineComma',
        dataDefault: false,
        propDefault: false,
        afterSave: EnumPromptOptionAfterSave.saveOnly,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_remove_before_line_comma'},
        note: '移除分行標籤前一行結尾的逗號；僅需儲存設定。',
    },
    {
        key: 'autoOptimizeSplitSymbol',
        dataDefault: false,
        propDefault: false,
        afterSave: EnumPromptOptionAfterSave.resplitAndPrompt,
        /** 舊存檔鍵遷移：更名前的使用者設定；後續寫入一律走新鍵 / read-only legacy key, writes always use the new key */
        legacyStorageKeys: ['autoSplitByPeriodRemoveWrapComma'],
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        /** 無 parentKey：獨立頂層選項（不再屬於 autoSplitByPeriod 子選項），不縮排 */
        checkUi: {labelLangKey: 'is_auto_optimize_split_symbol'},
        note: '自動優化分割符號（獨立選項，不再屬於 autoSplitByPeriod 子選項）。其分行前條件（「:」結尾 / 該行含 # tag / 分行前為 Lora）在 genPrompt() 輸出層直接判定，並影響 noCommaAfter 標記，因此需同時 applySplitByPeriod() 與 updatePrompt()。',
    },
    {
        key: 'allowKeepEmptyLine',
        dataDefault: true,
        propDefault: true,
        afterSave: EnumPromptOptionAfterSave.saveOnly,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_allow_keep_empty_line'},
        note: '僅影響 prompt 解析階段（splitTags 的連續換行壓縮上限），不影響輸出格式，因此只需儲存設定；下次解析（載入提示詞 / 輸入變動）時生效。',
    },
    {
        key: 'autoRepairMojibake',
        dataDefault: true,
        propDefault: true,
        afterSave: EnumPromptOptionAfterSave.saveOnly,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_auto_repair_mojibake'},
        note: '僅影響 prompt 解析階段：splitTags 入口先以 repairMojibake() 還原被以 Latin-1/Windows-1252 誤讀的 UTF-8 文字，再清理與切割。不影響輸出格式，因此只需儲存設定；下次解析（載入提示詞 / 輸入變動）時生效。',
    },
    {
        key: 'autoSplitByPeriod',
        dataDefault: true,
        propDefault: true,
        afterSave: EnumPromptOptionAfterSave.resplitAndPrompt,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        /** 以下兩個子選項以此為 parentKey：啟用時才顯示並縮排 */
        checkUi: {labelLangKey: 'is_split_by_period'},
        note: '選項變更時，先分割 tags 陣列，再重新產生輸出。原因：僅呼叫 updatePrompt() 只會在輸出字串層級分割，tags 陣列不會被修改，導致 UI 顯示與輸出不一致，因此需先呼叫 applySplitByPeriod() 同步修改 tags。',
    },
    {
        key: 'autoSplitByPeriodIncludeParen',
        dataDefault: true,
        propDefault: true,
        afterSave: EnumPromptOptionAfterSave.updatePrompt,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_split_by_period_include_paren', parentKey: 'autoSplitByPeriod'},
        note: '控制是否允許拆分括號前的 ". "（如 "word1. (test)"）。由於 tags 已在 autoSplitByPeriod 開啟時被分割，此選項的變更不會影響已分割的 tags，僅影響後續新載入標籤的分割行為，因此只需重新產生輸出。',
    },
    {
        key: 'autoSplitByPeriodSemicolon',
        dataDefault: true,
        propDefault: true,
        afterSave: EnumPromptOptionAfterSave.resplitAndPrompt,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_split_by_period_semicolon', parentKey: 'autoSplitByPeriod'},
        note: '控制 ";" 是否併入句號機制成為分割點；需重新執行 applySplitByPeriod() 才能將既有含分號的 tag 分割。/ Whether ";" joins the period split points; re-run applySplitByPeriod() to split existing tags.',
    },
    {
        key: 'autoKeywordToPlain',
        dataDefault: true,
        propDefault: true,
        afterSave: EnumPromptOptionAfterSave.resplitAndPrompt,
        emittedBy: [EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_keyword_to_plain'},
        note: '自動使特定關鍵字變成普通提示詞（目前僅 AND → And）：只改寫關鍵字 tag 的值，切割、noCommaBefore / noCommaAfter 標記與其餘機制完全不變，因此需先 applySplitByPeriod() 改寫既有關鍵字 tag 的值，再重新產生輸出。',
    },
] as const satisfies I_PromptOptionDefinition[]

/** 由常數陣列推導的單筆選項定義型別 */
type I_PromptOptionEntry = typeof _promptOptions[number]

/** 從選項定義抽出 legacyStorageKeys 的字面聯合型別 (Literal Union)；未定義舊鍵者回傳 never */
type I_ExtractLegacyStorageKeys<T> = T extends Pick<I_PromptOptionDefinition, 'legacyStorageKeys'> ? T['legacyStorageKeys'][number] : never

/** 從選項定義抽出 checkUi.labelLangKey 的字面聯合型別 (Literal Union)；未定義者回傳 never */
type I_ExtractCheckUiLabelLangKey<T> = T extends Pick<I_PromptOptionDefinition, 'checkUi'> ? T['checkUi']['labelLangKey'] : never

export type IPromptOptionCheckUiLabelLangKey = I_ExtractCheckUiLabelLangKey<I_PromptOptionEntry>

/**
 * 選項鍵名：同時作為 data 鍵、後端存檔鍵與 v-model 名稱。
 */
export type IPromptOptionKey = I_PromptOptionEntry['key']
/** 僅供載入遷移讀取的舊存檔鍵型別 / legacy storage keys, read-only on load */
export type IPromptOptionKeyLegacyStorage = I_ExtractLegacyStorageKeys<I_PromptOptionEntry>
/** 主鍵與舊鍵的聯合：用於接住後端回傳的完整存檔資料 */
export type IPromptOptionKeyAndLegacyStorage = IPromptOptionKey | IPromptOptionKeyLegacyStorage

/** 可取用的預設值欄位名（'dataDefault' | 'propDefault'） */
export type IPromptOptionValueDefaultKey = keyof Pick<I_PromptOptionEntry, 'dataDefault' | 'propDefault'>

/** 選項值型別：以定義的 dataDefault 推導並放寬至 boolean */
export type IPromptOptionValue = I_PromptOptionEntry['dataDefault'] | boolean

/**
 * 對外揭露的選項值記錄表：以 IPromptOptionKey 為索引的鍵值對。
 */
export type IPromptOptionValueRecord = Record<IPromptOptionKey, IPromptOptionValue>

/**
 * 對外揭露的選項值記錄表：包含主鍵與舊鍵的聯合索引。
 */
export type IPromptOptionValueRecordWithLegacy = Record<IPromptOptionKeyAndLegacyStorage, IPromptOptionValue>

/** 運行時的選項值記錄表：包含主鍵與舊鍵的聯合索引（選填） */
export type IPromptOptionValueRecordWithLegacyRuntime = Partial<IPromptOptionValueRecordWithLegacy>

export type IPromptOptionCheckUi = I_PromptOptionCheckUi<IPromptOptionCheckUiLabelLangKey, IPromptOptionKey>

/**
 * 對外揭露的選項定義型別：鍵名收斂為 IPromptOptionKey、舊鍵收斂為 IPromptOptionKeyLegacyStorage。
 */
export interface IPromptOptionDefinition extends IPromptOptionDefinitionCore {
    /**
     * 選項鍵名：同時作為 data 鍵、後端存檔鍵與 v-model 名稱。
     */
    key: IPromptOptionKey
    /**
     * 已更名或棄用的舊存檔鍵（僅供載入遷移讀取，不再寫入）。
     */
    legacyStorageKeys?: readonly IPromptOptionKeyLegacyStorage[]

    /**
     * checkbox 面板的呈現資訊：填寫後由定義表生成 checkbox 樣板結構（promptFormat.vue v-for）。
     * 未填寫者不生成 checkbox（如純 prop 選項）。
     */
    checkUi?: IPromptOptionCheckUi
}

/**
 * prompts 系列選項定義清單（順序即 UI / dataListsKeys 的呈現順序）。
 */
export const promptOptions = _promptOptions as readonly IPromptOptionDefinition[]
