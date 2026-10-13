/**
 * splitByPeriod.node-test.js
 *
 * 以 Node.js 原生測試運行器（node:test + node:assert）撰寫的測試腳本。
 * 測試邏輯由 helpers/node-test-helpers.js 的 runCases() 統一執行，
 * 本檔案僅負責定義「測試案例資料」與模組載入。
 *
 * 執行方式：
 *   cd src && node --test test/splitByPeriod.node-test.js
 *
 * 檔名採用 .node-test.js 後綴，與未來可能引入的第三方測試框架（Jest / Vitest）
 * 透過 glob pattern 做區隔，避免衝突。
 */

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { runCases } = require('./helpers/node-test-helpers')

/* ====================================================================
 *  測試案例定義
 *
 *  每筆案例格式：
 *    { input, args?, expected, note?, assert?, skip? }
 *
 *  - input    : 傳入函式的第一個參數
 *  - args     : 額外參數陣列（會 spread 到 fn(input, ...args)）
 *  - expected : 期望回傳值（與 assert 二選一）
 *  - note     : 附加說明（顯示在測試標題中）
 *  - assert   : 自訂斷言 fn(result)，若有則取代 expected
 *  - skip     : true 時跳過此案例
 * ==================================================================== */

const basicCases = [
    { input: 'a. b. c',       expected: ['a.', 'b.', 'c'] },
    { input: 'hello. world',  expected: ['hello.', 'world'] },
    { input: 'one.  two.  three', expected: ['one.', 'two.', 'three'],
        note: 'multiple spaces after period' },
    { input: 'abc.',          expected: ['abc.'],
        note: 'trailing period, no space after' },
    { input: 'abc. ',         expected: ['abc.', ''],
        note: 'period + space then end of string' },
    { input: 'a.b',           expected: ['a.b'],
        note: 'period without surrounding space — no split' },
]

const noPeriodCases = [
    { input: 'hello world', expected: ['hello world'] },
    { input: '',            expected: [''],
        note: 'empty string' },
]

const bracketProtectionCases = [
    { input: 'xxx. (111. 222)',  args: [{ includeParen: true }], expected: ['xxx.', '(111. 222)'] },
    { input: '(111. 222). xxx',  args: [{ includeParen: true }], expected: ['(111. 222).', 'xxx'] },
    { input: 'xxx. (111. 222',   args: [{ includeParen: true }], expected: ['xxx.', '(111. 222'],
        note: 'unclosed paren' },
    { input: '(111. 222. xxx',   args: [{ includeParen: true }], expected: ['(111. 222. xxx'],
        note: 'unclosed paren — no split at all' },
    { input: 'aaa. (bbb. ccc). ddd. eee', args: [{ includeParen: true }],
        expected: ['aaa.', '(bbb. ccc).', 'ddd.', 'eee'] },
    { input: 'aaa. [bbb. ccc]. ddd', args: [{ includeParen: true }],
        expected: ['aaa.', '[bbb. ccc].', 'ddd'], note: 'square brackets' },
    { input: 'aaa. {bbb. ccc}. ddd', args: [{ includeParen: true }],
        expected: ['aaa.', '{bbb. ccc}.', 'ddd'], note: 'curly brackets' },
    { input: 'a. ((b. c). d). e', args: [{ includeParen: true }],
        expected: ['a.', '((b. c). d).', 'e'], note: 'deeply nested' },
    { input: 'a. ([b. c]). d', args: [{ includeParen: true }],
        expected: ['a.', '([b. c]).', 'd'], note: 'mixed bracket types' },
]

const includeParenFalseCases = [
    { input: 'xxx. (111. 222)', args: [{ includeParen: false }], expected: ['xxx. (111. 222)'],
        note: 'first open paren stops' },
    { input: 'a. b. (c. d)',   args: [{ includeParen: false }], expected: ['a.', 'b. (c. d)'],
        note: 'splits first two, stops at third' },
    { input: 'a. b. [c. d]',   args: [{ includeParen: false }], expected: ['a.', 'b. [c. d]'],
        note: 'square bracket stops' },
    { input: 'a. b. {c. d}',   args: [{ includeParen: false }], expected: ['a.', 'b. {c. d}'],
        note: 'curly bracket stops' },
    { input: '(111. 222). xxx', args: [{ includeParen: false }], expected: ['(111. 222).', 'xxx'],
        note: 'closed paren — split works' },
    { input: 'a. b. c',        args: [{ includeParen: false }], expected: ['a.', 'b.', 'c'],
        note: 'no parens — all splits work' },
]

const mismatchedBracketCases = [
    { input: 'a. )b. c',  args: [{ includeParen: true }], expected: ['a.', ')b.', 'c'],
        note: 'stray close paren ignored' },
    { input: 'a. ]. b',   args: [{ includeParen: true }], expected: ['a.', '].', 'b'],
        note: 'stray close bracket ignored' },
    { input: '(a. (b. c)). d', args: [{ includeParen: true }],
        expected: ['(a. (b. c)).', 'd'], note: 'nested open parens' },
    { input: '((a. b). (c. d)). e', args: [{ includeParen: true }],
        expected: ['((a. b). (c. d)).', 'e'], note: 'multiple nested groups' },
]

