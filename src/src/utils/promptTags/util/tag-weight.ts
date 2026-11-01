/**
 * tag 權重的純邏輯：權重數字正則、括號層數計算與權重語法改寫。
 */

import { IPromptTag, IPromptTagValue } from '../tag-types';
import type { IHostPromptOptions } from '../types';
import { tagIsExtraNetworks } from '../util';

export const enum EnumTagWeightSymbol
{
	/** NovelAI 的權重符號 options.useNovelAiWeightSymbol = true 時使用 */
	NovelAiWeightSymbolOpen = '{',
	NovelAiWeightSymbolClose = '}',

	/** 一般模型的權重符號 */
	IncWeightSymbolOpen = '(',
	IncWeightSymbolClose = ')',


	DecWeightSymbolOpen = '[',
	DecWeightSymbolClose = ']',

	/** 非權重符號的通用尖括號 `<` `>`：如 `<lora:...>` 語法，僅由括號對照表取值 */
	AngleOpen = '<',
	AngleClose = '>',
}

export type IBracketPairInput = EnumTagWeightSymbol | (string & {})

/**
 * 括號配對 `[開括號, 閉括號]`：hasBrackets() 的回傳形狀，
 * 也是權重括號判定與括號改寫共用的輸入。
 */
export type IBracketPair<T extends IBracketPairInput = IBracketPairInput> = [open: T, close: T]

export type IBracketPairMap = Record<string, EnumTagWeightSymbol>

/** 一般模型的加權括號組 `()` */
const INC_WEIGHT_BRACKET = [
	EnumTagWeightSymbol.IncWeightSymbolOpen,
	EnumTagWeightSymbol.IncWeightSymbolClose,
] satisfies IBracketPair

/** NovelAI 的加權括號組 `{}` */
const NOVEL_AI_WEIGHT_BRACKET = [
	EnumTagWeightSymbol.NovelAiWeightSymbolOpen,
	EnumTagWeightSymbol.NovelAiWeightSymbolClose,
] satisfies IBracketPair

/** 減權括號組 `[]` */
const DEC_WEIGHT_BRACKET = [
	EnumTagWeightSymbol.DecWeightSymbolOpen,
	EnumTagWeightSymbol.DecWeightSymbolClose,
] satisfies IBracketPair

/** 權重數字：`本體:1.2`。未錨定字串尾端——會命中中段冒號，此為既有行為，改寫時不得自行錨定 */
export const weightNumRegex = /(.*):(\-?[0-9\.]+)/
/** 權重數字（半形冒號，允許冒號後空白）：輸出前由 normalizeWeightNum 收斂成 `:` */
export const weightNumRegexEN = /(.*):\s*(\-?[0-9\.]+)/
/** 權重數字（全形冒號）：中文輸入法產出，收斂方式同 weightNumRegexEN */
export const weightNumRegexCN = /(.*)：\s*(\-?[0-9\.]+)/

