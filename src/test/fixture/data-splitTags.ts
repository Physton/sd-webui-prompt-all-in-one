
import {
	assertNoEdgeWhitespace,
	assertNoInvisibleChars,
	assertNoOrphanCommaRegressions,
} from '../helpers/node-test-helper2';
import type { ISplitTagsCase, ISplitTagsPipelineCase } from '../helpers/types/node-test-case-types';

export const cases: ISplitTagsCase[] = [
	/** ── 基本切割 ── */
	{
		input: 'a, b, c',
		note: 'comma-separated',
		expectOriginalChanged: false,
	},
	{
		input: 'a, b, c,',
		note: 'trailing comma',
		expectOriginalChanged: false,
	},
	{
		input: 'a,  ,  b',
		note: 'empty segments filtered',
		expectOriginalChanged: false,
	},

	/** ── 換行切割 ── */
	{
		input: 'a\nb\nc',
		note: 'newline-separated',
		expectOriginalChanged: false,
	},
	{
		input: 'a\n\n\nb',
		note: 'multiple newlines collapsed',
		expectOriginalChanged: false,
	},
	{
		input: 'a\n\n\nb',
		args: [false, false, { allowKeepEmptyLine: true }],
		note: 'allowKeepEmptyLine — 3+ newlines compressed to one empty line',
		expectOriginalChanged: true,
	},
	{
		input: 'a\n\nb',
		args: [false, false, { allowKeepEmptyLine: true }],
		note: 'allowKeepEmptyLine — existing empty line kept',
		expectOriginalChanged: true,
	},
	{
		input: 'a\n\n\n\n\nb',
		args: [false, false, { allowKeepEmptyLine: true }],
		note: 'allowKeepEmptyLine — many newlines still capped at one empty line',
		expectOriginalChanged: true,
	},
	{
		input: 'a\nb',
		args: [false, false, { allowKeepEmptyLine: true }],
		note: 'allowKeepEmptyLine — single newline unaffected',
		expectOriginalChanged: false,
	},
	{
		input: 'a\rb\nc',
		note: 'CR normalized to LF',
		expectOriginalChanged: false,
	},
	{
		input: 'a\tb',
		note: 'tab converted to newline',
		expectOriginalChanged: false,
	},

	/**
	 * ── 中文 / 日文標點 ──
	 * ，(U+FF0C) 全形逗號 → comma
	 */
	{
		input: '好，壞，普通',
		note: '，fullwidth comma → comma',
		expectOriginalChanged: false,
	},
	/** 。(U+3002) 中日文句號 → period（新版不切割，原版視為 comma 切割） */
	{
		input: '好。壞。普通',
		note: '。Chinese/Japanese period → period (not comma)',
	},
	/** 、(U+3001) 中日文頓號 → comma */
	{
		input: '好、壞、普通',
		note: '、enumeration comma → comma',
		expectOriginalChanged: false,
	},
	/** ；(U+FF1B) 全形分號 → comma */
	{
		input: '好；壞；普通',
		note: '；fullwidth semicolon → comma',
		expectOriginalChanged: false,
	},
	/** ．(U+FF0E) 全形句號 → comma */
	{
		input: '好．壞．普通',
		note: '．fullwidth period → comma',
		expectOriginalChanged: false,
	},

	/** ── 中日文標點：混合 ── */
	{
		input: '好，壞。普通',
		note: '，and 。mixed — comma splits, period does not',
	},
	{
		input: '好、壞；普通',
		note: '、and ；mixed — both become comma',
		expectOriginalChanged: false,
	},
	{
		input: '好．壞。普通',
		note: '．and 。mixed — fullwidth period splits, Japanese period does not',
	},
	{
		input: '好，壞、普通；再來．結束',
		note: 'all five punctuations in one string',
	},

	/** ── 中日文標點：連續 ── */
	{
		input: '好。。壞',
		note: 'consecutive 。 — each becomes period, no split',
	},
	{
		input: '好、、壞',
		note: 'consecutive 、 — each becomes comma, double split',
		expectOriginalChanged: false,
	},
	{
		input: '好，，壞',
		note: 'consecutive ， — each becomes comma, empty segment filtered',
		expectOriginalChanged: false,
	},
	{
		input: '好；；壞',
		note: 'consecutive ； — each becomes comma, empty segment filtered',
		expectOriginalChanged: false,
	},

	/**
	 * ── 中日文標點：含引號 ──
	 * 原版無引號保護，以下皆與新版不同
	 */
	{
		input: '"好，壞"，普通',
		note: '，inside quotes protected',
	},
	{
		input: '"好。壞"。普通',
		note: '。inside quotes protected',
	},
	{
		input: '"好、壞"、普通',
		note: '、inside quotes protected',
	},
	{
		input: '"好；壞"；普通',
		note: '；inside quotes protected',
	},
	{
		input: '"好．壞"．普通',
		note: '．inside quotes protected',
	},

	/** ── 中日文標點：含括號 ── */
	{
		input: '(好，壞)，普通',
		note: '，inside parens protected',
		expectOriginalChanged: false,
	},
	{
		input: '[好。壞]。普通',
		note: '。inside brackets — 。changes to period',
	},

	/** ── 括號保護 ── */
	{
		input: 'a, [b, c], d',
		note: 'square brackets protect inner commas',
		expectOriginalChanged: false,
	},
	{
		input: 'a, <b, c>, d',
		note: 'angle brackets protect inner commas',
		expectOriginalChanged: false,
	},
	{
		input: 'a, {b, c}, d',
		note: 'curly braces protect inner commas',
		expectOriginalChanged: false,
	},

	/** ── 巢狀括號 ── */
	{
		input: 'a, ([b, c]), d',
		note: 'nested bracket types',
		expectOriginalChanged: false,
	},
	{
		input: '[a, [b, c]], d',
		note: 'nested same bracket type',
		expectOriginalChanged: false,
	},

	/** ── BREAK 關鍵字 ── */
	{
		input: 'a, BREAK, b',
		note: 'BREAK keyword splits',
		expectOriginalChanged: false,
	},
	{
		input: 'a\nBREAK\nb',
		note: 'BREAK with newlines',
		expectOriginalChanged: false,
	},

	/** ── LoRA 標籤 ── */
	{
		input: 'a, <lora:model:0.7>, b',
		note: 'LoRA tag preserved as single unit',
		expectOriginalChanged: false,
	},
	{
		input: '<lora:A:1> <lora:B:0.5>, c',
		note: 'multiple LoRA tags',
		expectOriginalChanged: false,
	},

	/**
	 * ── 表情符號保護 ──
	 * 單一字元表情
	 */
	{
		input: 'a, >_<, b',
		note: 'emoji >_< protected',
		expectOriginalChanged: false,
	},
	{
		input: 'a, :<, b',
		note: 'emoji :< protected',
		expectOriginalChanged: false,
	},
	{
		input: 'a, :-(, b',
		note: 'emoji :-( protected',
		expectOriginalChanged: false,
	},
	{
		input: 'a, :-), b',
		note: 'emoji :-) protected',
		expectOriginalChanged: false,
	},
	{
		input: 'a, >: <, b',
		note: 'emoji >: < with space — splits on comma',
		expectOriginalChanged: false,
	},
	{
		input: 'a, >_<, b, :-), c',
		note: 'multiple emojis in sequence',
		expectOriginalChanged: false,
	},

	/** ── 表情符號：相鄰逗號 ── */
	{
		input: '>_<,hello',
		note: 'emoji at start',
		expectOriginalChanged: false,
	},
	{
		input: 'hello,>_<',
		note: 'emoji at end',
		expectOriginalChanged: false,
	},
	{
		input: '>_<,>_<',
		note: 'two emojis adjacent',
		expectOriginalChanged: false,
	},

	/** ── 表情符號：含引號 ── */
	{
		input: '":(", hello',
		note: 'emoji with quote at start',
	},
	{
		input: '":)", world"',
		note: 'emoji between quotes',
	},

	/** ── 表情符號：與中日文標點混合 ── */
	{
		input: '>_<，hello',
		note: 'emoji with ，(fullwidth comma)',
		expectOriginalChanged: false,
	},
	{
		input: 'hello、>_<',
		note: 'emoji with 、(enumeration comma)',
		expectOriginalChanged: false,
	},
	{
		input: ':-)，world',
		note: 'emoji with ，(fullwidth comma)',
		expectOriginalChanged: false,
	},

	/** ── 空值 / 邊界 ── */
	{
		input: '',
		note: 'empty string',
		expectOriginalChanged: false,
	},
	{
		input: '   ',
		note: 'whitespace only',
		expectOriginalChanged: false,
	},
	{
		input: null,
		note: 'null input',
		expectOriginalChanged: false,
	},
	{
		input: undefined,
		note: 'undefined input',
		expectOriginalChanged: false,
	},
	{
		input: false,
		note: 'boolean false input',
		expectOriginalChanged: false,
	},

	/**
	 * ── 輸入清理（trimPromptText）──
	 * splitTags 入口先清除不可見字元（\x00 NULL、\u200b 零寬空格）
	 * 並修剪邊界水平空白；換行是結構（wrap 標記），不得被修剪。
	 *
	 * 除快照外，另以 assertResult 直接断言意图：
	 *   - 結果中不得殘留任何不可見字元
	 *   - 邊界空白被清除（首尾 tag 無多餘空白）
	 *   - 換行標記數量與位置完全保留（清理不得吃掉結構）
	 */
	{
		input: '​abc, def',
		note: 'cleanup: leading zero-width space removed',
		assertResult: (r, t) =>
		{
			assertNoInvisibleChars(r, t)
			t.assert.equal(r[0], 'abc', '首段應為 abc（前導零寬空格已清除）')
		},
	},
	{
		input: 'abc​, def',
		note: 'cleanup: zero-width space inside segment removed',
		assertResult: (r, t) =>
		{
			assertNoInvisibleChars(r, t)
			t.assert.equal(r[0], 'abc', '段內零寬空格已清除，不破壞逗號分割')
		},
	},
	{
		input: 'abc, def​',
		note: 'cleanup: trailing zero-width space removed',
		assertResult: (r, t) =>
		{
			assertNoInvisibleChars(r, t)
			t.assert.equal(r[1], 'def', '末段應為 def（尾隨零寬空格已清除）')
		},
	},
	{
		input: 'a\u0000b, c',
		note: 'cleanup: NULL char removed',
		assertResult: (r, t) =>
		{
			assertNoInvisibleChars(r, t)
			t.assert.equal(r[0], 'ab', 'NULL 字元移除後 a、b 併為一段')
		},
	},
	{
		input: '  abc ,  def  ',
		note: 'cleanup: edge spaces trimmed, internal kept',
		assertResult: (r, t) =>
		{
			assertNoEdgeWhitespace(r, t)
			t.assert.deepEqual(r, ['abc', 'def'], '邊界空白清除後僅剩兩個純淨標籤')
		},
	},
	{
		input: ' \nabc\n ',
		note: 'cleanup: edge spaces trimmed but boundary newlines preserved',
		assertResult: (r, t) =>
		{
			assertNoEdgeWhitespace(r, t)
			t.assert.deepEqual(r, ['\n', 'abc', '\n'],
				'換行是結構：清理只移除邊界空白，分行標記位置與數量不得變動',
			)
		},
	},
	{
		input: '​\u0000',
		note: 'cleanup: invisible-chars-only input returns []',
		assertResult: (r, t) =>
		{
			t.assert.deepEqual(r, [], '全為不可見字元時應視為空輸入')
		},
	},
	{
		input: '﻿abc, def',
		note: 'cleanup: edge BOM (U+FEFF) removed — JS \\s includes U+FEFF',
		assertResult: (r, t) =>
		{
			t.assert.equal(r[0], 'abc', '邊界 BOM 被 \\s 連帶清除（已知副作用，鎖定現況）')
		},
	},

	/** ── 分行邊界 ── */
	{
		input: '\n',
		note: 'newline only — whitespace guard returns []',
	},
	{
		input: '\n\n\n',
		note: 'multiple newlines only — collapsed then guard returns []',
	},
	{
		input: ' \n ',
		note: 'whitespace + newline — guard returns []',
	},
	{
		input: 'abc\n',
		note: 'trailing newline — splits, marker at end',
	},
	{
		input: '\nabc',
		note: 'leading newline — marker at start',
	},
	{
		input: 'a BREAK\nb',
		note: 'newline directly after BREAK — marker follows BREAK',
	},

	/** ── prompt weight ── */
	{
		input: '(fire extinguisher: 1.0, 2.0), a',
		note: 'weight syntax — inner comma preserved',
		expectOriginalChanged: false,
	},

	/** ── 引號保護 ── */
	{
		input: 'with "Small joys. Brighter days." below.',
		note: 'quoted sentence — comma inside protected',
	},
	{
		input: "with 'hello, world' end",
		note: 'single-quoted comma protected',
	},
	{
		input: '"a, b", c, "d, e"',
		note: 'multiple quoted segments with commas',
	},
	{
		input: "it's a, b, c",
		note: 'apostrophe — not a quote opener',
	},
	{
		input: "pathâ's leading line",
		note: 'apostrophe after non-ASCII letter (â) — not a quote opener',
	},
	{
		input: "\ud83d\ude80's launch, next",
		note: 'apostrophe after emoji — not a quote opener',
	},
	{
		input: "a,'b, c'",
		note: 'known: quote directly after comma (no space) — \\S rule treats as apostrophe, falls back to original behavior',
		expectOriginalChanged: false,
	},
	{
		input: "caf\u00e9's best, \"it's fine\"",
		note: 'non-ASCII apostrophe + quoted apostrophe',
	},
	{
		input: '"quoted\nnewline", next',
		note: 'newline inside quotes still splits',
	},
	{
		input: 'line one\nline two',
		note: 'newline outside quotes — baseline structure',
	},
	{
		input: '"line one\nline two"',
		note: 'newline inside quotes — identical structure to outside (\\n marker included)',
	},
	{
		input: 'pre "quoted\nnext" post',
		note: 'quote opens mid-text, newline still splits with marker',
	},
	{
		input: '"a, b"\n"c, d"',
		note: 'quoted segments with newline between',
	},
	{
		input: '"a, b"\nc, d',
		note: 'quoted then newline then unquoted split',
	},

	/** ── 未閉合引號 ── */
	{
		input: 'a, "b, c',
		note: 'unclosed double quote — comma protected to end',
	},
	{
		input: "a, 'b, c",
		note: 'unclosed single quote — ignored at segmentation, comma splits (matches original)',
		expectOriginalChanged: false,
	},
	{
		input: "x 'a \"b, c\" d, e\nnext",
		note: 're-process: unclosed single ignored, closed double quote still protects',
	},
	{
		input: 'pre "quoted\nnext',
		note: 'unclosed double quote + newline — newline still splits',
	},
	{
		input: "pre 'quoted\nnext",
		note: 'unclosed single quote + newline — newline still splits',
	},
	{
		input: '"a, b, c',
		note: 'entire input is unclosed quote — no split',
	},
	{
		input: 'x, y, "z',
		note: 'splits before quote opens, rest protected',
	},
	{
		input: 'a, "',
		note: 'unclosed quote with only quote char',
	},
	{
		input: 'a, "好、壞',
		note: 'unclosed quote + Chinese enumeration comma — preserved, not converted',
	},
	{
		input: 'a, "b, BREAK',
		note: 'unclosed quote + BREAK — BREAK not keyword inside quote',
	},
	{
		input: "a, 'it's fine",
		note: 'unclosed single quote after apostrophe — first quote opens, second is content',
	},
	{
		input: 'a "b, c\nd, e',
		note: 'unclosed double quote ends at newline — line 2 commas split normally (quote not carried over)',
		expectOriginalChanged: true,
	},

	/** ── 引號緊鄰分行前後 ── */
	{
		input: '"a"\nb',
		note: 'closed quote directly before newline',
	},
	{
		input: "'a'\nb",
		note: 'closed single quote directly before newline',
	},
	{
		input: 'a\n"b"',
		note: 'quote opens directly after newline',
	},
	{
		input: "a\n'b'",
		note: 'single quote opens directly after newline — prev is \\n, not apostrophe',
	},
	{
		input: '"a"\n"b"',
		note: 'quotes on both sides of newline',
	},
	{
		input: 'a\n"b\nc',
		note: 'unclosed quote starts right after newline — inner newline still splits',
	},
	{
		input: '"a\n',
		note: 'unclosed quote ends at newline — split, empty tail dropped',
	},
	{
		input: '\n"a',
		note: 'newline at start then unclosed quote',
	},

	/** ── 括號內分行 ── */
	{
		input: '(a\nb)',
		note: 'newline in parens — splits, comma rule unaffected',
	},
	{
		input: '[a\nb]',
		note: 'newline in square brackets — splits',
	},
	{
		input: '{a\nb}',
		note: 'newline in curly braces — splits',
	},
	{
		input: '(a, b\nc, d)',
		note: 'newline in parens — inner comma still protected',
	},
	{
		input: '([a\nb])',
		note: 'newline in nested brackets — splits, state reset',
	},
	{
		input: '(a "b\nc")',
		note: 'newline in brackets inside quote — splits',
	},

	/** ── 混合引號：單引號與雙引號同時存在 ── */
	{
		input: "\"a\" 'b', c",
		note: 'both quote types closed, comma outside splits',
	},
	{
		input: "'a \"b\" c', d",
		note: 'double quotes inside single quote — inner comma protected',
	},
	{
		input: "\"a, 'b, c'\"",
		note: 'single quotes inside double quote — inner comma protected',
	},
	{
		input: "\"it's fine, really\"",
		note: 'apostrophe inside double quotes — content, comma protected',
	},
	{
		input: "'a \"b, c\" d'",
		note: 'double-quoted comma inside single quotes — protected',
	},
	{
		input: "\"a\" 'b'\nc",
		note: 'both quote types closed before newline',
	},
	{
		input: "'a'\n\"b\"",
		note: 'single quote before newline, double quote after',
	},
	{
		input: "\"a 'b' c\"\nd",
		note: 'mixed quotes inside double quotes, then newline',
	},
	{
		input: "a \"b 'c",
		note: 'unclosed double quote containing single quote char',
	},
	{
		input: "'a \"b'",
		note: 'single quote containing double quote char, closed',
	},

	/** ── 真實場景摘錄 ── */
	{
		input: '"くらしに、さくらを。" beneath',
		note: 'excerpt: Japanese period inside quotes',
	},
	{
		input: '"いつもの日を、少し特別に。" with',
		note: 'excerpt: Japanese comma + period in quotes',
	},
	{
		input: '"今日も、いい一日を。" with',
		note: 'excerpt: another Japanese comma + period',
	},
	{
		input: '"さくらの季節をもっと身近に。".',
		note: 'excerpt: Japanese period then English period',
	},
	{
		input: 'lists "たばこ", "お弁当", "飲み物", "スイーツ", and "日用品"',
		note: 'excerpt: quoted items separated by commas',
	},
	{
		input: 'The left window poster reads "今日も、いい一日を。" with "Good day. Better tomorrow." below.',
		note: 'excerpt: period-space splits outside quotes',
	},
	{
		input: 'The right window poster reads "さくらの季節をもっと身近に。".',
		note: 'excerpt: Japanese period then trailing English period',
	},

	/** ── 真實場景 ── */
	{
		input: "her fingers and the orks' legs; gnarled dead trees stand as dark silhouettes at the frame edges, dense fog swallows the middle distance, \n#, \npixelated",
		note: "real-world: unclosed single quote (orks') ignored at segmentation — comma rules re-applied, newlines split",
		expectOriginalChanged: false,
	},
]