const nonStringGuardCases = [
    { input: 42,           expected: ['42'],          note: 'number' },
    { input: null,         expected: ['null'],         note: 'null' },
    { input: undefined,    expected: ['undefined'],    note: 'undefined' },
    { input: true,         expected: ['true'],         note: 'boolean' },
    { input: { a: 1 },     expected: ['[object Object]'], note: 'object' },
]

const whitespaceCases = [
    { input: 'a.\tb. c',       expected: ['a.', 'b.', 'c'], note: 'tab after period' },
    { input: 'a.\t  \tb. c',   expected: ['a.', 'b.', 'c'], note: 'multiple tabs + spaces' },
    { input: 'a.\nb. c',       expected: ['a.', '\n', 'b.', 'c'],
        note: 'newline after period — kept as "\\\\n" marker' },
    { input: 'a.   (b. c)',    args: [{ includeParen: true }], expected: ['a.', '(b. c)'],
        note: 'many spaces then open paren' },
]

const semicolonCases = [
    { input: 'her legs; gnarled trees', expected: ['her legs; gnarled trees'],
        note: 'default off — semicolon is not a split point' },
    { input: 'her legs; gnarled trees', args: [{ splitSemicolon: false }], expected: ['her legs; gnarled trees'],
        note: 'explicitly off' },
    { input: 'her legs; gnarled trees', args: [{ splitSemicolon: true }], expected: ['her legs;', 'gnarled trees'],
        note: 'enabled — splits like period, delimiter kept at segment end' },
    { input: 'a; b. c', args: [{ splitSemicolon: true }], expected: ['a;', 'b.', 'c'],
        note: 'semicolon and period share the same mechanism' },
    { input: 'legs;;; gnarled', args: [{ splitSemicolon: true }], expected: ['legs;;;', 'gnarled'],
        note: 'consecutive semicolons preserved — not condensed' },
    { input: 'a;;b', args: [{ splitSemicolon: true }], expected: ['a;;b'],
        note: 'no whitespace after — no split (same mechanism as period)' },
    { input: 'legs;', args: [{ splitSemicolon: true }], expected: ['legs;'],
        note: 'trailing semicolon — no split, preserved' },
    { input: 'with "a; b" end', args: [{ splitSemicolon: true }], expected: ['with "a; b" end'],
        note: 'semicolon inside double quotes protected' },
    { input: '(a; b); c', args: [{ splitSemicolon: true, includeParen: true }], expected: ['(a; b);', 'c'],
        note: 'semicolon inside parens protected, after close splits' },
    { input: 'a; (b; c)', args: [{ splitSemicolon: true }], expected: ['a; (b; c)'],
        note: 'includeParen=false stops at paren (same as period)' },
    { input: 'a;\nb', args: [{ splitSemicolon: true }], expected: ['a;', '\n', 'b'],
        note: 'semicolon before newline — split, newline marker kept' },
    { input: "orks' legs; gnarled trees", args: [{ splitSemicolon: true }], expected: ["orks' legs;", 'gnarled trees'],
        note: 'unclosed single quote (possessive) ignored — semicolon still splits' },
]

const newlineCases = [
    { input: 'a\nb',   expected: ['a', '\n', 'b'],
        note: 'newline always splits — same rule as splitTags (priority > quotes/parens)' },
    { input: 'a.\nb',  expected: ['a.', '\n', 'b'],
        note: 'period split AND newline marker both kept' },
    { input: '\n',     expected: ['\n'],
        note: 'lone newline — splitTags "\\\\n" marker passthrough unchanged' },
    { input: 'a\n',    expected: ['a', '\n'],
        note: 'trailing newline — no empty tail segment' },
    { input: '\na',    expected: ['\n', 'a'],
        note: 'leading newline — no empty head segment' },
    { input: '\n\n',   expected: ['\n', '\n'],
        note: 'consecutive newlines — one marker each' },
    { input: '"a\nb"', expected: ['"a', '\n', 'b"'],
        note: 'newline inside quotes still splits — newline priority > quote' },
    { input: 'a "b"\nc', expected: ['a "b"', '\n', 'c'],
        note: 'newline after closed quote' },
    { input: 'a\nb. c', expected: ['a', '\n', 'b.', 'c'],
        note: 'newline split then period split' },
    { input: 'a\nb. c', args: [{ includeParen: true }], expected: ['a', '\n', 'b.', 'c'],
        note: 'newline split then period split with includeParen=true' },
    { input: '(a\nb). c', args: [{ includeParen: true }], expected: ['(a', '\n', 'b).', 'c'],
        note: 'newline in parens splits, paren state reset' },
    { input: 'a. \n(b)', args: [{ includeParen: false }], expected: ['a.', '\n', '(b)'],
        note: 'newline priority overrides includeParen=false stop' },
]

