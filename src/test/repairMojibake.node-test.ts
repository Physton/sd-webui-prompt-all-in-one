/**
 * repairMojibake.node-test.ts
 *
 * repairMojibake 的最小必要複現案例：每筆只鎖定一個行為意圖，
 * 輸入皆為中性字串（東京 / café 之類），不引用任何外部提示詞內容。
 *
 * 執行方式：
 *   cd src && tsx --test test/repairMojibake.node-test.js
 */

import { describe } from 'node:test'
import { runCases } from './helpers/node-test-helpers'
import type { IRunCase } from './helpers/types/node-test-case-types'
import { EnumMojibakeRepairMethod, repairMojibake } from '../src/utils/repairMojibake'
import type { IMojibakeRepairResult } from '../src/utils/repairMojibake'
import { trimPromptText } from '../src/utils/trimPromptText'
import { splitTags } from '../src/utils/splitTags'
import { IPromptOptionValueRecordWithLegacyRuntime } from '#/src/utils/promptOptions/definitions'

/**
 * 以明確 codepoint 組出 mojibake 輸入。
 * 不可見字元（C1 控制字元、ZWSP）不以字面值落檔，避免編輯或傳輸環節把
 * 該字元吃掉，使案例悄悄失效。
 */
const fromCps = (...cps: number[]): string => String.fromCodePoint(...cps)

/* ====================================================================
 *  案例分組：
 *    1. round-trip（bytes 完整）——C1 標記、Windows-1252 專屬符號、
 *       無標記但含 mojibake 形態的 Ã
 *    2. gap-fill（0x80–0x9F 續接位元組被位元組被剝）——錨點重建、全缺缺口的詞典重建
 *    3. 不動——合法文字與真 Unicode 文字不得被改寫
 *    4. 結構與整合——多行保留 \n；還原後銜接既有清理
 *    5. splitTags autoRepairMojibake 選項接線——開關必須決定是否還原
 * ==================================================================== */

