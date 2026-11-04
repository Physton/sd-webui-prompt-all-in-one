/**
 * prompt 切割模組共用型別（splitTags / splitByPeriod）。
 *
 * 依 utils/promptOptions/types.ts 的慣例：
 *   - 魔術字串一律建立為 const enum，.ts 檔內一律使用 enum。
 *   - 同時匯出 ITSTypeAndStringLiteral<Enum> 型別別名，
 *     相容於純 js 呼叫端傳入原始字串（js 端無 enum 概念）。
 */
import type { ITSTypeAndStringLiteral } from 'ts-type'

/**
 * 引號字元。
 * 雙引號一律視為引號開啟；單引號需先排除撇號（it's）。
 */
export const enum EnumPromptQuoteChar {
    double = '"',
    single = "'",
}

/**
 * 開括號。
 * 括號僅保護內部逗號不被切割，不保護分行。
 */
export const enum EnumPromptBracketOpen {
    paren = '(',
    square = '[',
    angle = '<',
    curly = '{',
}

/**
 * 開括號（相容於 js：接受原始字串）。
 */
export type IPromptBracketOpen = ITSTypeAndStringLiteral<EnumPromptBracketOpen>

/**
 * 閉括號（與 EnumPromptBracketOpen 同序配對）。
 */
export const enum EnumPromptBracketClose {
    paren = ')',
    square = ']',
    angle = '>',
    curly = '}',
}

/**
 * 閉括號（相容於 js：接受原始字串）。
 */
export type IPromptBracketClose = ITSTypeAndStringLiteral<EnumPromptBracketClose>

/**
 * BREAK 關鍵字（WebUI 特殊分段關鍵字，獨立成 tag 不併入文字）。
 */
export const enum EnumPromptBreakKeyword {
    BREAK = 'BREAK',
}

/**
 * 切割結果中的分行標記：結果陣列以本值元素表示「此處換行」。
 */
export const enum EnumPromptSplitMarker {
    newline = '\n',
}

/**
 * 分割點分隔符（splitByPeriod 的句號 / 分號機制）。
 */
export const enum EnumPromptSplitDelimiter {
    period = '.',
    semicolon = ';',
}

/**
 * 需從 prompt 文字中清除的不可見字元。
 * 這些字元肉眼不可見，會使標籤比對（lora 名稱、embedding）與權重解析悄悄失敗，
 * 來源多為網頁 / 終端機複製貼上。
 */
export const enum EnumPromptInvisibleChar {
    /** NULL 字元（來源常見於二進位流 / 終端輸出殘留） */
    nullChar = '\x00',
    /** 零寬空格 Zero Width Space（來源常見於網頁複製，U+200B） */
    zeroWidthSpace = '\u200b',
}

/**
 * 零寬空格的 mojibake 序列（依誤讀編碼分變體）。
 *
 * U+200B 的 UTF-8 bytes（E2 80 8B）被以 Latin-1 或 Windows-1252 誤解碼時，
 * 各展開成不同的三字元序列：
 *   - Latin-1：â（U+00E2）+ U+0080 + U+008B — 後兩者是不可見的 C1 控制字元，外觀僅看得見 â
 *   - Windows-1252：â（U+00E2）+ €（U+20AC）+ ‹（U+2039）— 三者皆可見
 *
 * 兩者源頭都是零寬空格。清除時必須整段移除：â 本身是合法字母（如法文），
 * €、‹ 也可獨立出現，只有完整三字元序列才能認定為殘骸，不可拆成單字元個別刪。
 */
export const enum EnumPromptInvisibleMojibake {
    /** 零寬空格 U+200B 的 Latin-1 mojibake：â + U+0080 + U+008B */
    zeroWidthSpaceLatin1 = '\u00e2\u0080\u008b',
    /** 零寬空格 U+200B 的 Windows-1252 mojibake：â + € + ‹（U+00E2 U+20AC U+2039） */
    zeroWidthSpaceCp1252 = '\u00e2\u20ac\u2039',
}

/* ====================================================================
 *  定義（由 enum 派生的執行期資料，對應 promptOptions/definitions.ts 的角色）
 *
 *  以顯式列舉建立而非 Object.values()：在 const enum 完全內聯的編譯設定下，
 *  顯式列舉仍可正確取值，不依賴 enum 物件存在。
 * ==================================================================== */

/** 開括號全體（用於開括號識別）。
 *  TODO: 若未來新增括號種類，只需在 EnumPromptBracketOpen/Close 與此清單同步補上。 */
export const promptBracketOpens: readonly EnumPromptBracketOpen[] = [
    EnumPromptBracketOpen.paren,
    EnumPromptBracketOpen.square,
    EnumPromptBracketOpen.angle,
    EnumPromptBracketOpen.curly,
]

/** 閉括號全體（用於閉括號識別）。
 *  TODO: 同上，與 EnumPromptBracketClose 同步。 */
export const promptBracketCloses: readonly EnumPromptBracketClose[] = [
    EnumPromptBracketClose.paren,
    EnumPromptBracketClose.square,
    EnumPromptBracketClose.angle,
    EnumPromptBracketClose.curly,
]

/**
 * 開括號 → 閉括號配對表。
 */
export const promptBracketPairs: Readonly<Record<EnumPromptBracketOpen, EnumPromptBracketClose>> = {
    [EnumPromptBracketOpen.paren]: EnumPromptBracketClose.paren,
    [EnumPromptBracketOpen.square]: EnumPromptBracketClose.square,
    [EnumPromptBracketOpen.angle]: EnumPromptBracketClose.angle,
    [EnumPromptBracketOpen.curly]: EnumPromptBracketClose.curly,
}

/**
 * 閉括號 → 開括號配對表（splitByPeriod 的 stack 配對用）。
 */
export const promptBracketPairsReversed: Readonly<Record<EnumPromptBracketClose, EnumPromptBracketOpen>> = {
    [EnumPromptBracketClose.paren]: EnumPromptBracketOpen.paren,
    [EnumPromptBracketClose.square]: EnumPromptBracketOpen.square,
    [EnumPromptBracketClose.angle]: EnumPromptBracketOpen.angle,
    [EnumPromptBracketClose.curly]: EnumPromptBracketOpen.curly,
}

/** mojibake 序列全體（清除 regex 的交替分支）。
 *  TODO: 若未來新增其他誤讀來源，只需在 EnumPromptInvisibleMojibake 與此清單同步補上。 */
export const promptInvisibleMojibakes: readonly EnumPromptInvisibleMojibake[] = [
    EnumPromptInvisibleMojibake.zeroWidthSpaceLatin1,
    EnumPromptInvisibleMojibake.zeroWidthSpaceCp1252,
]

/**
 * 型別守衛：是否為開括號。
 *
 * @param {string} ch - 待檢查字元（來源為輸入字串逐字元，故形參為 string）
 * @returns {boolean}
 */
export function isPromptBracketOpen(ch: string): ch is EnumPromptBracketOpen {
    return (promptBracketOpens as readonly string[]).includes(ch)
}

/**
 * 型別守衛：是否為閉括號。
 *
 * @param {string} ch - 待檢查字元
 * @returns {boolean}
 */
export function isPromptBracketClose(ch: string): ch is EnumPromptBracketClose {
    return (promptBracketCloses as readonly string[]).includes(ch)
}
