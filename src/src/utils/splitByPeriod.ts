import { EnumPromptTagType, IPromptTag, IPromptTagValue } from './promptTags/tag-types'
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
 * 分行時由 periodWalkStrategy.onNewline() 呼叫 lineState.reset() 一併重置，
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
 *   - 實作拆分：splitByPeriodPart() 回傳 I_SplitByPart[] 段落結構，
 *     本函式以 _splitPromptPartsToStringList 轉回字串陣列，維持既有呼叫端與測試的舊格式。
 *
 * @param str - 要切割的原始字串。非字串時以 String() 轉換為單一元素陣列回傳（防禦 js 呼叫端）。
 * @param [options] - 切割選項。
 * @returns 切割後的片段陣列。若無可切割點則回傳包含完整字串的單元素陣列。
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
export function splitByPeriod(str: unknown, options?: IHostPromptOptions): IPromptTagValue[] {
    const ret = splitByPeriodPart(str, options)
    return _splitPromptPartsToStringList(ret)
}

/**
 * 以句號 "." 為分隔符切割字串，回傳段落結構 {@link I_SplitByPart}[]（與 splitByPart 同格式）。
 *
 * 切割算法、防護規則與範例見 {@link splitByPeriod}——兩者共用 walkSplitByPeriod 核心，
 * 僅回傳格式不同：本函式回傳段落結構，splitByPeriod() 以
 * {@link _splitPromptPartsToStringList} 轉回字串陣列以相容舊格式。
 *
 * @param str - 要切割的原始字串。非字串時以 String() 轉換為單一段落回傳（防禦 js 呼叫端）。
 * @param [options] - 切割選項。
 * @returns 切割後的段落陣列。若無可切割點則回傳包含完整字串的單一段落。
 */
export function splitByPeriodPart(str: unknown, options?: IHostPromptOptions): I_SplitByPart[] {
    if (typeof str !== 'string') return [{ value: String(str) }]
    return walkSplitByPeriod(str, options || {}, true)
}

/**
 * 段落走訪的可變上下文：核心與策略共用的游標狀態。
 *
 * 核心宣告並推進 start（段落起點游標）；策略於執行切割時改寫 start、寫入 parts。
 */
interface I_SplitWalkContext {
    /** 原始輸入字串 */
    str: string
    /** str.length（快取，供策略讀取） */
    len: number
    /** 切割選項（供策略讀取，如 includeParen / semicolon） */
    options: IHostPromptOptions
    /** 切割結果（核心與策略共同寫入） */
    parts: I_SplitByPart[]
    /** 當前段落起點游標；策略執行切割時推進 */
    start: number
    /** 行級 runtime 狀態（引號 + 括號 stack；分行時由策略 reset） */
    lineState: IPeriodLineState
}

/**
 * 切割策略：各機制注入走訪核心的差異化行為。
 *
 * 核心負責兩份 walk 原本重複的骨架——引號追蹤（雙引號 / 單引號撇號防護）、
 * 分行派發、括號配對、未關閉單引號的遞迴重走、start 游標與收尾呼叫；
 * 機制只需實作下列鉤子：
 *   - walkSplitByPeriod（句號 / 分號 / 分行）→ periodWalkStrategy
 *   - walkSplitByPart（AND 關鍵字）          → andWalkStrategy
 */
interface I_SplitWalkStrategy {
    /**
     * 分行（\n）處理。未註冊此鉤子時 \n 視為一般字元
     *（AND 切割不處理分行，呼叫端先經句號機制隔離 "\n"）。
     *
     * @returns true = 已消費此字元（其餘判定略過）
     */
    onNewline?: (ctx: I_SplitWalkContext, ci: number) => boolean
    /**
     * 切割點匹配：僅在非引號且括號已全部關閉時由核心呼叫。
     *
     * @returns
     *   null / undefined = 此字元無匹配；
     *   索引 n = 已完成切割，游標自 n 繼續（n 必須 > ci；核心設 ci = n - 1 後由 ci++ 前進）；
     *   SPLIT_WALK_ABORT = 中斷走訪（等同 break；仍執行單引號重走檢查與 pushTail）。
     */
    onSegment?: (ctx: I_SplitWalkContext, ci: number) => number | null | undefined
    /**
     * 收尾：核心在重走判定之後呼叫，依機制規則推入尾段
     *（句號機制保留 "\n" 標記的空尾段例外、AND 機制在字串結尾不產生空段）。
     */
    pushTail: (ctx: I_SplitWalkContext) => void
}

