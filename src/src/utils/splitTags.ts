import { trimPromptText } from './trimPromptText'
import { repairMojibake } from './repairMojibake'
import {
    EnumPromptBracketClose,
    EnumPromptBracketOpen,
    EnumPromptBreakKeyword,
    EnumPromptQuoteChar,
    EnumPromptSplitMarker,
    isPromptBracketOpen,
    promptBracketPairs,
    type IPromptBracketClose,
    type IPromptBracketOpen,
} from './splitPromptTypes'
import { _isNotAllowedValueOrEmpty, _normalizeTagValueAndTrim } from './promptTags/util/tag-normalize'
import { splitLoraTagSegments } from './promptTags/util/tag-lora'
import { IPromptTagValue, IPromptTagValueRuntimeInput } from './promptTags/tag-types'
import { IPromptOptionValueRecordWithLegacyRuntime } from './promptOptions/definitions'

/**
 * 行級 runtime 狀態介面。
 * 所有「僅作用於當前行」的變數集中於此，分行時由 reset() 一併重置。
 */
export interface IPromptLineState {
    /** null = 不在引號內；EnumPromptQuoteChar = 目前開啟的引號字元（不跨行保留） */
    quoteChar: EnumPromptQuoteChar | null
    /** 目前括號巢狀深度 */
    bracketCount: number
    /** 目前開啟的開括號（'' = 無括號） */
    startBracketChar: IPromptBracketOpen | ''
    /** 目前括號對應的閉括號（'' = 無括號） */
    endBracketChar: IPromptBracketClose | ''
    /** 重置括號狀態（逗號 / BREAK 分段時使用；引號不受影響） */
    resetBracket(): void
    /** 行級完整重置（分行時使用）：結束引號 + 重置括號 */
    reset(): void
}

/**
 * 表情符號保護占位組。
 */
interface IEmojiGuard {
    /** 表情符號原文 */
    emoji: string
    /** 對應的比對正則（全域） */
    re: RegExp
}

/**
 * 表情符號占位符：切割期間以占位符取代表情，避免被誤判為括號/標點。
 *
 * @param {number} index - 表情在 EMOJI_GUARDS 中的索引
 * @returns {string}
 */
const emojiPlaceholder = (index: number): string => `|||EXPRESSION${index}|||`

/** 受保護的表情符號清單（索引即占位符編號，兩端共用）。 */
const EMOJI_GUARDS: readonly IEmojiGuard[] = [
    { emoji: ">_<", re: /\>_\</g },
    { emoji: ":<", re: /\:\</g },
    { emoji: ">:<", re: /\>\:\</g },
    { emoji: ":>", re: /\:\>/g },
    { emoji: ":-(", re: /\:\-\(/g },
    { emoji: ":-)", re: /\:\-\)/g },
]

/** 「空白 + BREAK」字串：用於偵測段尾 BREAK 並移除。 */
const BREAK_WITH_SPACE = ' ' + EnumPromptBreakKeyword.BREAK

/**
 * splitTags 側邊鉤子（獨立第 5 參數）。
 *
 * 鉤子不放進選項參數：IPromptOptionValueRecordWithLegacyRuntime 僅承載
 * 選項值（純資料記錄），回呼類的非選項資料一律以獨立參數傳入，
 * 不與選項記錄混用。
 * Runtime hooks live in a dedicated parameter; the options record stays
 * a pure option-value record.
 */
export interface ISplitTagsHooks {
    /** JSON 物件防護通知：輸入為合法 {} JSON、切割被跳過（整段保留單一 tag）時呼叫。
     *  text 為清理（與可選修復）後的完整字串，
     *  供 UI 提示「該字串為 JSON、已忽略切割處理」。 */
    onJsonIgnored?: (text: string) => void
}