/** 半形括號——權重符號的標準寫法 */
export const bracketsEN: IBracketPairMap[] = [
	{'(': EnumTagWeightSymbol.IncWeightSymbolOpen, ')': EnumTagWeightSymbol.IncWeightSymbolClose},
	{'[': EnumTagWeightSymbol.DecWeightSymbolOpen, ']': EnumTagWeightSymbol.DecWeightSymbolClose},
	{'{': EnumTagWeightSymbol.NovelAiWeightSymbolOpen, '}': EnumTagWeightSymbol.NovelAiWeightSymbolClose},
	{'<': EnumTagWeightSymbol.AngleOpen, '>': EnumTagWeightSymbol.AngleClose},
]
/** 全形括號——同義的輸入變體，比對（hasBrackets）時視為等價，輸出（replaceBrackets）時正規化為半形 */
export const bracketsCN: IBracketPairMap[] = [
	{'（': EnumTagWeightSymbol.IncWeightSymbolOpen, '）': EnumTagWeightSymbol.IncWeightSymbolClose},
	{'【': EnumTagWeightSymbol.DecWeightSymbolOpen, '】': EnumTagWeightSymbol.DecWeightSymbolClose},
	{'《': EnumTagWeightSymbol.AngleOpen, '》': EnumTagWeightSymbol.AngleClose},
	{'「': EnumTagWeightSymbol.NovelAiWeightSymbolOpen, '」': EnumTagWeightSymbol.NovelAiWeightSymbolClose},
	{'『': EnumTagWeightSymbol.NovelAiWeightSymbolOpen, '』': EnumTagWeightSymbol.NovelAiWeightSymbolClose},
	{'〈': EnumTagWeightSymbol.AngleOpen, '〉': EnumTagWeightSymbol.AngleClose},
	{'﹝': EnumTagWeightSymbol.IncWeightSymbolOpen, '﹞': EnumTagWeightSymbol.IncWeightSymbolClose},
	{'﹛': EnumTagWeightSymbol.NovelAiWeightSymbolOpen, '﹜': EnumTagWeightSymbol.NovelAiWeightSymbolClose},
	{'﹙': EnumTagWeightSymbol.IncWeightSymbolOpen, '﹚': EnumTagWeightSymbol.IncWeightSymbolClose},
]

/**
 * 結尾的權重數字分段：`本體` + `:權重`。
 *
 * 只認字串尾端，故不會像 weightNumRegex（未錨定）那樣把 tag 中間的冒號也當成權重；
 * 分組 1 是本體（可能為空），分組 2 是含冒號的權重數字。
 */
export const WEIGHT_NUM_CHARACTERS_REGEX = /^([\s\S]*?)(:\s*-?\d+(?:\.\d+)?)$/
export const WEIGHT_NUM_CHARACTERS_REGEX2 = /^([\s\S]*?)(:\s*-?\d+(?:\.\d+)?)(?: )?$/

/** bracketsEN / bracketsCN 壓平後的括號配對表（hasBrackets 比對用） */
function collectBracketPairs(): IBracketPair<EnumTagWeightSymbol>[]
{
	return [...bracketsEN, ...bracketsCN].map(item =>
	{
		const keys = Object.keys(item)
		return [keys[0], keys[1]] as IBracketPair<EnumTagWeightSymbol>
	})
}

/** bracketsCN 壓平後的全形→半形替換表（replaceBrackets 用） */
function collectCnBracketReplaces(): IBracketPairMap
{
	const replaces: IBracketPairMap = {}
	bracketsCN.forEach(item =>
	{
		for (const key in item)
		{
			replaces[key] = item[key]
		}
	})
	return replaces
}

/**
 * 將字串首尾若是全形括號則替換為對應的半形括號（僅首尾，中段不動）。
 *
 * @param text - 要正規化的文字
 * @returns 正規化後的文字
 */
export function replaceBrackets(text: string): string
{
	const length = text.length
	if (length === 0) return text
	const replaces = collectCnBracketReplaces()

	const start = text[0]
	const end = text[length - 1]
	if (typeof replaces[start] !== "undefined")
	{
		text = replaces[start] + text.substring(1)
	}
	if (typeof replaces[end] !== "undefined")
	{
		text = text.substring(0, length - 1) + replaces[end]
	}
	return text
}

/**
 * 是否有括號——比對字串首尾是否為同一組（含全形）括號。
 *
 * 括號是權重語法的外層（`(x:1.2)` / `[]` / `{}`），權重改寫據此決定要拆哪一組。
 *
 * @param text - 要判定的文字
 * @returns `[開括號, 閉括號]`；無配對時為 false
 */
export function hasBrackets(text: string): IBracketPair<EnumTagWeightSymbol>
{
	const length = text.length
	if (length === 0) return
	const start = text[0]
	const end = text[length - 1]
	return collectBracketPairs().find(pair => pair[0] === start && pair[1] === end)
}

/**
 * 判斷 str 是否被同一組括號由外向內完整包裹。
 *
 * @param str   - 要判定的文字
 * @param start - 開括號字元
 * @param end   - 閉括號字元
 * @returns 首尾成對包裹時為 true
 */
