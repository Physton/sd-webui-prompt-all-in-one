/**
 * splitTags.node-test.js
 *
 * 以 Node.js 原生測試運行器（node:test + node:assert）撰寫的測試腳本。
 * 使用 t.assert.snapshot() 進行快照比對，測試結果自動寫入 .snapshot 檔案，
 * 不需手動複製或維護預期值。
 *
 * 執行方式：
 *   cd src && node --test test/splitTags.node-test.js
 *
 * 首次建立 / 內容變動後更新快照：
 *   cd src && node --test --test-update-snapshots test/splitTags.node-test.js
 *
 * 快照檔案位置：test/splitTags.node-test.js.snapshot（與測試檔同目錄）
 *
 * 檔名採用 .node-test.js 後綴，與未來可能引入的第三方測試框架（Jest / Vitest）
 * 透過 glob pattern 做區隔，避免衝突。
 */

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { compareWithOriginal, attachOriginalComparison, caseTitle } = require('./helpers/node-test-helpers')

/* ====================================================================
 *  工具函式
 * ==================================================================== */

/** 動態載入 ESM 模組。 */
async function loadModule() {
    const mod = await import('../src/utils/splitTags.js')
    return mod.default
}

/**
 * 動態載入 splitTags_original ESM 模組（若存在）。
 * 用於與新版 splitTags 比較差異。
 */
async function loadOriginal() {
    try {
        const mod = await import('../src/utils/splitTags_original.js')
        return mod.default
    } catch {
        return null
    }
}

/** 動態載入 splitByPeriod ESM 模組。 */
async function loadSplitByPeriod() {
    const mod = await import('../src/utils/splitByPeriod.js')
    return mod.default
}

/* ====================================================================
 *  測試案例定義
 *
 *  每筆案例格式：
 *    { input, args?, note? }
 *
 *  - input : 傳入 splitTags 的第一個參數（tags 字串）
 *  - args  : 額外參數陣列 [autoBreakBeforeWrap, autoBreakAfterWrap, options]
 *            options 為物件（如 { allowKeepEmptyLine: true }），集中承載新選項，
 *            後續新增選項只需擴充物件欄位，不必更動既有案例。
 *  - note  : 附加說明（顯示在測試標題中）
 *
 *  斷言方式：
 *    - 短輸入：t.assert.snapshot(result)
 *    - 長輸入（> 100 字元）：t.assert.snapshot({ input, result })
 *      快照內同時保存原始輸入與切割結果，方便 review。
 *
 *  設計原則：
 *    - 每筆案例只測試一個行為，從真實輸入中擷取小片段。
 *    - 案例之間完全獨立，新增不會導致既有快照名稱移位。
 *    - 長輸入以雜湊作為快照名稱前綴，避免名稱過長且保持穩定。
 * ==================================================================== */