/**
 * 是否為「{} 包裹且 JSON.parse 成功」的物件字串。
 *
 * 只認完整合法的 JSON 物件；陣列、純值與殘缺 JSON 照常切割。
 * 刻意不解析內容尋找提示詞欄位：以 ComfyUI 工作流 meta 為例，
 * 可攜帶提示詞的節點種類過多且格式不統一，無法可靠分析，
 * 故整段當作不透明值保留。
 *
 * @param {string} text - 待判定字串（以 trim 後的外觀判定）
 * @returns {boolean}
 */
function isJsonObjectText(text: string): boolean {
    const trimmed = text.trim()
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return false
    try {
        JSON.parse(trimmed)
        return true
    } catch {
        return false
    }
}

/**
 * 分割标签（对外入口）。
 *
 * 處理前先以 trimPromptText() 清理輸入：清除不可見字元（\x00、\u200b）
 * 及其 mojibake 序列（Latin-1 / Windows-1252 兩種誤讀變體），並修剪
 * 邊界水平空白（保留換行結構）。options.autoRepairMojibake 開啟時，
 * 清理之前更先以 repairMojibake() 還原整段 mojibake 文字。
 * 輸入若為合法 {} JSON（如 ComfyUI 工作流 meta），修復與清理照做，
 * 但不進入切割：整段保留為單一 tag，並呼叫 options.onJsonIgnored。
 *
 * @param {IPromptTagValueRuntimeInput} tags
 * @param {boolean} autoBreakBeforeWrap
 * @param {boolean} autoBreakAfterWrap
 * @param {IPromptOptionValueRecordWithLegacyRuntime} [options] - 選項值記錄（純資料），集中擴充避免參數隨功能增加而爆炸。
 * @param {ISplitTagsHooks} [hooks] - 側邊鉤子（回呼類非選項資料），獨立傳入、不混入選項記錄。
 * @returns {IPromptTagValue[]}
 */
export function splitTags(tags: IPromptTagValueRuntimeInput, autoBreakBeforeWrap = false, autoBreakAfterWrap = false, options: IPromptOptionValueRecordWithLegacyRuntime = {}, hooks: ISplitTagsHooks = {}): IPromptTagValue[] {
    if (_isNotAllowedValueOrEmpty(tags)) return []
    let input: string = tags
    if (options.autoRepairMojibake) {
        input = repairMojibake(input).text
    }
    input = trimPromptText(input)
    /**
     * JSON 物件防護：修復與清理照做（上方已完成），但不進入切割——
     * 內容無法可靠分析（見 isJsonObjectText），整段保留並通知呼叫端。
     */
    if (isJsonObjectText(input)) {
        hooks.onJsonIgnored?.(input)
        return [input]
    }
    return splitRaw(input, true, autoBreakBeforeWrap, autoBreakAfterWrap, options)
}

export default splitTags

/**
 * 建立「僅作用於當前行」的 runtime 狀態物件。
 *
 * 為何集中管理：過去行級變數（引號、括號）以散落的個別變數維護，
 * 分行時逐一手列重置，發生過「新增行級變數卻忘了納入重置清單」的遺漏
 * （quoteChar 未隨分行重置 → 未關閉引號跨行吞掉整段後續標籤，產生孤兒逗號 tag）。
 * 集中為單一物件後，重置只需一行 lineState.reset()，
 * 未來新增行級變數只需加進 createLineState() 與 reset()，不會再有遺漏。
 *
 * @returns {IPromptLineState}
 */
function createLineState(): IPromptLineState {
    return {
        quoteChar: null,
        bracketCount: 0,
        startBracketChar: '',
        endBracketChar: '',
        resetBracket() {
            this.bracketCount = 0
            this.startBracketChar = ''
            this.endBracketChar = ''
        },
        reset() {
            this.quoteChar = null
            this.resetBracket()
        },
    }
}

/**
 * 分割核心（可遞迴重處理）。
 *
 * @param {string}  tags
 * @param {boolean} allowSingleQuote - 是否允許單引號開啟引號。
 *   主呼叫為 true；當分段（分行或收尾）時發現單引號未關閉（quoteChar 為單引號），
 *   該段會以 false 遞迴重處理——忽略此未關閉的單引號，
 *   重新套用逗號／分行／BREAK／括號切割規則。
 *   雙引號不受影響（未關閉雙引號仍保護到結尾）。
 * @param {boolean} autoBreakBeforeWrap
 * @param {boolean} autoBreakAfterWrap
 * @param {ISplitTagsOptions} [options]
 * @returns {IPromptTagValue[]}
 */