function isWrappedIn(str: string, start: IBracketPairInput, end: IBracketPairInput): boolean
{
	return str.length >= 2 && str[0] === start && str[str.length - 1] === end
}

/**
 * 計算字串被同組括號包裹的層數（僅由外向內連續同組者計數）。
 *
 * @param str   - 要計算的文字
 * @param start - 開括號字元
 * @param end   - 閉括號字元
 * @returns 層數
 */
export function countLayers(
	str: string,
	start: IBracketPairInput = EnumTagWeightSymbol.IncWeightSymbolOpen,
	end: IBracketPairInput = EnumTagWeightSymbol.IncWeightSymbolClose,
): number
{
	let count = 0
	while (isWrappedIn(str, start, end))
	{
		count++
		str = str.slice(1, str.length - 1)
	}
	return count
}

/**
 * 重設字串的括號包裹：先剝除最外層的同組括號，再包上 num 層。
 *
 * @param str     - 要處理的文字
 * @param num     - 目標層數；0 表示只剝除
 * @param start   - 開括號字元
 * @param end     - 閉括號字元
 * @param joinStr - 括號與本體之間插入的文字（如 `:1.2` 的權重數字）
 * @returns 處理後的文字
 */
export function setLayers(
	str: string,
	num = 0,
	start: IBracketPairInput = EnumTagWeightSymbol.IncWeightSymbolOpen,
	end: IBracketPairInput = EnumTagWeightSymbol.IncWeightSymbolClose,
	joinStr = '',
): string
{
	while (isWrappedIn(str, start, end))
	{
		str = str.slice(1, str.length - 1)
	}
	if (num === 0) return str
	return start.repeat(num) + str + joinStr + end.repeat(num)
}

/**
 * 剝除 str 外層的指定括號組（連續同組包裹會全部剝除）。
 */
export function stripLayers(text: string, start: IBracketPairInput, end: IBracketPairInput): string
{
	return setLayers(text, 0, start, end)
}

/**
 * 取得加權括號組：NovelAI 模式為 `{}`，一般模型為 `()`。
 *
 * @param useNovelAiWeightSymbol - 宿主選項 useNovelAiWeightSymbol
 * @returns 對應的 BracketPair
 */
function getIncWeightBracket(useNovelAiWeightSymbol?: boolean)
{
	return useNovelAiWeightSymbol ? NOVEL_AI_WEIGHT_BRACKET : INC_WEIGHT_BRACKET
}

/**
 * 判斷括號組是否為權重語法的外層：一般模型為 `()` / `[]`，NovelAI 模式另含 `{}`。
 *
 * @param bracket - hasBrackets 的結果
 * @param options - 宿主選項（useNovelAiWeightSymbol 決定 `{}` 是否算權重括號）
 * @returns 屬權重括號時收窄為 BracketPair
 */
function isWeightBracket(bracket: IBracketPair, options?: IHostPromptOptions): bracket is IBracketPair<EnumTagWeightSymbol>
{
	if (!bracket) return false
	const weightBrackets: IBracketPair<EnumTagWeightSymbol>[] = [INC_WEIGHT_BRACKET, DEC_WEIGHT_BRACKET]
	if (options?.useNovelAiWeightSymbol) weightBrackets.push(NOVEL_AI_WEIGHT_BRACKET)
	return weightBrackets.some(pair => pair[0] === bracket[0] && pair[1] === bracket[1])
}

/**
 * 疊加括號層數增量並以 0 為下限。
 *
 * @param current - 現有層數
 * @param delta   - 本次增量
 * @returns 疊加後的層數
 */
function accumulateLayers(current: number | undefined, delta: number): number
{
	const next = current! + delta
	return next < 0 ? 0 : next
}

