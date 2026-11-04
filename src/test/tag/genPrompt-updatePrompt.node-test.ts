/**
 * genPrompt-updatePrompt.node-test.ts
 *
 * 以 Node.js 原生測試運行器（node:test + node:assert）撰寫的測試腳本。
 * 專門執行「updatePrompt → genPrompt」的複合測試案例：
 * 以真 genPrompt 取代替身，並在 refresh 時重入 updatePrompt，
 * 重現元件的實際流程 updatePrompt → updateTags → updatePrompt → commit，
 * 用最終輸出的 prompt 驗證兩層協作後的行為。
 */

import { describe, it } from 'node:test'
import { genPromptCore } from '@/utils/promptTags/genPrompt'
import { updatePromptCore } from '@/utils/promptTags/updatePrompt'
import { runUpdatePromptTests } from '../helpers/promptTags-helpers'
import { genPromptUpdatePromptCases } from '../fixture/tag/data-genPrompt-updatePrompt'

/* ====================================================================
 *  執行測試
 * ==================================================================== */

describe('genPrompt + updatePrompt composite', () => {
    it('modules load successfully', (t) => {
        t.assert.equal(typeof genPromptCore, 'function')
        t.assert.equal(typeof updatePromptCore, 'function')
    })

    /**
     * ── 複合案例 ──
     * 案例與期望值皆定義於 fixture/data-genPrompt-updatePrompt.ts，
     * 與個別測試共用 runUpdatePromptTests 與 IUpdatePromptCase，差別只在：
     *   genPrompt — 注入被抽出的真 genPrompt（其簽名即 IGenPromptFn，直接傳入即可，
     *               不需再包一層同參數轉發的 closure）
     *   reenter   — true，refresh 時重入 updatePrompt（模擬 updateTags 的遞迴）
     */
    runUpdatePromptTests({
        cases: genPromptUpdatePromptCases,
        updatePrompt: updatePromptCore,
        genPrompt: genPromptCore,
        reenter: true,
    })
})