function splitRaw(tags: IPromptTagValue, allowSingleQuote: boolean, autoBreakBeforeWrap: boolean, autoBreakAfterWrap: boolean, options: IPromptOptionValueRecordWithLegacyRuntime = {}): IPromptTagValue[] {
    const { allowKeepEmptyLine = false } = options

    /**
     * 中文/日文標點轉換（原為全域 pre-process，改為在迴圈內 quote-aware 執行）
     * 避免引號內的「、」。「」被提前轉換，失去原始語義。
     */
    function convertPunctuation(ch: string): string {
        switch (ch) {
            /** ，中文逗号 */
            case '\uFF0C': return ','
            /** 。中文句号 */
            case '\u3002': return '.'
            /** 、中文顿号 */
            case '\u3001': return ','
            /** ；中文分号 */
            case '\uFF1B': return ','
            /** ．日文句号(fullwidth) */
            case '\uFF0E': return ','
            default: return ch
        }
    }

    /** 制表符 */
    tags = tags.replace(/\t/g, EnumPromptSplitMarker.newline)
    /** 回车符 */
    tags = tags.replace(/\r/g, EnumPromptSplitMarker.newline)
    /**
     * 连续换行符压缩：
     *   allowKeepEmptyLine=false（预设）— 一律压缩为单个换行（\n+ → \n）
     *   allowKeepEmptyLine=true          — 最多保留一个空行（\n{3,} → \n\n）
     */
    tags = allowKeepEmptyLine
        ? tags.replace(/\n{3,}/g, '\n\n')
        : tags.replace(/\n+/g, EnumPromptSplitMarker.newline)

    const emojis = EMOJI_GUARDS
    emojis.forEach((emoji, index) => {
        tags = tags.replace(emoji.re, emojiPlaceholder(index))
    })

    let length = tags.length
    let temp = ''
    /**
     * 行級 runtime 狀態：所有「僅作用於當前行」的變數集中於此。
     * 分行時由 splitAtNewline() 呼叫 lineState.reset() 一併重置。
     * 新增行級變數時只需加進 createLineState()，不會再發生遺漏重置。
     */
    const lineState = createLineState()
    let result: IPromptTagValue[] = []

    /**
     * 推送一段文字：唯一的事實來源，分行分段、逗號分段、BREAK、收尾皆共用。
     * 若此時單引號未關閉（false positive，如所有格 orks'），
     * 忽略該單引號、以 allowSingleQuote=false 遞迴重處理此段，
     * 重新套用逗號／分行／BREAK／括號規則後再推送結果。
     * 未關閉的雙引號不觸發重處理（保持保護到結尾的既有行為）。
     */
    function pushSegment(): void {
        const text = temp.trim()
        if (text === '') return
        if (allowSingleQuote && lineState.quoteChar === EnumPromptQuoteChar.single) {
            result.push(...splitRaw(text, false, autoBreakBeforeWrap, autoBreakAfterWrap, options))
        } else {
            result.push(text)
        }
    }

    /**
     * 分行切割：唯一事實來源，引號內／外、括號內／外共用，保證行為完全一致。
     * 設計規則：分行優先級最高——不論引號或括號狀態，\n 一律觸發切割；
     * 且引號不跨行保留：切割後由 lineState.reset() 將行級狀態（含 quoteChar）
     * 一併重置，下一行視為全新上下文（跨段括號亦不強制配對）。
     */
    function splitAtNewline(): void {
        pushSegment()
        result.push(EnumPromptSplitMarker.newline)
        lineState.reset()
        temp = ''
    }

    for (let i = 0; i < length; i++) {
        const char = tags[i]

        /** ── 引號追蹤（優先級最高）── */
        if (lineState.quoteChar) {
            /** 在引號內：遇到相同引號字元則關閉 */
            if (char === lineState.quoteChar) {
                lineState.quoteChar = null
            }
            /** 分行優先級大於引號：即使在引號內，\n 仍觸發切割，並結束該行引號 */
            if (char === EnumPromptSplitMarker.newline) {
                splitAtNewline()
                continue
            }
            temp += char
            continue
        } else if (char === EnumPromptQuoteChar.double) {
            /** 雙引號一律視為引號開啟（不會是撇號） */
            lineState.quoteChar = EnumPromptQuoteChar.double
            temp += char
            continue
        } else if (char === EnumPromptQuoteChar.single && allowSingleQuote) {
            /**
             * 單引號需區分撇號（it's、pathâ's、👍's）與引號開啟（'hello'）。
             * 撇號的特徵：前後都不是空白（\S 已涵蓋 tab、nbsp 及所有 Unicode 空白）。
             * 選 \S 而非 \w/\p{L}：過嚴會把非 ASCII 相鄰的撇號誤判為引號開頭，
             * 導致整串未閉合而黏成一段（災難性）；過鬆僅漏開引號（局部）。
             * allowSingleQuote=false（未關閉單引號的重處理）時跳過此分支，
             * 單引號視為一般字元，逗號照常切割。
             */
            const prevChar = i > 0 ? tags[i - 1] : ''
            const nextChar = i < length - 1 ? tags[i + 1] : ''
            const isApostrophe = /^\S$/.test(prevChar) && /^\S$/.test(nextChar)
            if (!isApostrophe) {
                lineState.quoteChar = EnumPromptQuoteChar.single
                temp += char
                continue
            }
            temp += char
            continue
        }

        /** 中文/日文標點轉換：僅在引號外執行，引號內保留原始字元 */
        const converted = convertPunctuation(char)

        if (converted === EnumPromptSplitMarker.newline) {
            /** 分行優先級大於引號：與引號內共用同一切割邏輯 */
            splitAtNewline()
        } else if (converted === ",") {
            if (lineState.startBracketChar === '') {
                /** 前面没有括号 */
                pushSegment()
                lineState.resetBracket()
                temp = ''
            } else {
                /** 前面有括号 */
                temp += converted
            }
        } else {
            if (lineState.startBracketChar === '') {
                /** 前面没有括号 */
                if (isPromptBracketOpen(converted)) {
                    /** 括号开始 */
                    lineState.bracketCount = 1
                    lineState.startBracketChar = converted
                    lineState.endBracketChar = promptBracketPairs[converted]
                    temp += converted
                } else {
                    if (converted === " " && temp.trim() === EnumPromptBreakKeyword.BREAK) {
                        pushSegment()
                        lineState.resetBracket()
                        temp = ''
                    } else {
                        temp += converted
                        if (temp.endsWith(BREAK_WITH_SPACE)) {
                            temp = temp.substring(0, temp.length - BREAK_WITH_SPACE.length)
                            pushSegment()
                            result.push(EnumPromptBreakKeyword.BREAK)
                            lineState.resetBracket()
                            temp = ''
                        }
                    }
                }
            } else {
                /** 前面有括号 */
                if (converted === lineState.endBracketChar) {
                    /** 是结束括号的标识，减掉括号计数 */
                    lineState.bracketCount--
                    if (lineState.bracketCount === 0) {
                        /** 括号计数为0，括号结束 */
                        lineState.startBracketChar = ''
                        lineState.endBracketChar = ''
                        temp += converted
                    } else {
                        temp += converted
                    }
                } else if (converted === lineState.startBracketChar) {
                    /** 是开始括号的标识，加上括号计数 */
                    lineState.bracketCount++
                    temp += converted
                } else {
                    temp += converted
                }
            }
        }
    }
    pushSegment()

    let result2: IPromptTagValue[] = []
    for (let value of result) {
        if (value === EnumPromptSplitMarker.newline) {
            result2.push(value)
            continue
        }
        let start = value[0]
        let end = value[value.length - 1]
        /**
         * 以明確字元比對（非 isPromptBracketOpen 全列）：
         * 舊版僅保護 [ ( { 包裹的片段，<...> 不在此列（交由下方 lora 抽取處理），
         * 保持行為一致，勿改為全括號判斷。
         */
        if (start === EnumPromptBracketOpen.square && end === EnumPromptBracketClose.square) {
            result2.push(value)
            continue
        }
        if (start === EnumPromptBracketOpen.paren && end === EnumPromptBracketClose.paren) {
            result2.push(value)
            continue
        }
        if (start === EnumPromptBracketOpen.curly && end === EnumPromptBracketClose.curly) {
            result2.push(value)
            continue
        }

        /**
         * lora 標籤抽出與片段拆分，其餘片段靠上方括號防護保留。
         */
        const values = splitLoraTagSegments(value)
        for (let value2 of values) {
            if (value2 === '' || value2.trim() === '') continue
            emojis.forEach((emoji, index) => {
                value2 = value2.replace(emojiPlaceholder(index), emoji.emoji)
            })
            result2.push(value2)
        }
    }
    result = result2

    return result
}