/** {@link I_SplitWalkStrategy.onSegment} 的中斷哨兵：走訪提前結束（等同 break）。 */
const SPLIT_WALK_ABORT = -1

/**
 * 段落走訪核心：walkSplitByPeriod 與 walkSplitByPart 共用的骨架（可遞迴重處理）。
 *
 * 原兩份 walk 的重複邏輯集中於此：
 *   - 引號追蹤：雙引號一律開啟、單引號撇號防護（前後皆 \S 才為撇號）、
 *     引號內不匹配切割點；
 *   - 分行派發：\n 交給策略 onNewline（優先級高於括號；quoteChar 恆不為 \n，
 *     與原「先關閉判定再分行」順序等價），未註冊時視為一般字元；
 *   - 括號配對 stack：僅配對的閉括號才 pop，不配對的閉括號不干扰；
 *   - 未關閉單引號以 allowSingleQuote=false 重走（僅重走核心，策略不變，不會再遞迴）；
 *   - start 游標管理、結果陣列與收尾呼叫。
 *
 * 機制差異全部收斂於 strategy（onNewline / onSegment / pushTail）。
 *
 * @param str - 原始字串（型別防禦由 splitBy*Part 呼叫端完成）
 * @param options - 切割選項（放入 ctx 供策略讀取）
 * @param allowSingleQuote - 是否允許單引號開啟引號。
 *   主呼叫為 true；若收尾時單引號仍未關閉（false positive，如所有格 orks'），
 *   核心以 false 重走——忽略該單引號，重新套用句號／分號／分行／括號規則。
 *   未關閉雙引號不觸發重走（保持保護到結尾）。
 * @param strategy - 切割機制策略（句號機制 / AND 機制）
 * @returns {I_SplitByPart[]} 切割後的段落陣列（value 為段落文字）
 */
function walkSplitParts(str: string, options: IHostPromptOptions, allowSingleQuote: boolean, strategy: I_SplitWalkStrategy): I_SplitByPart[] {
    const len = str.length
    const parts: I_SplitByPart[] = []
    /**
     * 行級 runtime 狀態：所有「僅作用於當前行」的變數集中於此。
     * 分行時由策略 onNewline() 呼叫 lineState.reset() 一併重置。
     */
    const lineState = createLineState()
    const ctx: I_SplitWalkContext = { str, len, options, parts, start: 0, lineState }

    for (let ci = 0; ci < len; ci++) {
        const ch = str[ci]

        /** ── 引號追蹤（優先級最高）── */
        if (lineState.quoteChar) {
            /**
             * 分行優先級大於引號：即使在引號內，\n 仍交由策略處理並結束該行引號。
             * （quoteChar 恆不等於 \n，先判分行與先做關閉判定等價。）
             */
            if (ch === EnumPromptSplitMarker.newline && strategy.onNewline?.(ctx, ci)) {
                continue
            }
            /** 目前在引號內：遇到相同引號字元則關閉 */
            if (ch === lineState.quoteChar) {
                lineState.quoteChar = null
            }
            /** 在引號內的其他字元（含句號 / AND）都不做切割判斷 */
            continue
        }
        if (ch === EnumPromptQuoteChar.double) {
            /** 雙引號一律視為引號開啟（不會是撇號） */
            lineState.quoteChar = EnumPromptQuoteChar.double
            continue
        }
        if (ch === EnumPromptQuoteChar.single && allowSingleQuote) {
            /**
             * 單引號需區分撇號（it's、pathâ's、👍's）與引號開啟（'hello'）。
             * 撇號的特徵：前後都不是空白（\S 已涵蓋 tab、nbsp 及所有 Unicode 空白）。
             * 選 \S 而非 \w/\p{L}：過嚴會把非 ASCII 相鄰的撇號誤判為引號開頭，
             * 導致整串未閉合而黏成一段（災難性）；過鬆僅漏開引號（局部）。
             * allowSingleQuote=false（未關閉單引號的重走）時跳過此分支，
             * 單引號視為一般字元，句號／AND 照常切割。
             */
            const prevChar = ci > 0 ? str[ci - 1] : ''
            const nextChar = ci < len - 1 ? str[ci + 1] : ''
            const isApostrophe = /^\S$/.test(prevChar) && /^\S$/.test(nextChar)
            if (!isApostrophe) {
                lineState.quoteChar = EnumPromptQuoteChar.single
            }
            continue
        }

        /** ── 分行：優先級高於括號；策略未註冊 onNewline 時 \n 為一般字元 ── */
        if (ch === EnumPromptSplitMarker.newline && strategy.onNewline?.(ctx, ci)) {
            continue
        }

        /** ── 括號追蹤 ── */
        const parenStack = lineState.parenStack
        if (isPromptBracketOpen(ch)) {
            parenStack.push(ch)
            continue
        }
        if (isPromptBracketClose(ch)) {
            /** 僅在 stack 頂端為配對的開括號時才 pop，避免不配對的閉括號干扰 */
            if (parenStack.length > 0 && parenStack[parenStack.length - 1] === promptBracketPairsReversed[ch]) {
                parenStack.pop()
            }
            continue
        }

        /** ── 切割點匹配：僅在括號已全部關閉時交由策略判定 ── */
        if (strategy.onSegment && parenStack.length === 0) {
            const resume = strategy.onSegment(ctx, ci)
            if (resume === SPLIT_WALK_ABORT) {
                break
            }
            if (typeof resume === 'number') {
                /** 迴圈指標設為恢復索引的前一位（ci++ 後恰為 resume） */
                ci = resume - 1
            }
        }
    }

    /**
     * 未關閉的單引號：忽略它並以 allowSingleQuote=false 重走
     *（與 splitTags pushSegment 同規則；重走時單引號不再開啟，不會遞迴）。
     */
    if (allowSingleQuote && lineState.quoteChar === EnumPromptQuoteChar.single) {
        return walkSplitParts(str, options, false, strategy)
    }

    strategy.pushTail(ctx)
    return parts
}

