import { IPromptTagValue } from './promptTags/tag-types'
import { IHostPromptOptions } from './promptTags/types'
import {
    EnumPromptBracketClose,
    EnumPromptQuoteChar,
    EnumPromptSplitDelimiter,
    EnumPromptSplitMarker,
    isPromptBracketClose,
    isPromptBracketOpen,
    promptBracketPairsReversed,
    type IPromptBracketOpen,
} from './splitPromptTypes'

/**
 * 行級 runtime 狀態介面。
 * 所有「僅作用於當前行」的變數集中於此，分行時由 reset() 一併重置。
 */
export interface IPeriodLineState {
    /** null = 不在引號內；EnumPromptQuoteChar = 目前開啟的引號字元（不跨行保留） */
    quoteChar: EnumPromptQuoteChar | null
    /** 未關閉括號的 stack（不跨行配對，分行即清空） */
    parenStack: IPromptBracketOpen[]
    /** 行級完整重置（分行時使用）：結束引號 + 清空括號 stack */
    reset(): void
}

/**
 * 建立「僅作用於當前行」的 runtime 狀態物件。
 *
 * 與 splitTags.createLineState 同構（行級變數集中管理）：
 * 分行時由 walk() 的 splitAtNewline() 呼叫 lineState.reset() 一併重置，
 * 未來新增行級變數只需加進此處，不會再發生「忘了納入重置清單」的遺漏。
 *
 * @returns {IPeriodLineState}
 */
function createLineState(): IPeriodLineState {
    return {
        quoteChar: null,
        parenStack: [],
        reset() {
            this.quoteChar = null
            this.parenStack.length = 0
        },
    }
}

/**
 * 以句號 "." 為分隔符切割字串，並在切割時防護巢狀括號與引號。
 *
 * 另含與 splitTags 相同的分行規則：\n 優先級最高——不論引號或括號狀態，
 * 一律觸發切割並保留獨立的 "\n" 標記段（保證 splitTags 產生的標記直通不丟失）。
 *
 * 算法說明（stack-based 單次遍歷）：
 *   - 維護一個 parenStack 追蹤目前尚未關閉的括號深度。
 *   - 維護一個 quoteChar 追蹤目前是否在引號（" 或 '）內部。
 *   - 僅在 parenStack 為空且不在引號內時，才在句號處嘗試切割。
 *   - 切割後跳過句號後的連續空白，將下一個非空白字元作為新片段的起點。
 *   - 當 includeParen 為 false 時，若句號後的下一個非空白字元是開括號，
 *     則停止繼續切割（break），避免將 "(111. 222). xxx" 錯誤拆散。
 *   - 未關閉的單引號（如所有格 orks'）在收尾時會被忽略並以 allowSingleQuote=false
 *     重走整段，重新套用句號／分號／分行／括號規則（與 splitTags pushSegment 同規則）；
 *     未關閉雙引號則保持保護到結尾。
 *
 * @param {unknown} str - 要切割的原始字串。非字串時以 String() 轉換為單一元素陣列回傳（防禦 js 呼叫端）。
 * @param {IHostPromptOptions} [options] - 切割選項。
 * @returns {IPromptTagValue[]} 切割後的片段陣列。若無可切割點則回傳包含完整字串的單元素陣列。
 *
 * @example
 *   splitByPeriod("xxx. (111. 222)", { includeParen: true })
 *   // → ["xxx.", "(111. 222)"]
 *
 *   splitByPeriod("(111. 222). xxx", { includeParen: true })
 *   // → ["(111. 222).", "xxx"]
 *
 *   splitByPeriod("xxx. (111. 222", { includeParen: true })
 *   // → ["xxx.", "(111. 222"]
 *
 *   splitByPeriod("(111. 222. xxx", { includeParen: true })
 *   // → ["(111. 222. xxx"]   （括號未關閉，parenStack 非空，不切割）
 *
 *   splitByPeriod("a. b. c", { includeParen: true })
 *   // → ["a.", "b.", "c"]
 *
 *   splitByPeriod("xxx. (111. 222)", { includeParen: false })
 *   // → ["xxx. (111. 222)"]  （includeParen=false，句號後為開括號，停止切割）
 *
 *   splitByPeriod('with "Small joys. Brighter days." below.', { includeParen: true })
 *   // → ['with "Small joys. Brighter days." below.']  （引號內的句號不切割）
 *
 *   splitByPeriod("a; b", { splitSemicolon: true })
 *   // → ["a;", "b"]         （分號併入句號機制，分隔符保留於段尾）
 *
 *   splitByPeriod("a;;; b", { splitSemicolon: true })
 *   // → ["a;;;", "b"]       （連續分號全數保留，不縮減）
 */
