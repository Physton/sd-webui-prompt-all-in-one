
import type { IUpdatePromptCase } from '../../helpers/types/node-test-case-types';
import { EnumPromptPlaceholder } from '../../helpers/types/snap-types';
import { _t_createTag_brk, _t_createTag_text, _t_createTag_wrap } from '../../helpers/tag-factories';


export const updatePromptCases: IUpdatePromptCase[] = [
	/**
	 * ── 第一組：不需插入換行 — 直接走到 genPrompt + commit ──
	 */
	{
		tags: [_t_createTag_text('cat'), _t_createTag_text('dog')],
		note: '沒有 BREAK — 不插入、不 refresh，直接提交 genPrompt 結果',
		expectedWrapCount: 0,
		expectedPrompt: EnumPromptPlaceholder.GenPrompt,
	},
	{
		tags: [],
		note: '空標籤陣列 — 不插入、不 refresh，直接提交 genPrompt 結果',
		expectedWrapCount: 0,
		expectedPrompt: EnumPromptPlaceholder.GenPrompt,
	},
	{
		tags: [_t_createTag_text('cat'), _t_createTag_brk(), _t_createTag_text('dog')],
		note: 'BREAK 但兩個自動換行選項皆關閉 — 不插入，直接提交',
		expectedWrapCount: 0,
		expectedPrompt: EnumPromptPlaceholder.GenPrompt,
	},
	{
		tags: [_t_createTag_text('cat'), _t_createTag_wrap(), _t_createTag_brk(), _t_createTag_text('dog')],
		options: { autoBreakBeforeWrap: true },
		note: 'BREAK 前已是換行 — 不重複插入，直接提交',
		expectedWrapCount: 0,
		expectedPrompt: EnumPromptPlaceholder.GenPrompt,
	},
	/**
	 * ── 第二組：需要插入換行 — 走 refresh，不提交 ──
	 * 元件實際行為是 refresh → updateTags → updatePrompt 重跑，
	 * 個別測試以 reenter=false 隔離，只驗證「插入後交棒、不提交」這段編排。
	 */
	{
		tags: [_t_createTag_text('cat'), _t_createTag_brk(), _t_createTag_text('dog')],
		options: { autoBreakBeforeWrap: true },
		note: 'autoBreakBeforeWrap — 於 BREAK 前插入（索引 1）',
		assert: (summary, t) => {
			t.assert.equal(summary.appended.length, 1)
			t.assert.deepEqual(summary.appended[0], {
				value: '\n', localValue: '\n', disabled: false, index: 1, type: 'wrap',
			})
			t.assert.equal(summary.refreshCount, 1)
			t.assert.equal(summary.genPromptCount, 0, '有插入時不應呼叫 genPrompt')
			t.assert.deepEqual(summary.committed, [], '有插入時不應提交')
		},
	},
	{
		tags: [_t_createTag_text('cat'), _t_createTag_brk(), _t_createTag_text('dog')],
		options: { autoBreakAfterWrap: true },
		note: 'autoBreakAfterWrap — 於 BREAK 後插入（索引 2）',
		assert: (summary, t) => {
			t.assert.equal(summary.appended.length, 1)
			t.assert.equal(summary.appended[0].index, 2)
			t.assert.equal(summary.refreshCount, 1)
			t.assert.deepEqual(summary.committed, [], '有插入時不應提交')
		},
	},
	{
		tags: [_t_createTag_text('cat'), _t_createTag_brk(), _t_createTag_text('dog')],
		options: {
			autoBreakBeforeWrap: true,
			autoBreakAfterWrap: true,
		},
		note: '前後都要插入 — 第二個索引需加上先前插入造成的位移（1 → 3）',
		assert: (summary, t) => {
			t.assert.deepEqual(summary.appended.map(record => record.index), [1, 3])
			t.assert.equal(summary.refreshCount, 1)
			t.assert.deepEqual(summary.committed, [], '有插入時不應提交')
		},
	},
	{
		tags: [_t_createTag_brk(), _t_createTag_text('cat')],
		options: { autoBreakBeforeWrap: true },
		note: 'BREAK 位於開頭 — 不產生前方換行（原行為保留），改走提交',
		expectedWrapCount: 0,
		expectedPrompt: EnumPromptPlaceholder.GenPrompt,
	},
	{
		tags: [_t_createTag_text('a'), _t_createTag_brk(), _t_createTag_text('b'), _t_createTag_brk(), _t_createTag_text('c')],
		options: {
			autoBreakBeforeWrap: true,
			autoBreakAfterWrap: true,
		},
		note: '兩個 BREAK — 四處插入，索引分別為 1 / 3 / 5 / 7',
		assert: (summary, t) => {
			t.assert.deepEqual(summary.appended.map(record => record.index), [1, 3, 5, 7])
			t.assert.equal(summary.appended.every(record => record.type === 'wrap'), true)
			t.assert.equal(summary.refreshCount, 1)
			t.assert.deepEqual(summary.committed, [], '有插入時不應提交')
		},
	},
]