/**
 * 句號 / 分號 / 分行切割策略（walkSplitByPeriod 的機制實作）。
 */
const periodWalkStrategy: I_SplitWalkStrategy = {
    /**
     * 分行切割：與 splitTags 同規則——分行優先級最高，
     * 不論引號或括號狀態，\n 一律觸發切割並保留 "\n" 標記；
     * 切割後由 lineState.reset() 將行級狀態（含 quoteChar、parenStack）
     * 一併重置，下一行視為全新上下文（引號不跨行保留，跨段括號不強制配對）。
     */
    onNewline(ctx, ci) {
        const seg = ctx.str.substring(ctx.start, ci)
        if (seg !== '') ctx.parts.push({ value: seg })
        ctx.parts.push({ value: EnumPromptSplitMarker.newline })
        ctx.start = ci + 1
        ctx.lineState.reset()
        return true
    },
    /**
     * 句號 / 分號切割：僅在括號已全部關閉時匹配（核心已保證），
     * 分隔符後需接空白才切割、分隔符保留在段尾、
     * 多個連續分隔符全數保留於段內（不縮減、不產生空段）。
     * includeParen=false 時，若下一個非空白字元是開括號則中斷走訪，
     * 避免將 "(111. 222). xxx" 錯誤拆散。
     */
    onSegment(ctx, ci) {
        const { str, len, options } = ctx
        const ch = str[ci]
        const isDelimiter = ch === EnumPromptSplitDelimiter.period
            || (options.autoSplitByPeriodSemicolon && ch === EnumPromptSplitDelimiter.semicolon)
        if (!isDelimiter) return null
        /** 分隔符後需接空白才切割（\n 交由 onNewline 保留 "\n" 標記） */
        if (ci >= len - 1 || !/\s/.test(str[ci + 1])) return null

        /**
         * 找出句號與空白（僅空格/tab）後的第一個非空白字元
         * 注意：不跳過 \n——換行交由 onNewline 保留 "\n" 標記
         */
        let nextStart = ci + 1
        while (nextStart < len && /[ \t]/.test(str[nextStart])) {
            nextStart++
        }

        /** includeParen=false 時，若下一個非空白字元是開括號則中斷走訪 */
        const nextChar = nextStart < len ? str[nextStart] : ''
        if (!options.autoSplitByPeriodIncludeParen && isPromptBracketOpen(nextChar)) {
            return SPLIT_WALK_ABORT
        }

        /** 執行切割：保留句號在前一段末尾，游標跳至空白後的第一個非空白字元 */
        ctx.parts.push({ value: str.substring(ctx.start, ci + 1) })
        ctx.start = nextStart
        return nextStart
    },
    pushTail(ctx) {
        /**
         * 收尾：將最後一段（句號之後或無句號的完整字串）加入。
         * 例外：若上一段是 "\n" 標記且尾段為空，不加入空字串
         *（如輸入 "\n" → ["\n"]，保證 splitTags 標記直通）。
         */
        const tail = ctx.str.substring(ctx.start)
        if (tail !== '' || ctx.parts.length === 0 || ctx.parts[ctx.parts.length - 1].value !== EnumPromptSplitMarker.newline) {
            ctx.parts.push({ value: tail })
        }
    },
}