/**
 * 產生 tag.value / tag.localValue 的成對改寫器。
 *
 * map() 與 setLayers() 對兩者套用同一改寫，localValue 為空字串時跳過（沿用原守門條件）；
 * 寫回分兩種語意：commitIfChanged() 只在 value 有變動時寫回（applyTagWeightNum），
 * commit() 無條件寫回（applyTagIncWeight / applyTagDecWeight）。
 *
 * @param tag - 要改寫的 tag
 * @returns 成對改寫器
 */
function createValueRewriter(tag: IPromptTag)
{
	const originalValue = tag.value
	let value = tag.value
	let localValue = tag.localValue!

	const map = (fn: (text: string) => string): void =>
	{
		value = fn(value)
		if (localValue !== '') localValue = fn(localValue)
	}

	return {
		/** 目前的 value（已套用歷次改寫，尚未寫回 tag） */
		get value(): string
		{
			return value
		},

		/** 對 value 與 localValue（非空時）套用同一改寫 */
		map,

		/**
		 * 重設 value / localValue 外層的 bracket 括號組為 num 層（0 即剝除）。
		 *
		 * joinStr 為括號與本體之間插入的文字（如 `:1.2` 的權重數字）。
		 */
		setLayers(num: number, bracket: IBracketPair<EnumTagWeightSymbol>, joinStr = ''): void
		{
			map(text => setLayers(text, num, bracket[0], bracket[1], joinStr))
		},

		/** 僅在 value 有變動時寫回 tag；回傳是否有變動 */
		commitIfChanged(): boolean
		{
			if (value === originalValue) return false
			tag.value = value
			if (localValue !== '') tag.localValue = localValue
			return true
		},

		/** 無條件寫回 tag */
		commit(): void
		{
			tag.value = value
			if (localValue !== '') tag.localValue = localValue
		},
	}
}

/**
 * 將冒號權重寫法正規化為 `本體:數字`（收斂半形冒號後的空白與全形冒號）。
 *
 * 由 common.replaceTag() 於輸出前呼叫，括號正規化不在此處理。
 *
 * @param text - 要正規化的文字
 * @returns 正規化後的文字
 */
export function normalizeWeightNum(text: string): string
{
	if (weightNumRegexEN.test(text)) text = text.replace(weightNumRegexEN, '$1:$2')
	if (weightNumRegexCN.test(text)) text = text.replace(weightNumRegexCN, '$1:$2')
	return text
}

/**
 * 取得 value 的權重數字（`:1.2` 的數值）。
 *
 * @param value - tag.value
 * @returns 權重數字；未帶權重時為 1
 */
export function getTagWeightNum(value: IPromptTagValue): number
{
	const match = value.match(weightNumRegex)
	return match ? Number.parseFloat(match[2]) : 1
}

/**
 * 取得 value 的加權層數（外層 `()` 的層數）。
 *
 * NovelAI 模式改以 `{}` 計數，由 options.useNovelAiWeightSymbol 決定。
 *
 * @param value   - tag.value
 * @param options - 宿主選項（原 this.useNovelAiWeightSymbol）
 * @returns 加權層數
 */
export function getTagIncWeight(value: IPromptTagValue, options: IHostPromptOptions): number
{
	const [open, close] = getIncWeightBracket(options?.useNovelAiWeightSymbol)
	return countLayers(value, open, close)
}

/**
 * 取得 value 的減權層數（外層 `[]` 的層數）。
 *
 * @param value - tag.value
 * @returns 減權層數
 */
export function getTagDecWeight(value: IPromptTagValue): number
{
	return countLayers(value, ...DEC_WEIGHT_BRACKET)
}

/**
 * 取得剝除權重語法後的原文（tag.originalValue 的來源）。
 *
 * 僅剝除配對的 `()` / `[]`（NovelAI 模式另含 `{}`）外層與其權重數字；
 * 首尾不配對時原樣回傳。
 *
 * 注意：Lora / Lyco 語法不含此剝除，呼叫端須先以 parseLoraLikeValue() 排除。
 *
 * @param value   - tag.value
 * @param options - 宿主選項（決定 `{}` 是否視為權重括號）
 * @returns 剝除後的文字
 */
