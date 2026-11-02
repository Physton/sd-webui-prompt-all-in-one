
import { describe, it } from 'node:test'
import type { TestContext } from 'node:test'
import { runCases } from './helpers/node-test-helpers'
import {
    basicCases,
    bracketProtectionCases,
    includeParenFalseCases,
    mismatchedBracketCases,
    newlineCases,
    nonStringGuardCases,
    noPeriodCases,
    quoteProtectionCases,
    realWorldCases,
    semicolonCases,
    whitespaceCases,
} from './fixture/data-splitByPeriod';
import { splitByPeriod } from '#/src/utils/splitByPeriod'

/* ====================================================================
 *  執行測試
 * ==================================================================== */

describe('splitByPeriod', async () => {
    it('module loads successfully', (t: TestContext) => {
        t.assert.equal(typeof splitByPeriod, 'function')
    })

    runCases('basic splitting without brackets',           splitByPeriod, basicCases, { suiteSnapshot: true })
    runCases('no period at all',                            splitByPeriod, noPeriodCases, { suiteSnapshot: true })
    runCases('nested bracket protection (includeParen=true)', splitByPeriod, bracketProtectionCases, { suiteSnapshot: true })
    runCases('includeParen=false — stop splitting before open paren', splitByPeriod, includeParenFalseCases, { suiteSnapshot: true })
    runCases('mismatched / noisy brackets',                 splitByPeriod, mismatchedBracketCases, { suiteSnapshot: true })
    runCases('non-string input guard',                      splitByPeriod, nonStringGuardCases, { suiteSnapshot: true })
    runCases('whitespace handling',                         splitByPeriod, whitespaceCases, { suiteSnapshot: true })
    runCases('newline handling (priority over quotes/parens)', splitByPeriod, newlineCases, { suiteSnapshot: true })
    runCases('semicolon splitting (splitSemicolon option, default off)', splitByPeriod, semicolonCases, { suiteSnapshot: true })
    runCases('real-world prompt scenarios',                 splitByPeriod, realWorldCases, { suiteSnapshot: true })
    runCases('quote protection (double & single)',          splitByPeriod, quoteProtectionCases, { suiteSnapshot: true })
})