const cases: IRunCase<string, [], IMojibakeRepairResult>[] = [
    /** ── 1. round-trip ── */
    {
        input: fromCps(0xE6, 0x9D, 0xB1, 0xE4, 0xBA, 0xAC),
        note: 'lossless: raw C1 present, 東京 restored byte-exact',
        assert: (r, t) =>
        {
            t.assert.equal(r.text, '東京')
            t.assert.equal(r.method, EnumMojibakeRepairMethod.roundTrip)
            t.assert.equal(r.changed, true)
            t.assert.equal(r.confidence >= 0.9, true, `C1 標記應帶來高信心: ${r.confidence}`)
        },
    },
    {
        input: 'cafÃ©',
        note: 'lossless: mojibake-shaped Ã without C1 (cafÃ© → café)',
        assert: (r, t) =>
        {
            t.assert.equal(r.text, 'café')
            t.assert.equal(r.method, EnumMojibakeRepairMethod.roundTrip)
            t.assert.equal(r.changed, true)
            t.assert.equal(r.confidence >= 0.8, true, `無 C1 標記信心略低但仍為確定性還原: ${r.confidence}`)
        },
    },
    {
        input: 'â€™abc',
        note: 'lossless: Windows-1252 specials (€/™ bytes) reverse-mapped',
        assert: (r, t) =>
        {
            t.assert.equal(r.text.codePointAt(0), 0x2019, 'E2 80 99 應還原為 U+2019')
            t.assert.equal(r.method, EnumMojibakeRepairMethod.roundTrip)
            t.assert.equal(r.changed, true)
        },
    },

    /** ── 2. gap-fill ── */
    {
        input: 'æ±äº¬',
        note: 'gap-fill: single stripped C1 (0x9D) rebuilt via surviving anchor → 東京',
        assert: (r, t) =>
        {
            t.assert.equal(r.text, '東京')
            t.assert.equal(r.method, EnumMojibakeRepairMethod.gapFill)
            t.assert.equal(r.changed, true)
            t.assert.equal(r.confidence > 0 && r.confidence < 1, true, `gap-fill 為推測值: ${r.confidence}`)
        },
    },
    {
        input: 'åçç',
        note: 'gap-fill: fully stripped leads (no anchors) rebuilt to dictionary-validated CJK',
        assert: (r, t) =>
        {
            t.assert.equal(r.method, EnumMojibakeRepairMethod.gapFill)
            t.assert.equal(r.changed, true)
            /**
             * 全缺缺口的重建本質多解（如 先生 與 写真 皆為詞典命中、
             * 同分時依枚舉序勝出），故契約鎖定「輸出全為日中字元且
             * 通過詞典驗證」，不鎖定單一猜測結果。
             */
            for (const ch of r.text) {
                const cp = ch.codePointAt(0) ?? 0
                const isTarget = (cp >= 0x3000 && cp <= 0x30FF) || (cp >= 0x4E00 && cp <= 0x9FFF)
                t.assert.equal(isTarget, true, `輸出應全為日中字元: ${JSON.stringify(r.text)}`)
            }
        },
    },

    {
        input: 'queen' + fromCps(0xE2, 0x80) + 's',
        note: 'gap-fill tier B: stripped C1 in curly-quote mojibake, C1 marker present',
        assert: (r, t) =>
        {
            t.assert.equal(r.method, EnumMojibakeRepairMethod.gapFill)
            t.assert.equal(r.changed, true)
            t.assert.equal(r.text.startsWith('queen'), true, `前綴須保留: ${JSON.stringify(r.text)}`)
            t.assert.equal(!Array.from(r.text).some(ch =>
                (ch.codePointAt(0) ?? 0) >= 0x80 && (ch.codePointAt(0) ?? 0) <= 0x9F), true, '輸出不得殘留 C1')
            /**
             * 缺失 byte 0x93 與 0x99 同為 C1、同被剝除，– 與 ’ 在位元組
             * 層面不可分（頻率先驗決定取捨），故不鎖定單一字元，只鎖定
             * 契約：C1 清空、結構還原。
             */
        },
    },

    /** ── 3. 不動（誤傷防線）── */
    {
        input: 'café',
        note: 'untouched: legit accented Latin (truncated UTF-8 lead must not trigger repair)',
        assert: (r, t) =>
        {
            t.assert.equal(r.changed, false)
            t.assert.equal(r.method, EnumMojibakeRepairMethod.none)
            t.assert.equal(r.text, 'café')
        },
    },
    {
        input: 'Ångström',
        note: 'untouched: Nordic text with mixed high chars',
        assert: (r, t) =>
        {
            t.assert.equal(r.changed, false)
            t.assert.equal(r.text, 'Ångström')
        },
    },
    {
        input: '你好，世界',
        note: 'untouched: genuine CJK text is not mojibake',
        assert: (r, t) =>
        {
            t.assert.equal(r.changed, false)
            t.assert.equal(r.text, '你好，世界')
        },
    },
    {
        input: 'plain ascii 123',
        note: 'untouched: pure ASCII fast path',
        assert: (r, t) =>
        {
            t.assert.equal(r.changed, false)
            t.assert.equal(r.method, EnumMojibakeRepairMethod.none)
        },
    },

    /** ── 4. 結構與整合 ── */
    {
        input: fromCps(0xE6, 0x9D, 0xB1, 0xE4, 0xBA, 0xAC) + '\ncafÃ©',
        note: 'multi-line: repaired per line, newline structure preserved',
        assert: (r, t) =>
        {
            t.assert.equal(r.text, '東京\ncafé')
            t.assert.equal(r.changed, true)
        },
    },
    {
        input: 'â€‹abc',
        note: 'pipeline: ZWSP mojibake repaired then removed by existing trimPromptText',
        assert: (r, t) =>
        {
            t.assert.equal(r.text, fromCps(0x200B) + 'abc', 'round-trip 先還原出 U+200B')
            t.assert.equal(trimPromptText(r.text), 'abc', '既有清理接手移除零寬空格')
        },
    },
    {
        input: 'a' + fromCps(0x2014) + 'b queen' + fromCps(0xE2, 0x80, 0x99),
        note: 'mixed line: correct em-dash preserved while raw-C1 mojibake repaired (segmented path)',
        assert: (r, t) =>
        {
            t.assert.equal(r.text, 'a' + fromCps(0x2014) + 'b queen' + fromCps(0x2019),
                '正確的 — 原樣保留，同段 mojibake round-trip 還原為 ’')
            t.assert.equal(r.method, EnumMojibakeRepairMethod.roundTrip)
            t.assert.equal(r.changed, true)
        },
    },
]

/**
 * splitTags autoRepairMojibake 選項的接線案例。
 *
 * 契約：開關必須決定「是否在切割前還原 mojibake」——
 *   OFF 時輸入原樣進入清理（不還原）；ON 時先還原再切割，
 * 且還原發生在逗號分割之前（先修復、後切 tag）。
 */
const optionCases: IRunCase<string, [boolean, boolean, IPromptOptionValueRecordWithLegacyRuntime], ReturnType<typeof splitTags>>[] = [
    {
        input: 'æ±äº¬',
        args: [false, false, { autoRepairMojibake: false }],
        note: 'option OFF: mojibake input untouched (gating proven)',
        expected: ['æ±äº¬'],
    },
    {
        input: 'æ±äº¬',
        args: [false, false, { autoRepairMojibake: true }],
        note: 'option ON: repaired at splitTags entry → 東京',
        expected: ['東京'],
    },
    {
        input: 'cafÃ©, next',
        args: [false, false, { autoRepairMojibake: true }],
        note: 'option ON: repair runs before comma split → café + next',
        expected: ['café', 'next'],
    },
]

describe('splitTags autoRepairMojibake option', async () => {
    runCases('option gates repair at splitTags entry', splitTags, optionCases, {
        suiteSnapshot: true,
    })
})

describe('repairMojibake', async () => {
    /** runCases 的 fn 參數為 lazy factory（內部會 await fn()），故傳入載入函式 */
    runCases('mojibake repair intent (direct assertions, no snapshot)', repairMojibake, cases, {
        suiteSnapshot: true,
    })
})
