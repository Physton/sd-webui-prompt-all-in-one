/**
 * trimPromptText.node-test.js
 *
 * trimPromptText 的單元測試：以明確 expected 斷言表達意圖，不使用快照。
 * （快照僅適用於「記錄結果」；本檔每個案例都直接鎖定行為意圖。）
 *
 * 執行方式：
 *   cd src && tsx --test test/trimPromptText.node-test.js
 *
 * 檔名採用 .node-test.js 後綴，與未來可能引入的第三方測試框架（Jest / Vitest）
 * 透過 glob pattern 做區隔，避免衝突。
 */

import { describe } from 'node:test'
import { runCases } from './helpers/node-test-helpers'
import type { IRunCase } from './helpers/types/node-test-case-types'
import { trimPromptText } from '../src/utils/trimPromptText'

/* ====================================================================
 *  測試案例定義 — 每筆皆以 expected 直接断言意圖
 *
 *  意圖分組：
 *    1. 不可見字元逐字清除（\x00 NULL、\u200b 零寬空格）——頭/中/尾/全部
 *    2. 邊界水平空白修剪（空格、tab）——僅頭尾，內部保留
 *    3. 換行是結構（\n / \r）——不得修剪
 *    4. 執行順序：先清不可見字元再修剪（被零寬空格卡住的邊界空白也要清）
 *    5. mojibake 序列（Latin-1 / Windows-1252 誤讀的零寬空格）——三字元整段清除、合法字符不誤刪
 * ==================================================================== */

const cleanupCases: IRunCase<string, [], string>[] = [
    /** ── 1. 不可見字元 ── */
    { input: '\u200babc, def', expected: 'abc, def',
        note: 'leading ZWSP removed' },
    { input: 'abc\u200b, def', expected: 'abc, def',
        note: 'internal ZWSP removed' },
    { input: 'abc, def\u200b', expected: 'abc, def',
        note: 'trailing ZWSP removed' },
    { input: 'a\u0000b, c', expected: 'ab, c',
        note: 'internal NULL removed' },
    { input: '\u0000abc', expected: 'abc',
        note: 'leading NULL removed' },
    { input: '\u200b\u0000', expected: '',
        note: 'invisible-chars-only input → empty string' },

    /** ── 2. 邊界水平空白（內部保留）── */
    { input: '  abc  ', expected: 'abc',
        note: 'edge spaces trimmed' },
    { input: '\tabc\t', expected: 'abc',
        note: 'edge tabs trimmed' },
    { input: 'a, b', expected: 'a, b',
        note: 'no edge whitespace — unchanged' },
    { input: 'a  b', expected: 'a  b',
        note: 'internal multiple spaces kept' },
    { input: ' abc , def ', expected: 'abc , def',
        note: 'edge spaces trimmed, internal comma-space kept verbatim' },

    /** ── 3. 換行是結構：不得修剪 ── */
    { input: '\nabc', expected: '\nabc',
        note: 'leading newline preserved (wrap marker semantics)' },
    { input: 'abc\n', expected: 'abc\n',
        note: 'trailing newline preserved' },
    { input: '\n\nabc\n\n', expected: '\n\nabc\n\n',
        note: 'multiple boundary newlines preserved' },
    { input: '\rabc\r', expected: '\rabc\r',
        note: 'CR preserved like newline (converted downstream)' },
    { input: ' \nabc\n ', expected: '\nabc\n',
        note: 'edge spaces trimmed while boundary newlines kept' },

    /** ── 4. 執行順序：先清除、後修剪 ── */
    { input: '\u200b abc', expected: 'abc',
        note: 'ZWSP removed BEFORE trim — space trapped behind ZWSP still trimmed (order matters)' },
    { input: ' \u200babc\u200b ', expected: 'abc',
        note: 'mixed edge cleanup: invisible + spaces' },
    { input: ' \u200b a\tx\u200b ', expected: 'a\tx',
        note: 'internal tab kept while edges fully cleaned' },
    /** ── 5. mojibake 序列（Latin-1 誤讀的零寬空格：â + C1 + C1 三字元整段）── */
    { input: '\u00e2\u0080\u008babc, def', expected: 'abc, def',
        note: 'leading mojibake ZWSP sequence removed' },
    { input: 'abc\u00e2\u0080\u008b, def', expected: 'abc, def',
        note: 'internal mojibake ZWSP sequence removed' },
    { input: 'abc, def\u00e2\u0080\u008b', expected: 'abc, def',
        note: 'trailing mojibake ZWSP sequence removed' },
    { input: 'a\u00e2\u0080\u008b\u00e2\u0080\u008b\u00e2\u0080\u008bb', expected: 'ab',
        note: 'three consecutive mojibake ZWSP sequences (the reported âââ) removed' },
    { input: ' cr\u00e2me br\u00fbl\u00e9e', expected: 'cr\u00e2me br\u00fbl\u00e9e',
        note: 'legitimate â kept — bare U+00E2 without C1 follow-up is not mojibake' },
    /** ── 6. mojibake 序列（Windows-1252 變體：â + € + ‹ 三字元整段）── */
    { input: '\u00e2\u20ac\u2039abc, def', expected: 'abc, def',
        note: 'leading cp1252 mojibake ZWSP sequence removed' },
    { input: 'abc\u00e2\u20ac\u2039, def', expected: 'abc, def',
        note: 'internal cp1252 mojibake ZWSP sequence removed' },
    { input: 'abc, def\u00e2\u20ac\u2039', expected: 'abc, def',
        note: 'trailing cp1252 mojibake ZWSP sequence removed' },
    { input: 'a\u00e2\u20ac\u2039\u00e2\u20ac\u2039\u00e2\u20ac\u2039b', expected: 'ab',
        note: 'three consecutive cp1252 mojibake sequences removed' },
    { input: ' pay â€10 or 50€ ', expected: 'pay â€10 or 50€',
        note: 'legitimate € / truncated â€ kept — cp1252 match needs the full â + € + ‹ sequence' },
    /** --- */
]

describe('trimPromptText', async () => {
    /** runCases 的 fn 參數為 lazy factory（內部會 await fn()），故傳入載入函式 */
    runCases('cleanup intent (direct assertions, no snapshot)', trimPromptText, cleanupCases)
})