/**
 * 走訪句號機制的入口：委託共用核心 walkSplitParts。
 *
 * @param str
 * @param options
 * @param allowSingleQuote - 是否允許單引號開啟引號（主呼叫為 true，重走由核心處理）
 * @returns {I_SplitByPart[]} 切割後的段落陣列（value 為段落文字）
 */
function walkSplitByPeriod(str: string, options: IHostPromptOptions, allowSingleQuote: boolean): I_SplitByPart[] {
    return walkSplitParts(str, options, allowSingleQuote, periodWalkStrategy)
}

/**
 * AND 關鍵字切割後的單一段落結構。
 *
 * 與 splitByPeriod 的純字串結果不同：AND 段落需額外携带
 * 「原始字串中 AND 相鄰兩側是否存在逗號」的資訊，
 * 由呼叫端（applySplitByPeriod）轉換為 tag 上的
 * noCommaBefore / noCommaAfter 標記。
 */
type I_SplitByPart = Pick<IPromptTag, 'value' | 'isKeyword' | 'noCommaBefore' | 'noCommaAfter'>

/** AND 邊界字元：前後不得為詞字元（[A-Za-z0-9_]），避免內嵌詞誤切割。 */
const reKeywordBoundary = /[A-Za-z0-9_]/

/** AND 相鄰可吃掉的分隔字元：空白與逗號（逗號有無決定 noComma* 標記）。 */
const reKeywordDelimiter = /[ \t,]/

/**
 * 以全大寫關鍵字 "AND" 為分隔符切割字串，AND 獨立成段。
 *
 * 防護規則與 walkSplitParts 核心同構：
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
 * @returns {I_SplitByPart[]} 段落陣列；無 AND 時回傳單段（value 為原字串）。
 *
 * @example
 *   splitByAnd("a AND b")   // → [{a}, {AND, noCommaBefore, noCommaAfter}, {b}]
 *   splitByAnd("a,AND b")   // → [{a}, {AND, noCommaAfter}, {b}]
 *   splitByAnd("a AND, b")  // → [{a}, {AND, noCommaBefore}, {b}]
 *   splitByAnd("ANDROID b") // → [{ANDROID b}]（內嵌詞，不切割）
 *   splitByAnd("(a AND b)") // → [{(a AND b)}]（括號內不切割）
 */
export function splitByPart(str: unknown, options?: IHostPromptOptions): I_SplitByPart[] {
    if (typeof str !== 'string') return [{ value: String(str) }]
    if (str === '') return [{ value: '' }]
    return walkSplitByPart(str, options || {}, true)
}

/**
 * AND 關鍵字切割策略（walkSplitByPart 的機制實作）。
 *
 * 不註冊 onNewline——AND 切割不處理分行
 *（呼叫端先經句號機制將 "\n" 隔離成獨立段落，見 splitPromptParts）。
 */