/** 需要進行跨模組驗證的特定提示詞 */
export const pipelineCases: ISplitTagsPipelineCase[] = [
	/** 完整提示詞 */
	{
		input: 'Prominent readable text and placement: the main illuminated facade at upper left-center reads "Sakura Stop" with "くらしに、さくらを。" beneath. The right side of the fascia reads "いつもの日を、少し特別に。" with "Small joys. Brighter days." below. The tall illuminated sign above the slope reads "Sakura Stop" and lists "たばこ", "お弁当", "飲み物", "スイーツ", and "日用品". The left window poster reads "今日も、いい一日を。" with "Good day. Better tomorrow." below. The right window poster reads "さくらの季節をもっと身近に。". A pink vertical banner beside the store reads "さくらと、いい毎日を。". The roadside vertical sign at far right reads "海の見える町". The downhill road includes the white marking "止まれ" near the lower distance.',
		note: 'full prompt pipeline',
		expectChanged: true,
		expectOriginalChanged: true,
	},

	/** 複雜 prompt（含 weight、LoRA、BREAK） */
	{
		input: 'masterpiece, best quality, (1girl:1.2), <lora:add_detail:0.6>, BREAK, forest, trees',
		note: 'complex prompt pipeline',
	},

	/** 含引號的短 prompt */
	{
		input: 'with "Small joys, Brighter days." below.',
		note: 'quoted comma pipeline',
	},

	/** 含中文標點的 prompt */
	{
		input: '好，壞，普通',
		note: 'Chinese comma pipeline',
	},

	/** 含括號巢狀的 prompt */
	{
		input: 'a, (b, c), d',
		note: 'parentheses pipeline',
	},

	{ input: '一位穿著太空衣的貓、復古老舊的紅色跑車' },

	/** 分行 marker 管線直通 */
	{
		input: 'line one\nline two',
		note: 'pipeline newline — splitTags "\\\\n" marker passes through splitByPeriod unchanged',
		expectChanged: false,
	},

	/** 分號切割選項（splitSemicolon，預設關閉；開啟時併入句號機制） */
	{
		input: "her fingers and the orks' legs; gnarled dead trees stand as dark silhouettes at the frame edges, dense fog swallows the middle distance, \n#, \npixelated",
		note: 'pipeline splitSemicolon — semicolon splits like period (option B)',
		splitByPeriodOptions: { autoSplitByPeriodSemicolon: true },
		expectChanged: true,
		expectOriginalChanged: false,
	},

	{ input: '一位女孩，她正坐在中国城市街头普通的金属材质公交站台长椅上等车。身侧是一个带有广告牌的公交站牌，路边是平整的沥青人行道，背景可以看到远处的老旧居民楼和几棵行道树，自然光线均匀地照射在人物身上，画面呈现出手机实拍的质感，色调真实自然，人物神态平和，背景有日常生活的街道细节。' },

	/** --- */
]