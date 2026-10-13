/**
 * node-test-helpers.js
 *
 * 可複用的 Node.js 原生測試輔助工具。
 * 提供 data-driven 的測試執行器，消除每個測試案例中重複的
 *   1. 模組載入（lazy import）
 *   2. 函式呼叫
 *   3. 結果斷言
 * 樣板代碼。
 *
 * 使用方式：
 *   const { runCases } = require('./helpers/node-test-helpers')
 *   const fn = await loadSomething()
 *   runCases('suite name', fn, [ ...testCases ])
 *
 * @module helpers/node-test-helpers
 */

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')

/**
 * 截斷字串並以 "…" 結尾（共用工具）。
 * @param {string} str
 * @param {number} [maxLen=60]
 * @returns {string}
 */
function truncate(str, maxLen = 60) {
    if (str.length <= maxLen) return str
    return str.slice(0, maxLen) + '…'
}

/**
 * 將輸入值字串化為可讀的展示字串：JSON.stringify（精確轉義引號/控制字元）+ 超長截斷。
 * 例：
 *   a. b. c                          → "a. b. c"
 *   with "Small joys." below.        → "with \"Small joys.\" below."（引號正確轉義）
 *   a<newline>b                      → "a\nb"
 *
 * @param {*}      input
 * @param {number} [maxLen=60] 截斷上限（先截斷再 stringify，避免截斷落在轉義序列中）
 * @returns {string}
 */
function formatTitle(input, maxLen = 60) {
    const notString = typeof input !== 'string'
    const raw = notString ? String(input) : input

    let result = truncate(raw, maxLen)

    if (notString && result.length === raw.length) {
        result = input
    }

    return JSON.stringify(result)
}

/**
 * 產生測試標題 — splitTags 與 splitByPeriod 共用（單一事實來源）。
 *
 * 規則：
 *   - 字串輸入 + 有 note ：「note — [sha256前8碼] "引號包裹值"」（note、hash、值完整呈現）
 *   - 字串輸入 + 無 note ：「[sha256前8碼] "引號包裹值"」
 *   - 非字串輸入        ：note，無 note 時以 formatTitle 呈現值
 *   - 有 args 時附加「 ({...})」後綴（同輸入不同參數時避免標題碰撞）
 *
 * @param {Object} tc
 * @returns {string}
 */
function caseTitle(tc) {
    let title
    if (typeof tc.input === 'string') {
        const identified = `[${promptHash(tc.input)}] ${formatTitle(tc.input)}`
        title = tc.note ? `${tc.note} — ${identified}` : identified
    } else {
        title = tc.note || formatTitle(tc.input)
    }
    if (tc.args !== undefined && tc.args.length > 0) {
        const args = tc.args.map(a => typeof a === 'object' && a !== null
            ? `{${Object.entries(a).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')}}`
            : JSON.stringify(a)
        ).join(', ')
        title += ` (${args})`
    }
    return title
}

/**
 * 執行一組 data-driven 的測試案例。
 *
 * @param {string}   suiteName    - describe() 的標題。
 * @param {Function} fn           - 被測函式（同步或非同步皆可）。
 *                                  若 fn 回傳 Promise（例如 factory function），
 *                                  會先 await 取得真正的函式後再逐一執行案例。
 * @param {Object[]} cases        - 測試案例陣列。每個物件包含：
 *   @param {*}        tc.input    - 傳入 fn 的第一個參數。
 *   @param {*[]}      [tc.args]   - 額外參數（會 spread 到 fn(input, ...args)）。
 *   @param {*|string}  tc.expected - 期望的回傳值。
 *   @param {string}   [tc.note]   - 附加說明，顯示在測試標題中。
 *   @param {Function} [tc.assert] - 自訂斷言函式(fn(result) → void)，
 *                                    若提供則取代預設 deepEqual。
 *   @param {boolean}  [tc.skip]   - 若為 true 則跳過此案例。
 * @param {Object}   [options]           - 額外選項。
 *   @param {boolean} [options.snapshot] - true 時額外寫入快照
 *                                         { input, args?, result }（與 splitTags 同格式）。
 *
 * @example
 *   // 直接傳入已載入的函式
 *   runCases('basic', myFn, [
 *     { input: 'a. b. c', expected: ['a.', 'b.', 'c'] },
 *   ])
 *
 *   // 啟用快照
 *   runCases('basic', myFn, [ ... ], { snapshot: true })
 *
 *   // 傳入 factory function（lazy import）
 *   runCases('basic', () => import('./myModule.js').then(m => m.default), [
 *     { input: 'a. b. c', expected: ['a.', 'b.', 'c'] },
 *   ])
 */
function runCases(suiteName, fn, cases, options = {}) {
    /** snapshot: true 時額外寫入快照 { input, args?, result }（與 splitTags 同格式） */
    const { snapshot = false } = options
    describe(suiteName, async () => {
        const resolvedFn = typeof fn === 'function' ? await fn() : fn
        for (const tc of cases) {
            const title = caseTitle(tc)
            const handler = async (t) => {
                const result = await resolvedFn(tc.input, ...(tc.args || []))
                if (snapshot) {
                    const snap = { input: tc.input }
                    if (tc.args !== undefined) snap.args = tc.args
                    snap.result = result
                    t.assert.snapshot(snap)
                }
                if (tc.assert) {
                    tc.assert(result)
                } else {
                    assert.deepEqual(result, tc.expected)
                }
            }
            if (tc.skip) {
                it.skip(title, handler)
            } else {
                it(title, handler)
            }
        }
    })
}

/**
 * 將新舊版函式結果進行比較。
 *
 * @param {Function|null} originalFn - 原版函式（null 時跳過比較）
 * @param {Object}        tc         - 測試案例（含 input、args）
 * @param {*}             result     - 新版函式結果
 * @returns {{ changedFromOriginal: boolean|null, originalResult: *|null }}
 */
function compareWithOriginal(originalFn, tc, result) {
    if (!originalFn) return { changedFromOriginal: null, originalResult: null }
    const originalResult = originalFn(tc.input, ...(tc.args || []))
    const changedFromOriginal = JSON.stringify(result) !== JSON.stringify(originalResult)
    return { changedFromOriginal, originalResult }
}

/**
 * 將原版比較結果附加到快照物件。
 * changedFromOriginal=true 時同時附加 originalResult。
 *
 * @param {Object}  snap                  - 快照物件（會被 mutate）
 * @param {boolean|null} changedFromOriginal
 * @param {*}       originalResult
 */
function attachOriginalComparison(snap, changedFromOriginal, originalResult) {
    if (changedFromOriginal === null) return
    snap.changedFromOriginal = changedFromOriginal
    if (changedFromOriginal) snap.originalResult = originalResult
}

/**
 * 產生輸入字串的短期雜湊（前 8 碼 hex），用於長輸入的快照標題。
 * @param {string} str
 * @returns {string} 8 字元 hex
 */
function promptHash(str) {
    return crypto.createHash('sha256').update(str).digest('hex').slice(0, 8)
}

module.exports = { runCases, formatTitle, caseTitle, compareWithOriginal, attachOriginalComparison, promptHash, truncate }