export function splitByPeriod(str: unknown, { autoSplitByPeriodIncludeParen: includeParen, autoSplitByPeriodSemicolon: splitSemicolon }: IHostPromptOptions = {}): IPromptTagValue[] {
    if (typeof str !== 'string') return [String(str)]
    return walk(str, includeParen, splitSemicolon, true)
}

/**
 * 走訪切割核心（可遞迴重處理）。
 *
 * @param {string}  str
 * @param {boolean} includeParen
 * @param {boolean} splitSemicolon
 * @param {boolean} allowSingleQuote - 是否允許單引號開啟引號。
 *   主呼叫為 true；若收尾時單引號仍未關閉（false positive，如所有格 orks'），
 *   以 false 重走——忽略該單引號，重新套用句號／分號／分行／括號規則。
 *   未關閉雙引號不觸發重走（保持保護到結尾）。
 * @returns {IPromptTagValue[]}
 */
function walk(str: string, includeParen: boolean | undefined, splitSemicolon: boolean | undefined, allowSingleQuote: boolean): IPromptTagValue[] {

    const len = str.length
    const parts: IPromptTagValue[] = []
    /**
     * 行級 runtime 狀態：所有「僅作用於當前行」的變數集中於此。
     * 分行時由 splitAtNewline() 呼叫 lineState.reset() 一併重置。
     */
    const lineState = createLineState()
    let start = 0

    /** 預先計算：includeParen=false 時，若下一個非空白字元是開括號則停止切割 */
    const notAllowParen = !includeParen

    /**
     * 分行切割：與 splitTags 同規則——分行優先級最高，
     * 不論引號或括號狀態，\n 一律觸發切割並保留 "\n" 標記；
     * 切割後由 lineState.reset() 將行級狀態（含 quoteChar、parenStack）
     * 一併重置，下一行視為全新上下文（引號不跨行保留，跨段括號不強制配對）。
     */
    function splitAtNewline(ci: number): void {
        const seg = str.substring(start, ci)
        if (seg !== '') parts.push(seg)
        parts.push(EnumPromptSplitMarker.newline)
        start = ci + 1
        lineState.reset()
    }

    for (let ci = 0; ci < len; ci++) {
        const ch = str[ci]

        /** ── 引號追蹤（優先級最高）── */
        if (lineState.quoteChar) {
            /** 目前在引號內：遇到相同引號字元則關閉 */
            if (ch === lineState.quoteChar) {
                lineState.quoteChar = null
            }
            /** 分行優先級大於引號：即使在引號內，\n 仍觸發切割，並結束該行引號 */
            if (ch === EnumPromptSplitMarker.newline) {
                splitAtNewline(ci)
                continue
            }
            /** 在引號內的其他字元（含句號）都不做切割判斷 */
            continue
        } else if (ch === EnumPromptQuoteChar.double) {
            /** 雙引號一律視為引號開啟（不會是撇號） */
            lineState.quoteChar = EnumPromptQuoteChar.double
            continue
        } else if (ch === EnumPromptQuoteChar.single && allowSingleQuote) {
            /**
             * 單引號需區分撇號（it's、pathâ's、👍's）與引號開啟（'hello'）。
             * 撇號的特徵：前後都不是空白（\S 已涵蓋 tab、nbsp 及所有 Unicode 空白）。
             * 選 \S 而非 \w/\p{L}：過嚴會把非 ASCII 相鄰的撇號誤判為引號開頭，
             * 導致整串未閉合而黏成一段（災難性）；過鬆僅漏開引號（局部）。
             * allowSingleQuote=false（未關閉單引號的重走）時跳過此分支，
             * 單引號視為一般字元，句號／分號照常切割。
             */
            const prevChar = ci > 0 ? str[ci - 1] : ''
            const nextChar = ci < len - 1 ? str[ci + 1] : ''
            const isApostrophe = /^\S$/.test(prevChar) && /^\S$/.test(nextChar)
            if (!isApostrophe) {
                lineState.quoteChar = EnumPromptQuoteChar.single
            }
            continue
        }

        /** ── 分行：優先級最高，不論括號狀態一律切割 ── */
        if (ch === EnumPromptSplitMarker.newline) {
            splitAtNewline(ci)
            continue
        }

        /** ── 括號追蹤 ── */
        const parenStack = lineState.parenStack
        if (isPromptBracketOpen(ch)) {
            parenStack.push(ch)
        } else if (isPromptBracketClose(ch)) {
            /** 僅在 stack 頂端為配對的開括號時才 pop，避免不配對的閉括號干扰 */
            if (parenStack.length > 0 && parenStack[parenStack.length - 1] === promptBracketPairsReversed[ch]) {
                parenStack.pop()
            }
        } else if ((ch === EnumPromptSplitDelimiter.period || (splitSemicolon && ch === EnumPromptSplitDelimiter.semicolon)) && parenStack.length === 0) {
            /**
             * 僅在括號已全部關閉（parenStack 為空）時才考慮切割。
             * "." 與 ";"（splitSemicolon 開啟時）共用同一機制：
             * 分隔符後需接空白才切割、分隔符保留在段尾、
             * 多個連續分隔符全數保留於段內（不縮減、不產生空段）。
             */
            if (ci < len - 1 && /\s/.test(str[ci + 1])) {
                /**
                 * 找出句號與空白（僅空格/tab）後的第一個非空白字元
                 * 注意：不跳過 \n——換行交由 splitAtNewline 保留 "\n" 標記
                 */
                let nextStart = ci + 1
                while (nextStart < len && /[ \t]/.test(str[nextStart])) {
                    nextStart++
                }

                /** includeParen=false 時，若下一個非空白字元是開括號則停止切割 */
                const nextChar = nextStart < len ? str[nextStart] : ''
                if (notAllowParen && isPromptBracketOpen(nextChar)) {
                    break
                }

                /** 執行切割：保留句號在前一段末尾 */
                parts.push(str.substring(start, ci + 1))
                start = nextStart
                /** 迴圈指標跳至空白後的字元前一位 */
                ci = nextStart - 1
            }
        }
    }

    /**
     * 未關閉的單引號：忽略它並以 allowSingleQuote=false 重走
     *（與 splitTags pushSegment 同規則；重走時單引號不再開啟，不會遞迴）。
     */
    if (allowSingleQuote && lineState.quoteChar === EnumPromptQuoteChar.single) {
        return walk(str, includeParen, splitSemicolon, false)
    }

    /**
     * 收尾：將最後一段（句號之後或無句號的完整字串）加入。
     * 例外：若上一段是 "\n" 標記且尾段為空，不加入空字串
     *（如輸入 "\n" → ["\n"]，保證 splitTags 標記直通）。
     */
    const tail = str.substring(start)
    if (tail !== '' || parts.length === 0 || parts[parts.length - 1] !== EnumPromptSplitMarker.newline) {
        parts.push(tail)
    }

    return parts
}

