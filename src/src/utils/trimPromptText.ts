import { EnumPromptInvisibleChar, promptInvisibleMojibakes } from './splitPromptTypes'

/**
 * 不可見字元清除正則（由定義派生，模組載入時構建一次）。
 *
 * 兩類清除目標：
 *   1. 單一字元（EnumPromptInvisibleChar）——組成字元類別逐字比對
 *   2. mojibake 序列（promptInvisibleMojibakes）——以交替分支整段比對；
 *      序列皆由非 ASCII 字元組成、不含 regex 特殊字元，可直接 join
 *
 * mojibake 序列開頭的 â 是合法字母（如法文），其後依誤讀編碼可能是
 * 不可見的 C1 控制字元（Latin-1）或可見的 €、‹（Windows-1252）；
 * 只有完整三字元序列才是零寬空格的誤讀殘骸，故必須整段比對、
 * 不可拆成單字元個別刪除。
 *
 * 新增清除目標時只需擴充 splitPromptTypes 的對應 enum 與清單，此處自動生效。
 */
const INVISIBLE_CHARS_RE = new RegExp(
    `[${EnumPromptInvisibleChar.nullChar}${EnumPromptInvisibleChar.zeroWidthSpace}]|${promptInvisibleMojibakes.join('|')}`,
    'g',
)

/**
 * 邊界水平空白修剪正則（僅字串頭尾，不含內部）。
 * [^\S\n\r] = 是空白、但不是 \n 也不是 \r（保留換行結構）。
 */
const EDGE_HORIZONTAL_WHITESPACE_RE = /^[^\S\n\r]+|[^\S\n\r]+$/g

/**
 * 清理 prompt 文字：清除不可見字元 + 修剪邊界水平空白（保留換行）。
 *
 * @param {string} text - 原始 prompt 文字
 * @returns {string} 清理後的文字
 */
export function trimPromptText(text: string): string {
    return text
        .replace(INVISIBLE_CHARS_RE, '')
        .replace(EDGE_HORIZONTAL_WHITESPACE_RE, '')
}

export default trimPromptText
