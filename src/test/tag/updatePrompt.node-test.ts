/**
 * updatePrompt.node-test.ts
 *
 * 以 Node.js 原生測試運行器（node:test + node:assert）撰寫的測試腳本。
 * 專門執行「updatePrompt」的個別測試案例：
 * 只驗證編排流程（決定插入位置 → 交棒 refresh / commit），
 * genPrompt 以替身取代，讓這層的行為與組字邏輯各自獨立。
 */

import { describe, it } from 'node:test'
import { runUpdatePromptTests } from '../helpers/promptTags-helpers'
import { updatePromptCases } from '../fixture/tag/data-updatePrompt'
import { updatePromptCore } from '@/utils/promptTags/updatePrompt'

/* ====================================================================
 *  執行測試
 * ==================================================================== */

describe('updatePrompt', () => {
    it('modules load successfully', (t) => {
        t.assert.equal(typeof updatePromptCore, 'function')
    })

    /**
     * ── updatePrompt 案例 ──
     * 案例與期望值皆定義於 fixture/data-updatePrompt.ts 的 updatePromptCases。
     * 未注入 genPrompt，故 host 以固定字串代替，refresh 也不重入。
     */
    runUpdatePromptTests({
        cases: updatePromptCases,
        updatePrompt: updatePromptCore,
    })
})
