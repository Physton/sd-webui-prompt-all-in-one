
import { describe, it } from 'node:test'
import { runSplitTagsTests } from './helpers/node-test-helpers'
import { cases, pipelineCases } from './fixture/data-splitTags';
import { splitTags } from '../src/utils/splitTags';
import splitTagsOriginal from '../src/utils/splitTags_original';
import { splitByPeriod } from '../src/utils/splitByPeriod';
import { issuesCases } from './fixture/data-splitTags-issues';

/* ====================================================================
 *  執行測試
 * ==================================================================== */

describe('splitTags', async () => {
    it('module loads successfully', (t) => {
        t.assert.equal(typeof splitTags, 'function')
    })

    runSplitTagsTests({ cases, splitTags, originalFn: splitTagsOriginal })
})

describe('splitTags → splitByPeriod pipeline', async () => {
    runSplitTagsTests({ cases: pipelineCases, splitTags, originalFn: splitTagsOriginal, splitByPeriod })
})

/**
 * issues 回歸案例：以獨立 describe 分類呈現，
 * 失敗時可立即從標題辨識為「已知 bug 復發」而非一般行為變更。
 */
describe('issues regression cases', async () => {
    runSplitTagsTests({ cases: issuesCases, splitTags })
})