/*
export default {
    dontSplitRegexes: [
        // [night light:magical forest: 5, 15]
        // [night light:magical forest:norvegian territory: 5, 15, 25:catmull]
        // (fire extinguisher: 1.0, 2.0)
        // [(fire extinguisher: 1.0, 2.0)::5]
        // [lion:bird:girl: , 7, 10]
        /(\[([\w\s\_\-]+:)+\s*([0-9\.]*,?\s*)+(:[\w\s\_\-]+)*\])+/g,
        /(\(([\w\s\_\-]+:)+\s*([0-9\.]*,?\s*)+(:[\w\s\_\-]+)*\))+/g,
        // EasyNegative (normal quality,Low quality,worst quality:1.4)
        /(([^,]+)?\s*\\*\(([\w\s\_\-\|]+\,*(:[0-9\.]+)?\,?\s*)+\\*\)\s*([^,]+)?)+/g,
        // EasyNegative [normal quality,Low quality,worst quality:1.4]
        /(([^,]+)?\s*\\*\[([\w\s\_\-\|]+\,*(:[0-9\.]+)?\,?\s*)+\\*\]\s*([^,]+)?)+/g,
        // <lora:clothesTransparent_v20:1:1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0>
        /(\<[^\>]+\>)+/g,
    ],

    /!**
     * 分割标签
     * @param tags {string}
     * @returns {string[]}
     *!/
    splitTags(tags) {
        tags = tags.trim()
        tags = tags.replace(/\t/g, '\n') // 制表符
        // tags = tags.replace(/\n/g, '\n') // 换行符
        tags = tags.replace(/\r/g, '\n') // 回车符
        tags = tags.replace(/\n+/g, '\n') // 连续换行符

        tags = tags.replace(/\n+/g, ',')
        console.log(tags)

        let list = []
        const lines = tags.split("\n")
        const lineCount = lines.length
        lines.forEach((line, index) => {
            line = line.trim()
            if (line === '') return
            // 替换
            line = line.replace(/，/g, ',') // 中文逗号
            line = line.replace(/。/g, ',') // 中文句号
            line = line.replace(/、/g, ',') // 中文顿号
            line = line.replace(/；/g, ',') // 中文分号
            line = line.replace(/．/g, ',') // 日文句号
            line = line.replace(/;/g, ',') // 英文分号
            const replace = '----====physton====----'
            const replaceRex = new RegExp(replace, 'g')
            for (const regex of this.dontSplitRegexes) {
                // 将其中的逗号替换掉
                line = line.replace(regex, (match) => {
                    return match.replace(/,/g, replace)
                })
            }
            line.split(",").forEach((tag, index) => {
                tag = tag.trim()
                if (tag === '') return
                // 把逗号替换回来
                tag = tag.replace(replaceRex, ',')
                list.push(tag)
            })
            if (index < lineCount - 1) {
                list.push('\n')
            }
        })
        return list
    },
}*/