/**
 * AND 關鍵字切割後的單一段落結構。
 *
 * 與 splitByPeriod 的純字串結果不同：AND 段落需額外携带
 * 「原始字串中 AND 相鄰兩側是否存在逗號」的資訊，
 * 由呼叫端（applySplitByPeriod）轉換為 tag 上的
 * splitNoCommaBefore / splitNoCommaAfter 標記。
 */
export interface ISplitByAndPart {
    /** 段落文字；isAnd=true 時恆為 "AND" */
    value: IPromptTagValue
    /** 此段是否為 AND 關鍵字（全大寫、獨立詞、不在引號 / 括號內） */
    isAnd?: boolean
    /** AND 之前的同一字串相鄰處沒有逗號（僅在前方有內容時才標記） */
    noCommaBefore?: boolean
    /** AND 之後的同一字串相鄰處沒有逗號（僅在後方有內容時才標記） */
    noCommaAfter?: boolean
}

/** AND 關鍵字（僅全小寫以外的全大寫形式；ANDROID、BRAND 等內嵌詞不切割）。 */
const PROMPT_AND_KEYWORD = 'AND'

/** AND 邊界字元：前後不得為詞字元（[A-Za-z0-9_]），避免內嵌詞誤切割。 */
const reAndBoundary = /[A-Za-z0-9_]/