export function extractTagValueFromBrackets(value: IPromptTagValue, options?: IHostPromptOptions): IPromptTagValue
{
	const bracket = hasBrackets(value)
	if (isWeightBracket(bracket, options))
	{
		return stripLayers(value, bracket[0], bracket[1]).replace(weightNumRegex, '$1')
	}
	return value
}

/**
 * 輸出層的權重數值改寫：將 tag.weightNum 回寫到 tag.value / tag.localValue。
 *
 * 與編輯層的 applyTagWeightNum() 不同：此處不增減括號、不看選項，
 * 只把既有的權重數字以 `本體:數字` 蓋上去（無權重數字的 value 維持原樣，
 * 由 weightNumRegex 未命中決定），並把權重正規化到小數 6 位。
 * 權重為 0（或無法解析為數字）時不動任何欄位。
 *
 * @param tag - 要改寫的 tag（直接寫入 weightNum / value / localValue）
 */
export function applyTagWeightNumToValue(tag: IPromptTag): void
{
	/**
	 * 權重數值改寫：原式為 `tag.weightNum > 0 || tag.weightNum < 0`，
	 * 因 tag.weightNum 型別為 number|string，先以 Number() 統一再比較，
	 * 與 JS 關係運算子的隱含轉換結果完全一致。
	 */
	const weightNum = Number(tag.weightNum)
	if (weightNum > 0 || weightNum < 0)
	{
		tag.weightNum = Number(parseFloat(String(weightNum)).toFixed(6))
		tag.value = tag.value.replace(weightNumRegex, '$1:' + tag.weightNum)
		if (tag.localValue !== '')
		{
			tag.localValue = tag.localValue.replace(weightNumRegex, '$1:' + tag.weightNum)
		}
	}
}

/**
 * 依新的權重數字改寫 tag.value / tag.localValue（套用或移除 `:數字` 與括號）。
 *
 * 規則與選項：
 *   - 權重 1 且未開啟 autoKeepWeightOne → 移除權重數字（連同配對的外層括號）
 *   - 其餘非 0 → 補上 `:權重`；無括號的一般 tag 再補 `()`（NovelAI 為 `{}`），
 *     Lora / Lyco / Embedding 不補括號
 *   - 權重 0 → autoKeepWeightZero 開啟時改寫為 `:0`，否則移除權重數字
 *
 * 不變更 tag.weightNum：呼叫端須在重算權重欄位（_setTag）之後再行寫入，
 * 與原實作的寫入順序一致。
 *
 * @param tag       - 要改寫的 tag
 * @param weightNum - 新權重數字（維持 number|string，鬆散比較行為不變）
 * @param options   - 宿主選項（autoKeepWeightOne / autoKeepWeightZero / useNovelAiWeightSymbol）
 * @returns 是否已改寫 value且需重算權重欄位；權重 0 分支恒為 false
 */
export function applyTagWeightNum(tag: IPromptTag, weightNum: number | string, options?: IHostPromptOptions): boolean
{
	const rewriter = createValueRewriter(tag)

	const {
		useNovelAiWeightSymbol,
		autoKeepWeightOne,
		autoKeepWeightZero,
	} = options || {} as IHostPromptOptions

	if (weightNum !== 0)
	{
		if (weightNum === 1 && !autoKeepWeightOne)
		{
			/** 權重 1 → 移除權重：先剝配對括號，再移除權重數字 */
			const bracket = hasBrackets(rewriter.value)
			if (isWeightBracket(bracket, options))
			{
				rewriter.setLayers(0, bracket)
			}
			rewriter.map(text => text.replace(weightNumRegex, '$1'))
		}
		else
		{
			/** 原本沒有權重數字時，補到既有括號內（無括號則直接接在後方） */
			if (!weightNumRegex.test(rewriter.value))
			{
				const suffix = ':' + weightNum
				const bracket = hasBrackets(rewriter.value)
				if (bracket)
				{
					rewriter.setLayers(1, bracket, suffix)
				}
				else
				{
					rewriter.map(text => text + suffix)
				}
			}
			/** Lora / Lyco / Embedding 以 `:weight` 表達權重，不再補外層括號 */
			if (!tagIsExtraNetworks(tag) && !hasBrackets(rewriter.value))
			{
				rewriter.setLayers(1, getIncWeightBracket(useNovelAiWeightSymbol))
			}
		}
		return rewriter.commitIfChanged()
	}

	/** 權重 0：autoKeepWeightZero 開啟時改寫為 `:0`，否則移除權重數字 */
	const replacement = autoKeepWeightZero ? '$1:0' : '$1'
	rewriter.map(text => text.replace(weightNumRegex, replacement))
	rewriter.commit()
	return false
}

