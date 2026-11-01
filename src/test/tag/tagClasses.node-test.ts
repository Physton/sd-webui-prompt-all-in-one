/**
 * tagClasses.node-test.ts
 *
 * 驗證 getTagClasses() 的分類互斥與順序：lora → lyco → embedding → 一般 tag。
 * class 名稱是 main.less 與擴充樣式的契約，故以完整陣列比對，改名即失敗。
 */

import { describe, it } from 'node:test'
import { runCases } from '../helpers/node-test-helpers'
import { getTagClasses } from '@/utils/promptTags/tagClasses'
import { _t_createTag_core, _t_createTag_text, _t_createTag_wrap } from '../helpers/tag-factories'
import { EnumPromptTagType, IPromptTag } from '@/utils/promptTags/tag-types'
import type { IRunCase } from '../helpers/types/node-test-case-types'

/** 單一案例的輸入：分類後的 tag 與是否為反向提示詞。 */
interface ITagClassesInput
{
	tag?: IPromptTag;
	neg?: boolean;
}

type ITagClassesCase = IRunCase<ITagClassesInput, [], string[]>

/**
 * 把案例輸入收斂成 getTagClasses(tag, { neg }) 的呼叫形狀。
 */
function classesOf(input: ITagClassesInput)
{
	return getTagClasses(input.tag, {neg: input.neg})
}

describe('tagClasses', () => {
	it('module loads successfully', (t) => {
		t.assert.equal(typeof getTagClasses, 'function')
	})

	const cases: ITagClassesCase[] = [
		{
			note: '一般 tag 只有基底 class',
			input: {tag: _t_createTag_text('cat')},
			expected: ['prompt-tag-value'],
		},
		{
			note: '反向提示詞的一般 tag 加上 neg-tag',
			input: {tag: _t_createTag_text('cat'), neg: true},
			expected: ['prompt-tag-value', 'neg-tag'],
		},
		{
			note: '分行 tag 沒有分類欄位，只回基底 class',
			input: {tag: _t_createTag_wrap()},
			expected: ['prompt-tag-value'],
		},
		{
			note: '已載入的 lora',
			input: {tag: _t_createTag_core(EnumPromptTagType.lora, '<lora:a:1>', {isLora: true, loraExists: true})},
			expected: ['prompt-tag-value', 'lora-tag'],
		},
		{
			note: '不存在的 lora 追加 lora-not-exists',
			input: {tag: _t_createTag_core(EnumPromptTagType.lora, '<lora:a:1>', {isLora: true, loraExists: false})},
			expected: ['prompt-tag-value', 'lora-tag', 'lora-not-exists'],
		},
		{
			note: '已載入的 lyco',
			input: {tag: _t_createTag_core(EnumPromptTagType.lyco, '<lyco:a:1>', {isLyco: true, lycoExists: true})},
			expected: ['prompt-tag-value', 'lyco-tag'],
		},
		{
			note: '不存在的 lyco 追加 lyco-not-exists',
			input: {tag: _t_createTag_core(EnumPromptTagType.lyco, '<lyco:a:1>', {isLyco: true, lycoExists: false})},
			expected: ['prompt-tag-value', 'lyco-tag', 'lyco-not-exists'],
		},
		{
			note: 'embedding 優先於 neg-tag，不因反向提示詞被歸類成一般 tag',
			input: {tag: _t_createTag_text('myEmbedding', {isEmbedding: true, embeddingName: 'myEmbedding'}), neg: true},
			expected: ['prompt-tag-value', 'embedding-tag'],
		},
	]

	runCases('tagClasses cases', classesOf, cases)
})