const realWorldCases = [
    { input: 'masterpiece, best quality. (1girl:1.2), looking at viewer',
        args: [{ includeParen: true }],
        expected: ['masterpiece, best quality.', '(1girl:1.2), looking at viewer'] },
    { input: 'highly detailed. [horse:donkey:0.5]. landscape',
        args: [{ includeParen: true }],
        expected: ['highly detailed.', '[horse:donkey:0.5].', 'landscape'] },
    { input: '(masterpiece:1.0), best quality. 1girl, {red hair}',
        args: [{ includeParen: true }],
        expected: ['(masterpiece:1.0), best quality.', '1girl, {red hair}'] },
    { input: 'tag. (nested. prompt. here). end',
        args: [{ includeParen: true }],
        expected: ['tag.', '(nested. prompt. here).', 'end'] },
]

const quoteProtectionCases = [
    { input: 'with "Small joys. Brighter days." below.',
        args: [{ includeParen: true }],
        expected: ['with "Small joys. Brighter days." below.'],
        note: 'double-quoted sentence preserved' },
    { input: "with 'Small joys. Brighter days.' below.",
        args: [{ includeParen: true }],
        expected: ["with 'Small joys. Brighter days.' below."],
        note: 'single-quoted sentence preserved' },
    { input: 'a. "b. c". d',
        args: [{ includeParen: true }],
        expected: ['a.', '"b. c".', 'd'],
        note: 'quotes in middle — split outside only' },
    { input: '"a. b. c"',
        args: [{ includeParen: true }],
        expected: ['"a. b. c"'],
        note: 'entire string quoted — no split' },
    { input: '"a. b". "c. d"',
        args: [{ includeParen: true }],
        expected: ['"a. b".', '"c. d"'],
        note: 'two quoted segments' },
    { input: "it's a. test",
        args: [{ includeParen: true }],
        expected: ["it's a.", 'test'],
        note: 'apostrophe (single char) does not open quote' },
    { input: 'a. "b. c',
        args: [{ includeParen: true }],
        expected: ['a.', '"b. c'],
        note: 'unclosed double quote — rest is protected to end' },
    { input: "a. 'b. c",
        args: [{ includeParen: true }],
        expected: ["a.", "'b.", 'c'],
        note: 'unclosed single quote — ignored at segmentation, period splits (same rule as splitTags)' },
    { input: '"it\'s a. b. c". d',
        args: [{ includeParen: true }],
        expected: ['"it\'s a. b. c".', 'd'],
        note: 'apostrophe inside double-quoted string' },
    { input: "'hello. world' a. b",
        args: [{ includeParen: true }],
        expected: ["'hello. world' a.", 'b'],
        note: 'closing quote does not split — space after is part of same segment' },
    { input: "don't stop. go",
        args: [{ includeParen: true }],
        expected: ["don't stop.", 'go'],
        note: 'common contraction — no quote protection' },
    { input: "path\u00e2's stop. go",
        args: [{ includeParen: true }],
        expected: ["path\u00e2's stop.", 'go'],
        note: 'non-ASCII apostrophe (â) — no quote protection' },
    { input: "end with '.",
        args: [{ includeParen: true }],
        expected: ["end with '."],
        note: 'single quote at end — opens but no closer, period protected' },
]

/* ====================================================================
 *  模組載入 factory
 *
 *  傳給 runCases 時，runCases 會在 describe callback 內 await 此函式，
 *  取得真正的被測函式後再逐一執行案例。避免在模組頂層 top-level await。
 * ==================================================================== */

async function loadSplitByPeriod() {
    const mod = await import('../src/utils/splitByPeriod.js')
    return mod.splitByPeriod
}

/* ====================================================================
 *  執行測試
 * ==================================================================== */

describe('splitByPeriod', async () => {
    it('module loads successfully', async () => {
        const fn = await loadSplitByPeriod()
        assert.equal(typeof fn, 'function')
    })

    runCases('basic splitting without brackets',           loadSplitByPeriod, basicCases, { snapshot: true })
    runCases('no period at all',                            loadSplitByPeriod, noPeriodCases, { snapshot: true })
    runCases('nested bracket protection (includeParen=true)', loadSplitByPeriod, bracketProtectionCases, { snapshot: true })
    runCases('includeParen=false — stop splitting before open paren', loadSplitByPeriod, includeParenFalseCases, { snapshot: true })
    runCases('mismatched / noisy brackets',                 loadSplitByPeriod, mismatchedBracketCases, { snapshot: true })
    runCases('non-string input guard',                      loadSplitByPeriod, nonStringGuardCases, { snapshot: true })
    runCases('whitespace handling',                         loadSplitByPeriod, whitespaceCases, { snapshot: true })
    runCases('newline handling (priority over quotes/parens)', loadSplitByPeriod, newlineCases, { snapshot: true })
    runCases('semicolon splitting (splitSemicolon option, default off)', loadSplitByPeriod, semicolonCases, { snapshot: true })
    runCases('real-world prompt scenarios',                 loadSplitByPeriod, realWorldCases, { snapshot: true })
    runCases('quote protection (double & single)',          loadSplitByPeriod, quoteProtectionCases, { snapshot: true })
})
