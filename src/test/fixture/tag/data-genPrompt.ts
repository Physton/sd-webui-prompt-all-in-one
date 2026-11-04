
import type { IGenPromptCase } from '../../helpers/types/node-test-case-types';
import { _t_createTag_brk, _t_createTag_lora, _t_createTag_lora_weight, _t_createTag_lyco, _t_createTag_text, _t_createTag_wrap } from '../../helpers/tag-factories';


export const genPromptCases: IGenPromptCase[] = [
	/**
	 * ── 第一組：預設選項全關 ──
	 * 只驗證「標籤串接 + 預設逗號」的基本行為，其餘選項案例的基準。
	 */
	{
		input: [_t_createTag_text('cat'), _t_createTag_text('dog')],
		note: '兩個一般標籤 — 預設以 ", " 串接，末段仍帶逗號（autoRemoveLastComma 關閉）',
		expected: 'cat, dog, ',
	},
	{
		input: [_t_createTag_text('cat'), _t_createTag_text('dog')],
		args: [false, { autoRemoveLastComma: true }],
		note: 'autoRemoveLastComma — 最後一個標籤不加逗號',
		expected: 'cat, dog',
	},
	{
		input: [_t_createTag_text('cat'), _t_createTag_text('dog')],
		args: [false, { autoRemoveSpace: true }],
		note: 'autoRemoveSpace — 分割符號不含空白',
		expected: 'cat,dog,',
	},
	/**
	 * ── 第二組：換行（wrap）與 BREAK ──
	 */
	{
		input: [_t_createTag_text('cat'), _t_createTag_wrap(), _t_createTag_text('dog')],
		note: '中間為換行標籤 — 換行符獨立成段，前段仍保留預設逗號',
		expected: 'cat, \ndog, ',
	},
	{
		input: [_t_createTag_text('cat'), _t_createTag_wrap(), _t_createTag_text('dog')],
		args: [false, { autoRemoveBeforeLineComma: true }],
		note: 'autoRemoveBeforeLineComma — 換行前的逗號一併移除',
		expected: 'cat\ndog, ',
	},
	{
		input: [_t_createTag_text('cat'), _t_createTag_brk(), _t_createTag_text('dog')],
		note: 'BREAK 標籤 — 前段以空白分隔，BREAK 後段以空白分隔',
		expected: 'cat BREAK dog, ',
	},
	/**
	 * ── 第三組：autoOptimizeSplitSymbol ──
	 * 規則 1（連續 Lora）與規則 2（下一個是 BREAK）由 shouldRemoveCommaByAutoOptimize 判定。
	 */
	{
		input: [_t_createTag_lora('foo'), _t_createTag_lora('bar')],
		args: [false, { autoOptimizeSplitSymbol: true }],
		note: 'autoOptimizeSplitSymbol — 連續 Lora 之間的逗號被移除（規則 1）',
		expected: '<lora:foo:1> <lora:bar:1>, ',
	},
	{
		input: [_t_createTag_lora('foo'), _t_createTag_lora('bar')],
		args: [false, { autoOptimizeSplitSymbol: true, autoRemoveLoraAfterComma: true }],
		note: 'autoOptimizeSplitSymbol + autoRemoveLoraAfterComma — 末段 Lora 的逗號換成空白（autoRemoveSpace 關閉時保留空白）',
		expected: '<lora:foo:1> <lora:bar:1> ',
	},
	/**
	 * ── 第四組：disabled 過濾 ──
	 */
	{
		input: [_t_createTag_text('cat'), { ..._t_createTag_text('dog'), disabled: true }],
		note: '預設過濾 disabled 標籤',
		expected: 'cat, ',
	},
	{
		input: [_t_createTag_text('cat'), { ..._t_createTag_text('dog'), disabled: true }],
		args: [true],
		note: 'ignoreDisabled=true — 保留 disabled 標籤',
		expected: 'cat, dog, ',
	},
	/**
	 * ── 第五組：'#' 標記 ──
	 * 規則 3（該行含 # 開頭/結尾）在 shouldRemoveCommaBeforeWrap 中被註解停用，
	 * lineHasSharp 仍會累計但不影響結果——此案例把現況鎖定下來。
	 */
	{
		input: [_t_createTag_text('#'), _t_createTag_wrap(), _t_createTag_text('cat')],
		args: [false, { autoOptimizeSplitSymbol: true }],
		note: "autoOptimizeSplitSymbol — '#' 本身的結果快照",
		/**
		 * 本案例只留下結果快照、不寫 expected/assert（本組不開 suiteAllowSnapshotOnly）。
		 * 快照是回歸紀錄、不是斷言，故此案例不被驗證。
		 * 需要明確期望時移除本欄位。
		 */
		caseAllowSnapshotOnly: true,
	},
	/**
	 * ── 第六組：autoSplitByPeriod ──
	 * noCommaAfter 由 applySplitByPeriod 標記，genPrompt 只負責依標記去逗號。
	 */
	{
		input: [{ ..._t_createTag_text('a'), noCommaAfter: true }, _t_createTag_text('b')],
		args: [false, { autoSplitByPeriod: true }],
		note: 'autoSplitByPeriod — 已標記 noCommaAfter 的中間段不加逗號',
		expected: 'a b, ',
	},
	/**
	 * ── 第七組：邊界 ──
	 */
	{
		input: [],
		note: '空標籤陣列 — 回傳空字串',
		expected: '',
	},
	{
		input: [{ ..._t_createTag_text('cat'), disabled: true }],
		note: '全部為 disabled — 回傳空字串',
		expected: '',
	},
	/**
	 * ── 第八組：autoRemoveDuplicateLora ──
	 * 以名稱為重複鍵去除重複的 Lora / Lyco，保留最後一個（filterDuplicateLoraTags）。
	 * `#` 之後（同分行）與 disabled 的 Lora 不參與去重。
	 */
	{
		input: [_t_createTag_lora('foo'), _t_createTag_lora('foo')],
		note: 'autoRemoveDuplicateLora 關閉（預設）— 重複 Lora 一律保留',
		expected: '<lora:foo:1>, <lora:foo:1>, ',
	},
	{
		input: [_t_createTag_lora('foo'), _t_createTag_lora('foo')],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora — 同名重複只保留最後一個',
		expected: '<lora:foo:1>, ',
	},
	{
		input: [_t_createTag_lora('foo'), _t_createTag_lora('bar'), _t_createTag_lora('foo')],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora — 三個中移除最早的 foo，bar 不受影響',
		expected: '<lora:bar:1>, <lora:foo:1>, ',
	},
	{
		input: [_t_createTag_lora_weight('foo', 1), _t_createTag_lora_weight('foo', '0.5')],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora — 權重不視為差異，保留最後一個（權重 0.5）',
		expected: '<lora:foo:0.5>, ',
	},
	{
		input: [_t_createTag_lora('foo'), _t_createTag_lyco('foo')],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora — lora / lyco 同名視為同一個，保留最後一個',
		expected: '<lyco:foo:1>, ',
	},
	{
		input: [
			{ ..._t_createTag_lora_weight('foo', 1), loraName: 'foo' },
			{ ..._t_createTag_lora_weight('foo', '0.5'), loraName: 'foo' },
		],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora — loraName 存在時直接作為重複鍵，不手動解析 value',
		expected: '<lora:foo:0.5>, ',
	},
	{
		input: [
			{ ..._t_createTag_lora('foo'), loraName: 'foo' },
			{ ..._t_createTag_text('foo bar'), isLora: true, loraName: 'foo' },
		],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora — loraName 優先於 value：value 手動解析結果不同仍視為重複',
		expected: 'foo bar, ',
	},
	{
		input: [
			{ ..._t_createTag_lyco('foo'), lycoName: 'foo' },
			{ ..._t_createTag_text('foo bar'), isLyco: true, lycoName: 'foo' },
		],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora — lycoName 存在時直接作為重複鍵',
		expected: 'foo bar, ',
	},
	{
		input: [_t_createTag_lora('foo'), _t_createTag_lora('bar')],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora — 名稱不同不互相去重',
		expected: '<lora:foo:1>, <lora:bar:1>, ',
	},
	{
		input: [_t_createTag_text('cat'), _t_createTag_text('cat')],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora — 一般文字 tag 的重複不受影響',
		expected: 'cat, cat, ',
	},
	{
		input: [_t_createTag_lora('foo'), _t_createTag_text('#'), _t_createTag_lora('foo')],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: "autoRemoveDuplicateLora — '#' 之後的 Lora 不參與去重，兩個 foo 都保留",
		expected: '<lora:foo:1>, #, <lora:foo:1>, ',
	},
	{
		input: [_t_createTag_text('#'), _t_createTag_lora('foo'), _t_createTag_wrap(), _t_createTag_lora('foo')],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora — # 保護僅限該行，下一行的同名 Lora 參與去重後保留最後一個',
		expected: '#, <lora:foo:1>, \n<lora:foo:1>, ',
	},
	{
		input: [_t_createTag_lora('foo'), _t_createTag_wrap(), _t_createTag_lora('foo')],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora — 分行不阻斷去重，跨行同名仍保留最後一個',
		expected: '\n<lora:foo:1>, ',
	},
	{
		input: [_t_createTag_lora('foo'), { ..._t_createTag_lora('foo'), disabled: true }],
		args: [false, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora — disabled 的 Lora 不參與去重（預設已先行過濾 disabled）',
		expected: '<lora:foo:1>, ',
	},
	{
		input: [{ ..._t_createTag_lora('foo'), disabled: true }, _t_createTag_lora('foo')],
		args: [true, { autoRemoveDuplicateLora: true }],
		note: 'autoRemoveDuplicateLora + ignoreDisabled=true — disabled 不移除、也不使啟用者被去重',
		expected: '<lora:foo:1>, <lora:foo:1>, ',
	},
]