const cases = [
    /** ── 基本切割 ── */
    { input: 'a, b, c',
        note: 'comma-separated',
        expectOriginalChanged: false },
    { input: 'a, b, c,',
        note: 'trailing comma',
        expectOriginalChanged: false },
    { input: 'a,  ,  b',
        note: 'empty segments filtered',
        expectOriginalChanged: false },

    /** ── 換行切割 ── */
    { input: 'a\nb\nc',
        note: 'newline-separated',
        expectOriginalChanged: false },
    { input: 'a\n\n\nb',
        note: 'multiple newlines collapsed',
        expectOriginalChanged: false },
    { input: 'a\n\n\nb',
        args: [false, false, {allowKeepEmptyLine: true}],
        note: 'allowKeepEmptyLine — 3+ newlines compressed to one empty line',
        expectOriginalChanged: true },
    { input: 'a\n\nb',
        args: [false, false, {allowKeepEmptyLine: true}],
        note: 'allowKeepEmptyLine — existing empty line kept',
        expectOriginalChanged: true },
    { input: 'a\n\n\n\n\nb',
        args: [false, false, {allowKeepEmptyLine: true}],
        note: 'allowKeepEmptyLine — many newlines still capped at one empty line',
        expectOriginalChanged: true },
    { input: 'a\nb',
        args: [false, false, {allowKeepEmptyLine: true}],
        note: 'allowKeepEmptyLine — single newline unaffected',
        expectOriginalChanged: false },
    { input: 'a\rb\nc',
        note: 'CR normalized to LF',
        expectOriginalChanged: false },
    { input: 'a\tb',
        note: 'tab converted to newline',
        expectOriginalChanged: false },

    /**
     * ── 中文 / 日文標點 ──
     * ，(U+FF0C) 全形逗號 → comma
     */
    { input: '好，壞，普通',
        note: '，fullwidth comma → comma',
        expectOriginalChanged: false },
    /** 。(U+3002) 中日文句號 → period（新版不切割，原版視為 comma 切割） */
    { input: '好。壞。普通',
        note: '。Chinese/Japanese period → period (not comma)' },
    /** 、(U+3001) 中日文頓號 → comma */
    { input: '好、壞、普通',
        note: '、enumeration comma → comma',
        expectOriginalChanged: false },
    /** ；(U+FF1B) 全形分號 → comma */
    { input: '好；壞；普通',
        note: '；fullwidth semicolon → comma',
        expectOriginalChanged: false },
    /** ．(U+FF0E) 全形句號 → comma */
    { input: '好．壞．普通',
        note: '．fullwidth period → comma',
        expectOriginalChanged: false },

    /** ── 中日文標點：混合 ── */
    { input: '好，壞。普通',
        note: '，and 。mixed — comma splits, period does not' },
    { input: '好、壞；普通',
        note: '、and ；mixed — both become comma',
        expectOriginalChanged: false },
    { input: '好．壞。普通',
        note: '．and 。mixed — fullwidth period splits, Japanese period does not' },
    { input: '好，壞、普通；再來．結束',
        note: 'all five punctuations in one string' },

    /** ── 中日文標點：連續 ── */
    { input: '好。。壞',
        note: 'consecutive 。 — each becomes period, no split' },
    { input: '好、、壞',
        note: 'consecutive 、 — each becomes comma, double split',
        expectOriginalChanged: false },
    { input: '好，，壞',
        note: 'consecutive ， — each becomes comma, empty segment filtered',
        expectOriginalChanged: false },
    { input: '好；；壞',
        note: 'consecutive ； — each becomes comma, empty segment filtered',
        expectOriginalChanged: false },

    /**
     * ── 中日文標點：含引號 ──
     * 原版無引號保護，以下皆與新版不同
     */
    { input: '"好，壞"，普通',
        note: '，inside quotes protected' },
    { input: '"好。壞"。普通',
        note: '。inside quotes protected' },
    { input: '"好、壞"、普通',
        note: '、inside quotes protected' },
    { input: '"好；壞"；普通',
        note: '；inside quotes protected' },
    { input: '"好．壞"．普通',
        note: '．inside quotes protected' },

    /** ── 中日文標點：含括號 ── */
    { input: '(好，壞)，普通',
        note: '，inside parens protected',
        expectOriginalChanged: false },
    { input: '[好。壞]。普通',
        note: '。inside brackets — 。changes to period' },

    /** ── 括號保護 ── */
    { input: 'a, [b, c], d',
        note: 'square brackets protect inner commas',
        expectOriginalChanged: false },
    { input: 'a, <b, c>, d',
        note: 'angle brackets protect inner commas',
        expectOriginalChanged: false },
    { input: 'a, {b, c}, d',
        note: 'curly braces protect inner commas',
        expectOriginalChanged: false },

    /** ── 巢狀括號 ── */
    { input: 'a, ([b, c]), d',
        note: 'nested bracket types',
        expectOriginalChanged: false },
    { input: '[a, [b, c]], d',
        note: 'nested same bracket type',
        expectOriginalChanged: false },

    /** ── BREAK 關鍵字 ── */
    { input: 'a, BREAK, b',
        note: 'BREAK keyword splits',
        expectOriginalChanged: false },
    { input: 'a\nBREAK\nb',
        note: 'BREAK with newlines',
        expectOriginalChanged: false },

    /** ── LoRA 標籤 ── */
    { input: 'a, <lora:model:0.7>, b',
        note: 'LoRA tag preserved as single unit',
        expectOriginalChanged: false },
    { input: '<lora:A:1> <lora:B:0.5>, c',
        note: 'multiple LoRA tags',
        expectOriginalChanged: false },

    /**
     * ── 表情符號保護 ──
     * 單一字元表情
     */
    { input: 'a, >_<, b',
        note: 'emoji >_< protected',
        expectOriginalChanged: false },
    { input: 'a, :<, b',
        note: 'emoji :< protected',
        expectOriginalChanged: false },
    { input: 'a, :-(, b',
        note: 'emoji :-( protected',
        expectOriginalChanged: false },
    { input: 'a, :-), b',
        note: 'emoji :-) protected',
        expectOriginalChanged: false },
    { input: 'a, >: <, b',
        note: 'emoji >: < with space — splits on comma',
        expectOriginalChanged: false },
    { input: 'a, >_<, b, :-), c',
        note: 'multiple emojis in sequence',
        expectOriginalChanged: false },

    /** ── 表情符號：相鄰逗號 ── */
    { input: '>_<,hello',
        note: 'emoji at start',
        expectOriginalChanged: false },
    { input: 'hello,>_<',
        note: 'emoji at end',
        expectOriginalChanged: false },
    { input: '>_<,>_<',
        note: 'two emojis adjacent',
        expectOriginalChanged: false },

    /** ── 表情符號：含引號 ── */
    { input: '":(", hello',
        note: 'emoji with quote at start' },
    { input: '":)", world"',
        note: 'emoji between quotes' },

    /** ── 表情符號：與中日文標點混合 ── */
    { input: '>_<，hello',
        note: 'emoji with ，(fullwidth comma)',
        expectOriginalChanged: false },
    { input: 'hello、>_<',
        note: 'emoji with 、(enumeration comma)',
        expectOriginalChanged: false },
    { input: ':-)，world',
        note: 'emoji with ，(fullwidth comma)',
        expectOriginalChanged: false },

    /** ── 空值 / 邊界 ── */
    { input: '',
        note: 'empty string',
        expectOriginalChanged: false },
    { input: '   ',
        note: 'whitespace only',
        expectOriginalChanged: false },
    { input: null,
        note: 'null input',
        expectOriginalChanged: false },
    { input: undefined,
        note: 'undefined input',
        expectOriginalChanged: false },
    { input: false,
        note: 'boolean false input',
        expectOriginalChanged: false },

    /** ── 分行邊界 ── */
    { input: '\n',
        note: 'newline only — whitespace guard returns []' },
    { input: '\n\n\n',
        note: 'multiple newlines only — collapsed then guard returns []' },
    { input: ' \n ',
        note: 'whitespace + newline — guard returns []' },
    { input: 'abc\n',
        note: 'trailing newline — splits, marker at end' },
    { input: '\nabc',
        note: 'leading newline — marker at start' },
    { input: 'a BREAK\nb',
        note: 'newline directly after BREAK — marker follows BREAK' },

    /** ── prompt weight ── */
    { input: '(fire extinguisher: 1.0, 2.0), a',
        note: 'weight syntax — inner comma preserved',
        expectOriginalChanged: false },

    /** ── 引號保護 ── */
    { input: 'with "Small joys. Brighter days." below.',
        note: 'quoted sentence — comma inside protected' },
    { input: "with 'hello, world' end",
        note: 'single-quoted comma protected' },
    { input: '"a, b", c, "d, e"',
        note: 'multiple quoted segments with commas' },
    { input: "it's a, b, c",
        note: 'apostrophe — not a quote opener' },
    { input: "pathâ's leading line",
        note: 'apostrophe after non-ASCII letter (â) — not a quote opener' },
    { input: "\ud83d\ude80's launch, next",
        note: 'apostrophe after emoji — not a quote opener' },
    { input: "a,'b, c'",
        note: 'known: quote directly after comma (no space) — \\S rule treats as apostrophe, falls back to original behavior',
        expectOriginalChanged: false },
    { input: "caf\u00e9's best, \"it's fine\"",
        note: 'non-ASCII apostrophe + quoted apostrophe' },
    { input: '"quoted\nnewline", next',
        note: 'newline inside quotes still splits' },
    { input: 'line one\nline two',
        note: 'newline outside quotes — baseline structure' },
    { input: '"line one\nline two"',
        note: 'newline inside quotes — identical structure to outside (\\n marker included)' },
    { input: 'pre "quoted\nnext" post',
        note: 'quote opens mid-text, newline still splits with marker' },
    { input: '"a, b"\n"c, d"',
        note: 'quoted segments with newline between' },
    { input: '"a, b"\nc, d',
        note: 'quoted then newline then unquoted split' },

    /** ── 未閉合引號 ── */
    { input: 'a, "b, c',
        note: 'unclosed double quote — comma protected to end' },
    { input: "a, 'b, c",
        note: 'unclosed single quote — ignored at segmentation, comma splits (matches original)',
        expectOriginalChanged: false },
    { input: "x 'a \"b, c\" d, e\nnext",
        note: 're-process: unclosed single ignored, closed double quote still protects' },
    { input: 'pre "quoted\nnext',
        note: 'unclosed double quote + newline — newline still splits' },
    { input: "pre 'quoted\nnext",
        note: 'unclosed single quote + newline — newline still splits' },
    { input: '"a, b, c',
        note: 'entire input is unclosed quote — no split' },
    { input: 'x, y, "z',
        note: 'splits before quote opens, rest protected' },
    { input: 'a, "',
        note: 'unclosed quote with only quote char' },
    { input: 'a, "好、壞',
        note: 'unclosed quote + Chinese enumeration comma — preserved, not converted' },
    { input: 'a, "b, BREAK',
        note: 'unclosed quote + BREAK — BREAK not keyword inside quote' },
    { input: "a, 'it's fine",
        note: 'unclosed single quote after apostrophe — first quote opens, second is content' },

    /** ── 引號緊鄰分行前後 ── */
    { input: '"a"\nb',
        note: 'closed quote directly before newline' },
    { input: "'a'\nb",
        note: 'closed single quote directly before newline' },
    { input: 'a\n"b"',
        note: 'quote opens directly after newline' },
    { input: "a\n'b'",
        note: 'single quote opens directly after newline — prev is \\n, not apostrophe' },
    { input: '"a"\n"b"',
        note: 'quotes on both sides of newline' },
    { input: 'a\n"b\nc',
        note: 'unclosed quote starts right after newline — inner newline still splits' },
    { input: '"a\n',
        note: 'unclosed quote ends at newline — split, empty tail dropped' },
    { input: '\n"a',
        note: 'newline at start then unclosed quote' },

    /** ── 括號內分行 ── */
    { input: '(a\nb)',
        note: 'newline in parens — splits, comma rule unaffected' },
    { input: '[a\nb]',
        note: 'newline in square brackets — splits' },
    { input: '{a\nb}',
        note: 'newline in curly braces — splits' },
    { input: '(a, b\nc, d)',
        note: 'newline in parens — inner comma still protected' },
    { input: '([a\nb])',
        note: 'newline in nested brackets — splits, state reset' },
    { input: '(a "b\nc")',
        note: 'newline in brackets inside quote — splits' },

    /** ── 混合引號：單引號與雙引號同時存在 ── */
    { input: "\"a\" 'b', c",
        note: 'both quote types closed, comma outside splits' },
    { input: "'a \"b\" c', d",
        note: 'double quotes inside single quote — inner comma protected' },
    { input: "\"a, 'b, c'\"",
        note: 'single quotes inside double quote — inner comma protected' },
    { input: "\"it's fine, really\"",
        note: 'apostrophe inside double quotes — content, comma protected' },
    { input: "'a \"b, c\" d'",
        note: 'double-quoted comma inside single quotes — protected' },
    { input: "\"a\" 'b'\nc",
        note: 'both quote types closed before newline' },
    { input: "'a'\n\"b\"",
        note: 'single quote before newline, double quote after' },
    { input: "\"a 'b' c\"\nd",
        note: 'mixed quotes inside double quotes, then newline' },
    { input: "a \"b 'c",
        note: 'unclosed double quote containing single quote char' },
    { input: "'a \"b'",
        note: 'single quote containing double quote char, closed' },

    /** ── 真實場景摘錄 ── */
    { input: '"くらしに、さくらを。" beneath',
        note: 'excerpt: Japanese period inside quotes' },
    { input: '"いつもの日を、少し特別に。" with',
        note: 'excerpt: Japanese comma + period in quotes' },
    { input: '"今日も、いい一日を。" with',
        note: 'excerpt: another Japanese comma + period' },
    { input: '"さくらの季節をもっと身近に。".',
        note: 'excerpt: Japanese period then English period' },
    { input: 'lists "たばこ", "お弁当", "飲み物", "スイーツ", and "日用品"',
        note: 'excerpt: quoted items separated by commas' },
    { input: 'The left window poster reads "今日も、いい一日を。" with "Good day. Better tomorrow." below.',
        note: 'excerpt: period-space splits outside quotes' },
    { input: 'The right window poster reads "さくらの季節をもっと身近に。".',
        note: 'excerpt: Japanese period then trailing English period' },

    /** ── 真實場景 ── */
    { input: "her fingers and the orks' legs; gnarled dead trees stand as dark silhouettes at the frame edges, dense fog swallows the middle distance, \n#, \npixelated",
        note: "real-world: unclosed single quote (orks') ignored at segmentation — comma rules re-applied, newlines split",
        expectOriginalChanged: false },
]

