/**
 * splitTagsJson.node-test.ts
 *
 * splitTags JSON 物件防護的最小必要複現：
 *   - 合法 {} JSON（如 ComfyUI 工作流 meta）→ 整段保留不切割、
 *     修復照做、hooks.onJsonIgnored 被通知
 *   - 無效 JSON / 非 {} 包裹 → 照常切割、不通知
 * 觀察器與案例一同宣告，避免案例間互相污染（「不觸發」案例須確認零呼叫）。
 *
 * 執行方式：
 *   cd src && tsx --test test/splitTagsJson.node-test.js
 */

import { describe } from 'node:test'
import { runCases } from './helpers/node-test-helpers'
import type { IRunCase } from './helpers/types/node-test-case-types'
import { splitTags } from '../src/utils/splitTags'
import type { ISplitTagsHooks } from '../src/utils/splitTags'
import { IPromptOptionValueRecordWithLegacyRuntime } from '#/src/utils/promptOptions/definitions'

type I_SplitOptions = NonNullable<IPromptOptionValueRecordWithLegacyRuntime>

/**
 * 建立案例專屬的通知觀察器：回呼寫入 state、assert 讀取。
 *
 * @returns {object} state 觀察結果；hook 傳入 splitTags 第 5 參數的鉤子
 */
function createJsonObserver(): { state: { called: boolean; text: string }; hook: ISplitTagsHooks } {
    const state = { called: false, text: '' }
    return {
        state,
        hook: {
            onJsonIgnored: (text: string) =>
            {
                state.called = true
                state.text = text
            },
        },
    }
}

const observer1 = createJsonObserver()
const observer2 = createJsonObserver()
const observer3 = createJsonObserver()
const observer4 = createJsonObserver()
const observer5 = createJsonObserver()

const cases: IRunCase<string, [boolean, boolean, I_SplitOptions, ISplitTagsHooks], ReturnType<typeof splitTags>>[] = [
    /** ── 1. 合法 {} JSON：整段保留 + 通知 ── */
    {
        input: '{"a": 1, "b": 2}',
        args: [false, false, {}, observer1.hook],
        note: 'valid JSON object: kept as single tag, onJsonIgnored notified',
        expected: ['{"a": 1, "b": 2}'],
        assert: (r, t) =>
        {
            t.assert.equal(observer1.state.called, true, '應通知 onJsonIgnored')
            t.assert.equal(observer1.state.text, '{"a": 1, "b": 2}', '通知內容為清理後完整字串')
        },
    },
    {
        input: '{"k": "cafÃ©"}',
        args: [false, false, { autoRepairMojibake: true }, observer2.hook],
        note: 'mojibake inside JSON: repaired BEFORE detect, single tag, notified with repaired text',
        expected: ['{"k": "café"}'],
        assert: (r, t) =>
        {
            t.assert.equal(observer2.state.called, true, '修復後仍為 JSON，應通知')
            t.assert.equal(observer2.state.text, '{"k": "café"}', '通知內容為修復後字串（先修復、後判定）')
        },
    },
    {
        input: '{\n  "x": 1\n}',
        args: [false, false, {}, observer5.hook],
        note: 'pretty-printed JSON: newlines NOT converted to wrap markers (single tag)',
        expected: ['{\n  "x": 1\n}'],
        assert: (r, t) =>
        {
            t.assert.equal(observer5.state.called, true, '應通知 onJsonIgnored')
        },
    },

    /** ── 2. 非防護範圍：照常切割、不通知 ── */
    {
        input: '{a}, {b}',
        args: [false, false, {}, observer3.hook],
        note: 'invalid JSON (parse fails): normal comma split, NOT notified',
        expected: ['{a}', '{b}'],
        assert: (r, t) =>
        {
            t.assert.equal(observer3.state.called, false, 'JSON.parse 失敗不觸發通知')
        },
    },
    {
        input: '[1], [2]',
        args: [false, false, {}, observer4.hook],
        note: 'array-wrapped is not {}-wrapped: normal split, NOT notified',
        expected: ['[1]', '[2]'],
        assert: (r, t) =>
        {
            t.assert.equal(observer4.state.called, false, '非 {} 包裹不觸發通知')
        },
    },
]

describe('splitTags JSON protection', async () => {
    runCases('json guard keeps object opaque and notifies via hooks', splitTags, cases)
})