/** AND 相鄰可吃掉的分隔字元：空白與逗號（逗號有無決定 noComma* 標記）。 */
const reAndDelimiter = /[ \t,]/

/**
 * 判斷文字是否為 AND 關鍵字段落。
 *
 * 供呼叫端區分「切割產生的 AND tag」與一般文字：
 * AND tag 的 splitNoComma* 標記由切割時的相鄰逗號決定，
 * 重跑分割時必須保留，不可套用句號機制的過期清理規則。
 *
 * @param {unknown} value - 待檢查的 tag value
 * @returns {boolean} 是否為獨立的 "AND" 關鍵字
 */
export function isSplitByAndKeyword(value: unknown): boolean {
    return typeof value === 'string' && /^AND$/.test(value.trim())
}

/**
 * 以全大寫關鍵字 "AND" 為分隔符切割字串，AND 獨立成段。
 *
 * 防護規則與 walk()（splitByPeriod）同構：
 *   - 引號（" / '，單引號需先排除撇號）內的 AND 不切割；
 *   - 括號 stack 未清空（巢狀 / 未關閉）時不切割；
 *   - 邊界字元檢查：前後為詞字元時（如 ANDROID、BRAND）不切割。
 *
 * 切割時會吃掉 AND 兩側相鄰的空白與逗號，並記錄逗號有無：
 *   - "a AND b"   → [a, AND, b]  兩側皆無逗號 → noCommaBefore + noCommaAfter
 *   - "a,AND b"   → [a, AND, b]  之前有逗號   → 僅 noCommaAfter
 *   - "a AND, b"  → [a, AND, b]  之後有逗號   → 僅 noCommaBefore
 *
 * 字串開頭 / 結尾的邊界不標記對應的 noComma*：
 * 該側沒有可見的相鄰內容時，跨 tag 的逗號不屬於本字串可見範圍，
 * 標記反而會吃掉分割前就存在的跨 tag 逗號，故一律保留預設行為。
 *
 * 註：本函式不處理分行——呼叫端應先經 splitByPeriod 將 "\n"
 * 隔離成獨立段落後再逐段呼叫（見 splitPromptParts）。
 *
 * @param {unknown} str - 要切割的原始字串。非字串時以單段落結構回傳。
 * @returns {ISplitByAndPart[]} 段落陣列；無 AND 時回傳單段（value 為原字串）。
 *
 * @example
 *   splitByAnd("a AND b")   // → [{a}, {AND, noCommaBefore, noCommaAfter}, {b}]
 *   splitByAnd("a,AND b")   // → [{a}, {AND, noCommaAfter}, {b}]
 *   splitByAnd("a AND, b")  // → [{a}, {AND, noCommaBefore}, {b}]
 *   splitByAnd("ANDROID b") // → [{ANDROID b}]（內嵌詞，不切割）
 *   splitByAnd("(a AND b)") // → [{(a AND b)}]（括號內不切割）
 */
export function splitByAnd(str: unknown): ISplitByAndPart[] {
    if (typeof str !== 'string') return [{ value: String(str) }]
    if (str === '') return [{ value: '' }]
    return walkByAnd(str, true)
}

/**
 * 走訪 AND 切割核心（可遞迴重處理，與 walk() 的 allowSingleQuote 同規則）。
 *
 * @param {string} str
 * @param {boolean} allowSingleQuote - 是否允許單引號開啟引號。
 *   主呼叫為 true；若收尾時單引號仍未關閉，以 false 重走——
 *   單引號視為一般字元，AND 照常切割（不會再遞迴）。
 * @returns {ISplitByAndPart[]}
 */
