/**
 * splitByPeriod.js
 *
 * 將字串以句號（"."）為分隔符切割為多個片段，
 * 同時尊重巢狀括號與引號的完整性——僅在括號已完全關閉、且不在引號內的位置才執行切割。
 *
 * 設計目標：
 *   1. 零外部依賴，純函式，可獨立測試。
 *   2. 不依賴任何前端框架（Vue / React）或瀏覽器 API。
 *   3. 透過 options 物件控制切割行為，支援未來擴充。
 *
 * @module utils/splitByPeriod
 */

/**
 * 開括號 → 閉括號的映射表（用於 stack 配對驗證）
 * @type {Record<string, string>}
 */
const PAREN_MAP = { ')': '(', ']': '[', '}': '{' }

/**
 * 判斷字元是否為開括號。
 * @param {string} ch
 * @returns {boolean}
 */
function isOpenParen(ch) {
    return ch === '(' || ch === '[' || ch === '{'
}

/**
 * 判斷字元是否為閉括號。
 * @param {string} ch
 * @returns {boolean}
 */
function isCloseParen(ch) {
    return ch === ')' || ch === ']' || ch === '}'
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
 * @param {string}  str          - 要切割的原始字串。
 * @param {Object}  [options]             - 切割選項。
 * @param {boolean} [options.includeParen] - 是否允許在括號前方切割（無預設值）。
 *   - true  ：句號後遇到開括號仍執行切割。
 *   - false / undefined：句號後遇到開括號時停止切割（保留括號與前段的關聯）。
 * @param {boolean} [options.splitSemicolon] - 是否將 ASCII 分號 ";" 併入句號機制切割（預設關閉）。
 *   - true  ：";" 後接空白時切割，分隔符保留在段尾（與 "." 同一機制）；
 *             多個連續 ";" 全數保留於段內，不縮減、不產生空段。
 *   - false / undefined：";" 不是分隔符。
 * @returns {string[]} 切割後的片段陣列。若無可切割點則回傳包含完整字串的單元素陣列。
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
export function splitByPeriod(str, { includeParen, splitSemicolon } = {}) {
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
 * @returns {string[]}
 */
function walk(str, includeParen, splitSemicolon, allowSingleQuote) {

    const len = str.length
    const parts = []
    const parenStack = []
    let start = 0
    /** null = 不在引號內，'"' 或 "'" = 目前開啟的引號字元 */
    let quoteChar = null

    /** 預先計算：includeParen=false 時，若下一個非空白字元是開括號則停止切割 */
    const notAllowParen = !includeParen

    /**
     * 分行切割：與 splitTags 同規則——分行優先級最高，
     * 不論引號或括號狀態，\n 一律觸發切割並保留 "\n" 標記；
     * 切割後括號狀態重設（跨段括號不強制配對）。引號狀態則保留（與 splitTags 一致）。
     */
    function splitAtNewline(ci) {
        const seg = str.substring(start, ci)
        if (seg !== '') parts.push(seg)
        parts.push('\n')
        start = ci + 1
        parenStack.length = 0
    }

    for (let ci = 0; ci < len; ci++) {
        const ch = str[ci]

        /** ── 引號追蹤（優先級最高）── */
        if (quoteChar) {
            /** 目前在引號內：遇到相同引號字元則關閉 */
            if (ch === quoteChar) {
                quoteChar = null
            }
            /** 分行優先級大於引號：即使在引號內，\n 仍觸發切割 */
            if (ch === '\n') {
                splitAtNewline(ci)
                continue
            }
            /** 在引號內的其他字元（含句號）都不做切割判斷 */
            continue
        } else if (ch === '"') {
            /** 雙引號一律視為引號開啟（不會是撇號） */
            quoteChar = ch
            continue
        } else if (ch === "'" && allowSingleQuote) {
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
                quoteChar = ch
            }
            continue
        }

        /** ── 分行：優先級最高，不論括號狀態一律切割 ── */
        if (ch === '\n') {
            splitAtNewline(ci)
            continue
        }

        /** ── 括號追蹤 ── */
        if (isOpenParen(ch)) {
            parenStack.push(ch)
        } else if (isCloseParen(ch)) {
            /** 僅在 stack 頂端為配對的開括號時才 pop，避免不配對的閉括號干扰 */
            if (parenStack.length > 0 && parenStack[parenStack.length - 1] === PAREN_MAP[ch]) {
                parenStack.pop()
            }
        } else if ((ch === '.' || (splitSemicolon && ch === ';')) && parenStack.length === 0) {
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
                if (notAllowParen && isOpenParen(nextChar)) {
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
    if (allowSingleQuote && quoteChar === "'") {
        return walk(str, includeParen, splitSemicolon, false)
    }

    /**
     * 收尾：將最後一段（句號之後或無句號的完整字串）加入。
     * 例外：若上一段是 "\n" 標記且尾段為空，不加入空字串
     *（如輸入 "\n" → ["\n"]，保證 splitTags 標記直通）。
     */
    const tail = str.substring(start)
    if (tail !== '' || parts.length === 0 || parts[parts.length - 1] !== '\n') {
        parts.push(tail)
    }

    return parts
}

export default splitByPeriod
