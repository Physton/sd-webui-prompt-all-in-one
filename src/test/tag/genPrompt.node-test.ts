/**
 * genPrompt.node-test.ts
 *
 * 以 Node.js 原生測試運行器（node:test + node:assert）撰寫的測試腳本。
 * 專門執行「genPrompt」的個別測試案例：
 * 驗證標籤串接、各自動優化選項、disabled 過濾與邊界輸入。
 */

import { describe, it } from 'node:test'
import { runCases } from '../helpers/node-test-helpers'
import { genPromptCore } from '@/utils/promptTags/genPrompt'
import { genPromptCases } from 'test/fixture/tag/data-genPrompt'

/* ====================================================================
 *  執行測試
 * ==================================================================== */

describe('genPrompt', () => {
    it('modules load successfully', (t) => {
        t.assert.equal(typeof genPromptCore, 'function')
    })

    /**
     * ── genPrompt 案例 ──
     * 案例與期望值皆定義於 fixture/data-genPrompt.ts 的 genPromptCases，
     * 共用 runCases 的案例格式與快照寫入。
     * 不開 suiteAllowSnapshotOnly（整組允許只給專存快照的測試組）：
     * 第五組的 '#' 案例自行標記 caseAllowSnapshotOnly: true，只留下結果快照、不做斷言，
     * 其餘案例照常提供斷言。
     */
    runCases('genPrompt cases', genPromptCore, genPromptCases, { suiteSnapshot: true })
})