/**
 * 套用加權層數：移除外層 `[]`（及 NovelAI 模式的 `()`）後，包上新的加權層。
 *
 * 同步重設 tag.incWeight / tag.decWeight（兩者互斥）。
 *
 * @param tag     - 要改寫的 tag
 * @param num     - 加權層數增量（負值不低於 0）
 * @param options - 宿主選項（useNovelAiWeightSymbol 決定以 `{}` 或 `()` 加權）
 */
export function applyTagIncWeight(tag: IPromptTag, num: number, options?: IHostPromptOptions): void
{
	const rewriter = createValueRewriter(tag)
	const useNovelAiWeightSymbol = options?.useNovelAiWeightSymbol

	/** 先剝除減權層；NovelAI 模式下 `()` 是加權符號，一併剝除 */
	rewriter.setLayers(0, DEC_WEIGHT_BRACKET)
	if (useNovelAiWeightSymbol)
	{
		rewriter.setLayers(0, INC_WEIGHT_BRACKET)
	}

	const incWeight = accumulateLayers(tag.incWeight, num)
	tag.incWeight = incWeight
	tag.decWeight = 0

	rewriter.setLayers(incWeight, getIncWeightBracket(useNovelAiWeightSymbol))
	rewriter.commit()
}

/**
 * 套用減權層數：移除外層 `()`（及 NovelAI 模式的 `{}`）後，包上新的減權層。
 *
 * 同步重設 tag.incWeight / tag.decWeight（兩者互斥）。
 *
 * @param tag     - 要改寫的 tag
 * @param num     - 減權層數增量（負值不低於 0）
 * @param options - 宿主選項（useNovelAiWeightSymbol 決定先剝哪一組加權括號）
 */
export function applyTagDecWeight(tag: IPromptTag, num: number, options?: IHostPromptOptions): void
{
	const rewriter = createValueRewriter(tag)

	/** 先剝除加權層；NovelAI 模式下 `{}` 一併剝除 */
	rewriter.setLayers(0, INC_WEIGHT_BRACKET)
	if (options?.useNovelAiWeightSymbol)
	{
		rewriter.setLayers(0, NOVEL_AI_WEIGHT_BRACKET)
	}

	const decWeight = accumulateLayers(tag.decWeight, num)
	tag.incWeight = 0
	tag.decWeight = decWeight

	rewriter.setLayers(decWeight, DEC_WEIGHT_BRACKET)
	rewriter.commit()
}

/**
 * 權重數字是否是遞減（負值）。
 *
 * 只在確實帶有數值時給出結果：
 * 權重 0 不套用權重樣式，避免使用者把 0 誤讀成加重或減輕。
 *
 * @param weightText - 權重數字字串（可含前導 `:`、空白與附加描述）
 * @returns 負值為 true、正值為 false；0 / 無值 / 無法解析時為 undefined
 */
export function parseWeightNumIsDec(weightText?: string): boolean | undefined
{
	const matched = weightText?.match(/-?\d+(?:\.\d+)?/)
	if (!matched) return undefined
	const value = Number.parseFloat(matched[0])
	if (!Number.isFinite(value) || value === 0) return undefined
	return value < 0
}
