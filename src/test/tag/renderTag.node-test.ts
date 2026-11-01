/**
 * renderTag.node-test.ts
 *
 * 驗證 renderTagCore() 的顯示結構：一般 / sharp / 權重 / BREAK / lora-like 分段。
 * lora-like 的期望值刻意寫死完整 HTML——分段後的 class 是樣式掛勾，
 * 改動 class 名稱等同改動擴充樣式的契約，必須由測試明確擋下。
 */

import { describe, it } from 'node:test'
import { runCases } from '../helpers/node-test-helpers'
import { renderTagCore } from '@/utils/promptTagRender/renderTag'
import { _t_createTag_core, _t_createTag_brk, _t_createTag_text } from '../helpers/tag-factories'
import { EnumPromptTagType, IPromptTag } from '@/utils/promptTags/tag-types'
import type { IPromptOptionValueRecordWithLegacyRuntime } from '@/utils/promptOptions/definitions'
import type { IRunCase } from '../helpers/types/node-test-case-types'

/** 單一案例的輸入：要渲染的 tag 與渲染旗標。 */
interface IRenderTagInput
{
	tag?: IPromptTag;
	options?: IPromptOptionValueRecordWithLegacyRuntime;
}

type IRenderTagCase = IRunCase<IRenderTagInput, [], string>

/**
 * 把案例輸入收斂成 renderTagCore(tag, options) 的呼叫形狀，
 * 讓 runCases 的單一 input 參數能同時帶 tag 與選項。
 */
function renderInput(input: IRenderTagInput): string
{
	return renderTagCore(input.tag, input.options ?? {})
}