/* ====================================================================
 *  單一事實來源：splitTags 測試執行器
 *
 *  splitTags 與 splitTags → splitByPeriod pipeline 共用此函式。
 *  差別僅在於 splitByPeriod 是否為 null。
 * ==================================================================== */

/**
 * 執行一組 splitTags 測試案例。
 *
 * @param {Object}   opts
 * @param {Object[]} opts.cases        - 測試案例陣列
 * @param {Function} opts.splitTags    - 新版 splitTags 函式
 * @param {Function|null} opts.originalFn  - 原版 splitTags_original（可為 null）
 * @param {Function|null} opts.splitByPeriod - 若提供，對每個 tag 結果再做 splitByPeriod
 */
function runSplitTagsTests({ cases, splitTags, originalFn, splitByPeriod }) {
    for (const tc of cases) {
        const title = caseTitle(tc)
        it(title, (t) => {
            /** Step 1: splitTags 切割 */
            const tagResult = splitTags(tc.input, ...(tc.args || []))

            /** Step 2: 可選 — splitByPeriod 管線 */
            let finalResult = tagResult
            let changed = false
            if (splitByPeriod) {
                finalResult = tagResult.flatMap(tag => splitByPeriod(tag, tc.splitByPeriodOptions))
                changed = JSON.stringify(tagResult) !== JSON.stringify(finalResult)

                if (tc.expectChanged !== undefined) {
                    t.assert.equal(changed, tc.expectChanged)
                }

                if (changed) {
                    console.log(`  ⚠ splitByPeriodChanged: true  (${tagResult.length} → ${finalResult.length} segments)`)
                } else {
                    console.log(`  ✓ splitByPeriodChanged: false`)
                }
            }

            /** Step 3: 與原版比較 */
            const { changedFromOriginal, originalResult } = compareWithOriginal(originalFn, tc, tagResult)

            if (tc.expectOriginalChanged !== undefined) {
                t.assert.equal(changedFromOriginal, tc.expectOriginalChanged)
            }

            /** Step 4: 組裝快照 */
            const snap = splitByPeriod
                ? { input: tc.input, splitTagsResult: tagResult }
                : { input: tc.input, result: tagResult }

            if (splitByPeriod) {
                if (changed) {
                    snap.splitByPeriodChanged = true
                    snap.splitByPeriodResult = finalResult
                } else {
                    snap.splitByPeriodChanged = false
                }
            }

            attachOriginalComparison(snap, changedFromOriginal, originalResult)
            t.assert.snapshot(snap)
        })
    }
}

