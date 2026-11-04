/**
 * splitTagsByPeriod.node-test.ts
 *
 * 以 Node.js 原生測試運行器（node:test + node:assert）撰寫的測試腳本。
 * 專門執行「splitTags → splitByPeriod 串接管線」的測試案例：
 * 每個案例先經 splitTags 切成 tag，再逐 tag 送入 splitByPeriod，
 * 以管線的最終輸出作為驗證主體。
 */

import { describe, it } from 'node:test'
import { runSplitTagsTests } from './helpers/node-test-helpers'
import { hashPreservationCases } from './fixture/data-split-mix'
import { splitTags } from '../src/utils/splitTags'
import splitTagsOriginal from '../src/utils/splitTags_original'
import { splitByPeriod } from '../src/utils/splitByPeriod'

/* ====================================================================
 *  執行測試
 * ==================================================================== */

describe('splitTags + splitByPeriod combined pipeline', () => {
    it('modules load successfully', (t) => {
        t.assert.equal(typeof splitTags, 'function')
        t.assert.equal(typeof splitTagsOriginal, 'function')
        t.assert.equal(typeof splitByPeriod, 'function')
    })

    /**
     * ── 第一組：'#' 標記數量守恆 ──
     * 案例與斷言皆定義於 fixture/data-splitTagsByPeriod.ts 的 hashPreservationCases。
     */
    describe('group 1 — hash # marker count preserved', () => {
        runSplitTagsTests({
            cases: hashPreservationCases,
            splitTags,
            originalFn: splitTagsOriginal,
            splitByPeriod,
        })
    })
})