describe('renderTag', () => {
	it('module loads successfully', (t) => {
		t.assert.equal(typeof renderTagCore, 'function')
	})

	const cases: IRenderTagCase[] = [
		{
			note: '一般 tag 只包一層 character',
			input: {tag: _t_createTag_text('cat')},
			expected: '<div class="character">cat</div>',
		},
		{
			note: 'value 內的 HTML 會被 escape',
			input: {tag: _t_createTag_text('<b>a</b>')},
			expected: '<div class="character">&lt;b&gt;a&lt;/b&gt;</div>',
		},
		{
			note: '# tag 加上 sharp-character',
			input: {tag: _t_createTag_text(EnumPromptTagType.VALUE_SHARP)},
			expected: '<div class="character sharp-character">#</div>',
		},
		{
			note: 'BREAK 未開啟自動斷行時等同一般 tag',
			input: {tag: _t_createTag_brk()},
			expected: '<div class="character">BREAK</div>',
		},
		{
			note: 'BREAK 開啟 autoBreakBeforeWrap 時渲染成分隔線',
			input: {tag: _t_createTag_brk(), options: {autoBreakBeforeWrap: true}},
			expected: '<div class="break-character">---------------------</div> <div class="character">BREAK</div> <div class="break-character">---------------------</div>',
		},
		{
			note: 'undefined tag 回傳空字串',
			input: {},
			expected: '',
		},
		{
			note: '括號內結尾的權重數字獨立標記為 weight-number-character',
			input: {tag: _t_createTag_text('(cat:1.2)', {incWeight: 1})},
			expected: [
				'<div class="weight-character">(</div>',
				'<div class="character">cat</div>',
				'<div class="weight-number-character">:1.2</div>',
				'<div class="weight-character">)</div>',
			].join(''),
		},
		{
			note: '遞減括號內的權重數字依數字正負分色（正數仍為 inc）',
			input: {tag: _t_createTag_text('[cat:0.5]', {decWeight: 1})},
			expected: [
				'<div class="weight-character dec-weight-character">[</div>',
				'<div class="character">cat</div>',
				'<div class="weight-number-character">:0.5</div>',
				'<div class="weight-character dec-weight-character">]</div>',
			].join(''),
		},
		{
			note: '負數權重數字疊上 dec-weight-number-character',
			input: {tag: _t_createTag_text('(cat:-0.4)', {incWeight: 1})},
			expected: [
				'<div class="weight-character">(</div>',
				'<div class="character">cat</div>',
				'<div class="weight-number-character dec-weight-number-character">:-0.4</div>',
				'<div class="weight-character">)</div>',
			].join(''),
		},
		{
			note: '權重數字為 0 時不標記，留在本體',
			input: {tag: _t_createTag_text('(cat:0)', {incWeight: 1})},
			expected: [
				'<div class="weight-character">(</div>',
				'<div class="character">cat:0</div>',
				'<div class="weight-character">)</div>',
			].join(''),
		},
		{
			note: '沒有結尾權重數字時整段維持單一 character',
			input: {tag: _t_createTag_text('(cat)', {incWeight: 2})},
			expected: [
				'<div class="weight-character">((</div>',
				'<div class="character">cat</div>',
				'<div class="weight-character">))</div>',
			].join(''),
		},
		{
			note: 'lora 依 <lora: / name / :weight / > 拆成四段，正權重套用權重數值樣式',
			input: {tag: _t_createTag_core(EnumPromptTagType.lora, '<lora:myLora:0.8>', {isLora: true})},
			expected: [
				'<div class="character lora-like-open-character">&lt;lora:</div>',
				'<div class="character lora-like-name-character">myLora</div>',
				'<div class="weight-number-character lora-like-weight-character">:0.8</div>',
				'<div class="character lora-like-close-character">&gt;</div>',
			].join(''),
		},
		{
			note: '負權重疊上 dec-weight-number-character，與遞減權重同色',
			input: {tag: _t_createTag_core(EnumPromptTagType.lora, '<lora:myLora:-0.35>', {isLora: true})},
			expected: [
				'<div class="character lora-like-open-character">&lt;lora:</div>',
				'<div class="character lora-like-name-character">myLora</div>',
				'<div class="weight-number-character dec-weight-number-character lora-like-weight-character">:-0.35</div>',
				'<div class="character lora-like-close-character">&gt;</div>',
			].join(''),
		},
		{
			note: '權重 0 不套用權重數值樣式，只保留角色 class',
			input: {tag: _t_createTag_core(EnumPromptTagType.lora, '<lora:myLora:0>', {isLora: true})},
			expected: [
				'<div class="character lora-like-open-character">&lt;lora:</div>',
				'<div class="character lora-like-name-character">myLora</div>',
				'<div class="character lora-like-weight-character">:0</div>',
				'<div class="character lora-like-close-character">&gt;</div>',
			].join(''),
		},
		{
			note: '未帶權重的 lora 只產生三段',
			input: {tag: _t_createTag_core(EnumPromptTagType.lora, '<lora:myLora>', {isLora: true})},
			expected: [
				'<div class="character lora-like-open-character">&lt;lora:</div>',
				'<div class="character lora-like-name-character">myLora</div>',
				'<div class="character lora-like-close-character">&gt;</div>',
			].join(''),
		},
		{
			note: 'lyco 與 lora 共用同一組分段 class',
			input: {tag: _t_createTag_core(EnumPromptTagType.lyco, '<lyco:abc:1>', {isLyco: true})},
			expected: [
				'<div class="character lora-like-open-character">&lt;lyco:</div>',
				'<div class="character lora-like-name-character">abc</div>',
				'<div class="weight-number-character lora-like-weight-character">:1</div>',
				'<div class="character lora-like-close-character">&gt;</div>',
			].join(''),
		},
		{
			note: 'lora 帶 incWeight 時，分段結構被權重符號包住',
			input: {
				tag: _t_createTag_core(EnumPromptTagType.lora, '<lora:abc:1>', {isLora: true, incWeight: 2}),
			},
			expected: [
				'<div class="weight-character">((</div>',
				'<div class="character lora-like-open-character">&lt;lora:</div>',
				'<div class="character lora-like-name-character">abc</div>',
				'<div class="weight-number-character lora-like-weight-character">:1</div>',
				'<div class="character lora-like-close-character">&gt;</div>',
				'<div class="weight-character">))</div>',
			].join(''),
		},
		{
			note: '不符 lora 分段語法（缺結尾 >）時退回單一 character，不改變顯示內容',
			input: {tag: _t_createTag_core(EnumPromptTagType.lora, '<lora:a:1', {isLora: true})},
			expected: '<div class="character">&lt;lora:a:1</div>',
		},
	]

	runCases('renderTag cases', renderInput, cases)
})