function walkByAnd(str: string, allowSingleQuote: boolean): ISplitByAndPart[] {
    const len = str.length
    const parts: ISplitByAndPart[] = []
    let start = 0
    /** 目前開啟的引號字元（null = 不在引號內；不跨呼叫保留） */
    let quoteChar: EnumPromptQuoteChar | null = null
    /** 未關閉括號的 stack（與 walk() 同規則：清空前不切割） */
    const parenStack: IPromptBracketOpen[] = []

    for (let ci = 0; ci < len; ci++) {
        const ch = str[ci]

        /** ── 引號追蹤（優先級最高）── */
        if (quoteChar) {
            if (ch === quoteChar) {
                quoteChar = null
            }
            continue
        }
        if (ch === EnumPromptQuoteChar.double) {
            quoteChar = EnumPromptQuoteChar.double
            continue
        }
        if (ch === EnumPromptQuoteChar.single && allowSingleQuote) {
            /** 單引號需區分撇號（it's）與引號開啟（'hello'），規則同 walk() */
            const prevChar = ci > 0 ? str[ci - 1] : ''
            const nextChar = ci < len - 1 ? str[ci + 1] : ''
            const isApostrophe = /^\S$/.test(prevChar) && /^\S$/.test(nextChar)
            if (!isApostrophe) {
                quoteChar = EnumPromptQuoteChar.single
            }
            continue
        }

        /** ── 括號追蹤 ── */
        if (isPromptBracketOpen(ch)) {
            parenStack.push(ch)
            continue
        }
        if (isPromptBracketClose(ch)) {
            if (parenStack.length > 0 && parenStack[parenStack.length - 1] === promptBracketPairsReversed[ch]) {
                parenStack.pop()
            }
            continue
        }

        /** ── AND 關鍵字：全大寫、獨立詞、且不在引號 / 括號內 ── */
        if (parenStack.length !== 0) continue
        if (!str.startsWith(PROMPT_AND_KEYWORD, ci)) continue

        const kwEnd = ci + PROMPT_AND_KEYWORD.length
        const prevChar = ci > 0 ? str[ci - 1] : ''
        const nextChar = kwEnd < len ? str[kwEnd] : ''
        if (ci > 0 && reAndBoundary.test(prevChar)) continue
        if (nextChar !== '' && reAndBoundary.test(nextChar)) continue

        /** 向後吃掉分隔（空白 / 逗號）：逗號有無決定 noCommaBefore */
        let b = ci
        while (b > start && reAndDelimiter.test(str[b - 1])) b--
        const beforeRegion = str.substring(b, ci)
        const hasContentBefore = b > start

        /** 向前吃掉分隔（空白 / 逗號）：逗號有無決定 noCommaAfter */
        let f = kwEnd
        while (f < len && reAndDelimiter.test(str[f])) f++
        const afterRegion = str.substring(kwEnd, f)
        const hasContentAfter = f < len

        const part: ISplitByAndPart = { value: PROMPT_AND_KEYWORD, isAnd: true }
        if (hasContentBefore && !beforeRegion.includes(',')) part.noCommaBefore = true
        if (hasContentAfter && !afterRegion.includes(',')) part.noCommaAfter = true

        /** 兩側皆有內容才切出相鄰段；僅一側有內容時該側保留邊界不切 */
        if (hasContentBefore) parts.push({ value: str.substring(start, b) })
        parts.push(part)
        start = hasContentAfter ? f : len
        ci = start - 1
    }

    /**
     * 未關閉的單引號：忽略它並以 allowSingleQuote=false 重走
     *（與 walk() 同規則；重走時單引號不再開啟，不會遞迴）。
     */
    if (allowSingleQuote && quoteChar === EnumPromptQuoteChar.single) {
        return walkByAnd(str, false)
    }

    /** 收尾：AND 之後的剩餘字串（AND 在結尾時 start 已推進至 len，不產生空段） */
    if (start < len) parts.push({ value: str.substring(start) })

    return parts
}

/**
 * 組合切割：先以句號 / 分號 / 分行機制切割（splitByPeriod），
 * 再對每一段套用 AND 關鍵字切割（splitByAnd）。
 *
 * 順序不可反：splitByPeriod 負責將分行 "\n" 標記隔離成獨立段落，
 * 使 splitByAnd 只會看到不含換行的段落（AND 切割不處理分行）。
 *
 * @param {unknown} str - 原始字串
 * @param {IHostPromptOptions} [options] - 切割選項（傳給 splitByPeriod）
 * @returns {ISplitByAndPart[]} 段落陣列（含 AND 相鄰逗號資訊）；無切割點時為單段
 */
export function splitPromptParts(str: unknown, options: IHostPromptOptions = {}): ISplitByAndPart[] {
    const parts: ISplitByAndPart[] = []
    splitByPeriod(str, options).forEach(seg => {
        splitByAnd(seg).forEach(part => parts.push(part))
    })
    return parts
}

export default splitByPeriod