const andWalkStrategy: I_SplitWalkStrategy = {
    /**
     * AND 關鍵字：全大寫、獨立詞（前後非詞字元）、不在引號 / 括號內
     *（引號與括號防護由核心負責，此處只需邊界檢查）；
     * 兩側相鄰的空白與逗號一併吃掉，並以逗號有無決定 noComma* 標記。
     * 字串開頭 / 結尾的邊界不標記對應 noComma*，保留跨 tag 逗號行為。
     */
    onSegment(ctx, ci) {
        const { str, len } = ctx
        if (!str.startsWith(EnumPromptTagType.VALUE_KEYWORD_AND, ci)) return null

        const kwEnd = ci + EnumPromptTagType.VALUE_KEYWORD_AND.length
        const prevChar = ci > 0 ? str[ci - 1] : ''
        const nextChar = kwEnd < len ? str[kwEnd] : ''
        if (ci > 0 && reKeywordBoundary.test(prevChar)) return null
        if (nextChar !== '' && reKeywordBoundary.test(nextChar)) return null

        /** 向後吃掉分隔（空白 / 逗號）：逗號有無決定 noCommaBefore */
        let b = ci
        while (b > ctx.start && reKeywordDelimiter.test(str[b - 1])) b--
        const beforeRegion = str.substring(b, ci)
        const hasContentBefore = b > ctx.start

        /** 向前吃掉分隔（空白 / 逗號）：逗號有無決定 noCommaAfter */
        let f = kwEnd
        while (f < len && reKeywordDelimiter.test(str[f])) f++
        const afterRegion = str.substring(kwEnd, f)
        const hasContentAfter = f < len

        const part: I_SplitByPart = { value: EnumPromptTagType.VALUE_KEYWORD_AND, isKeyword: true }
        if (hasContentBefore && !beforeRegion.includes(',')) part.noCommaBefore = true
        if (hasContentAfter && !afterRegion.includes(',')) part.noCommaAfter = true

        /** 兩側皆有內容才切出相鄰段；僅一側有內容時該側保留邊界不切 */
        if (hasContentBefore) ctx.parts.push({ value: str.substring(ctx.start, b) })
        ctx.parts.push(part)
        ctx.start = hasContentAfter ? f : len
        return ctx.start
    },
    pushTail(ctx) {
        /** 收尾：AND 之後的剩餘字串（AND 在結尾時 start 已推進至 len，不產生空段） */
        if (ctx.start < ctx.len) ctx.parts.push({ value: ctx.str.substring(ctx.start) })
    },
}

/**
 * 走訪 AND 機制的入口：委託共用核心 walkSplitParts（可遞迴重處理）。
 *
 * @param {string} str
 * @param {IHostPromptOptions} options
 * @param {boolean} allowSingleQuote - 是否允許單引號開啟引號（主呼叫為 true，重走由核心處理）
 * @returns {I_SplitByPart[]}
 */
function walkSplitByPart(str: string, options: IHostPromptOptions, allowSingleQuote: boolean): I_SplitByPart[] {
    return walkSplitParts(str, options, allowSingleQuote, andWalkStrategy)
}

/**
 * 組合切割：先以句號 / 分號 / 分行機制切割（splitByPeriodPart），
 * 再對每一段套用 AND 關鍵字切割（splitByPart）。
 *
 * 順序不可反：句號機制負責將分行 "\n" 標記隔離成獨立段落，
 * 使 AND 機制只會看到不含換行的段落（AND 切割不處理分行）。
 *
 * 直接取用 splitByPeriodPart（段落結構）而非 splitByPeriod（字串陣列）：
 * 免去 _splitPromptPartsToStringList 轉回字串、再由 splitByPart 重建段落的往返。
 * 句號段落只帶 value（不設 isKeyword / noComma*），故取 seg.value 傳入無資訊損失。
 *
 * 內層以 splitByPart 而非 walkSplitByPart 直呼：保留其空字串防禦，
 * 使空輸入仍回傳單段（walk 直呼會讓 "" 段落消失，破壞「無切割點時為單段」契約）。
 *
 * @param {unknown} str - 原始字串
 * @param {IHostPromptOptions} [options] - 切割選項（傳給兩種機制）
 * @returns {I_SplitByPart[]} 段落陣列（含 AND 相鄰逗號資訊）；無切割點時為單段
 */
export function splitPromptParts(str: unknown, options: IHostPromptOptions = {}): I_SplitByPart[] {
    const parts: I_SplitByPart[] = []
    splitByPeriodPart(str, options).forEach(seg => {
        splitByPart(seg.value, options).forEach(part => parts.push(part))
    })
    return parts
}

export function _splitPromptPartsToStringList(parts: I_SplitByPart[]): IPromptTagValue[] {
    return parts.map(part => part.value)
}