/* ====================================================================
 *  執行測試
 * ==================================================================== */

describe('splitTags', async () => {
    const splitTags = await loadModule()
    const originalFn = await loadOriginal()

    it('module loads successfully', (t) => {
        t.assert.equal(typeof splitTags, 'function')
    })

    runSplitTagsTests({ cases, splitTags, originalFn, splitByPeriod: null })
})

/** 需要進行跨模組驗證的特定提示詞 */
const pipelineCases = [
    /** 完整提示詞 */
    { input: 'Prominent readable text and placement: the main illuminated facade at upper left-center reads "Sakura Stop" with "くらしに、さくらを。" beneath. The right side of the fascia reads "いつもの日を、少し特別に。" with "Small joys. Brighter days." below. The tall illuminated sign above the slope reads "Sakura Stop" and lists "たばこ", "お弁当", "飲み物", "スイーツ", and "日用品". The left window poster reads "今日も、いい一日を。" with "Good day. Better tomorrow." below. The right window poster reads "さくらの季節をもっと身近に。". A pink vertical banner beside the store reads "さくらと、いい毎日を。". The roadside vertical sign at far right reads "海の見える町". The downhill road includes the white marking "止まれ" near the lower distance.',
        note: 'full prompt pipeline',
        expectChanged: true,
        expectOriginalChanged: true,
    },

    /** 複雜 prompt（含 weight、LoRA、BREAK） */
    { input: 'masterpiece, best quality, (1girl:1.2), <lora:add_detail:0.6>, BREAK, forest, trees',
        note: 'complex prompt pipeline' },

    /** 含引號的短 prompt */
    { input: 'with "Small joys, Brighter days." below.',
        note: 'quoted comma pipeline' },

    /** 含中文標點的 prompt */
    { input: '好，壞，普通',
        note: 'Chinese comma pipeline' },

    /** 含括號巢狀的 prompt */
    { input: 'a, (b, c), d',
        note: 'parentheses pipeline' },

    { input: '一位穿著太空衣的貓、復古老舊的紅色跑車' },

    /** 分行 marker 管線直通 */
    { input: 'line one\nline two',
        note: 'pipeline newline — splitTags "\\\\n" marker passes through splitByPeriod unchanged',
        expectChanged: false },

    /** 分號切割選項（splitSemicolon，預設關閉；開啟時併入句號機制） */
    { input: "her fingers and the orks' legs; gnarled dead trees stand as dark silhouettes at the frame edges, dense fog swallows the middle distance, \n#, \npixelated",
        note: 'pipeline splitSemicolon — semicolon splits like period (option B)',
        splitByPeriodOptions: { splitSemicolon: true },
        expectChanged: true,
        expectOriginalChanged: false },

    { input: '一位女孩，她正坐在中国城市街头普通的金属材质公交站台长椅上等车。身侧是一个带有广告牌的公交站牌，路边是平整的沥青人行道，背景可以看到远处的老旧居民楼和几棵行道树，自然光线均匀地照射在人物身上，画面呈现出手机实拍的质感，色调真实自然，人物神态平和，背景有日常生活的街道细节。' },

    /** --- */
]

describe('splitTags → splitByPeriod pipeline', async () => {
    const splitTags = await loadModule()
    const splitByPeriod = await loadSplitByPeriod()
    const originalFn = await loadOriginal()

    runSplitTagsTests({ cases: pipelineCases, splitTags, originalFn, splitByPeriod })
})
