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
}

/** 權重數字：`本體:1.2`。未錨定字串尾端——會命中中段冒號，此為既有行為，改寫時不得自行錨定 */
export const weightNumRegex = /(.*):(\-?[0-9\.]+)/
/** 權重數字（半形冒號，允許冒號後空白）：輸出前由 normalizeWeightNum 收斂成 `:` */
export const weightNumRegexEN = /(.*):\s*(\-?[0-9\.]+)/
/** 權重數字（全形冒號）：中文輸入法產出，收斂方式同 weightNumRegexEN */
export const weightNumRegexCN = /(.*)：\s*(\-?[0-9\.]+)/

/** 半形括號——權重符號的標準寫法 */
export const bracketsEN: Record<string, string>[] = [
	{'(': '(', ')': ')'},
	{'[': '[', ']': ']'},
	{'{': '{', '}': '}'},
	{'<': '<', '>': '>'},
]
/** 全形括號——同義的輸入變體，比對（hasBrackets）時視為等價，輸出（replaceBrackets）時正規化為半形 */
export const bracketsCN: Record<string, string>[] = [
	{'（': '(', '）': ')'},
	{'【': '[', '】': ']'},
	{'《': '<', '》': '>'},
	{'「': '{', '」': '}'},
	{'『': '{', '』': '}'},
	{'〈': '<', '〉': '>'},
	{'﹝': '(', '﹞': ')'},
	{'﹛': '{', '﹜': '}'},
	{'﹙': '(', '﹚': ')'},
]

/**
 * 結尾的權重數字分段：`本體` + `:權重`。
 *
 * 只認字串尾端，故不會像 weightNumRegex（未錨定）那樣把 tag 中間的冒號也當成權重；
 * 分組 1 是本體（可能為空），分組 2 是含冒號的權重數字。
 */
export const WEIGHT_NUM_CHARACTERS_REGEX = /^([\s\S]*?)(:\s*-?\d+(?:\.\d+)?)$/
export const WEIGHT_NUM_CHARACTERS_REGEX2 = /^([\s\S]*?)(:\s*-?\d+(?:\.\d+)?)(?: )?$/

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
	const replaces: Record<string, string> = {}
	bracketsCN.forEach(item =>
	{
		for (const key in item)
		{
			replaces[key] = item[key]
		}
	})

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
export function hasBrackets(text: string): [string, string] | false
{
	const length = text.length
	if (length === 0) return false
	const brackets: [string, string][] = []
	const collect = (item: Record<string, string>) =>
	{
		const keys = Object.keys(item)
		brackets.push([keys[0], keys[1]])
	}
	bracketsEN.forEach(collect)
	bracketsCN.forEach(collect)

	const start = text[0]
	const end = text[length - 1]
	for (const bracket of brackets)
	{
		if (bracket[0] === start && bracket[1] === end)
		{
			return bracket
		}
	}
	return false
}

/**
 * 計算字串被同組括號包裹的層數（僅由外向內連續同組者計數）。
 *
 * @param str   - 要計算的文字
 * @param start - 開括號字元
 * @param end   - 閉括號字元
 * @returns 層數
 */
export function countLayers(str: string, start = '(', end = ')'): number
{
	let count = 0
	if (str.length < 2) return count // 長度小於 2，不可能有包裹
	while (true)
	{
		const first = str[0]
		const last = str[str.length - 1]
		if (first === start && last === end)
		{
			count++
			str = str.slice(1, str.length - 1)
		}
		else
		{
			break
		}
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
export function setLayers(str: string, num = 0, start = '(', end = ')', joinStr = ''): string
{
	while (true)
	{
		const first = str[0]
		const last = str[str.length - 1]
		if (first === start && last === end)
		{
			str = str.slice(1, str.length - 1)
		}
		else
		{
			break
		}
	}
	if (num === 0) return str
	return start.repeat(num) + str + joinStr + end.repeat(num)
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
	return options?.useNovelAiWeightSymbol
		? countLayers(value, '{', '}')
		: countLayers(value, '(', ')')
}

/**
 * 取得 value 的減權層數（外層 `[]` 的層數）。
 *
 * @param value - tag.value
 * @returns 減權層數
 */
export function getTagDecWeight(value: IPromptTagValue): number
{
	return countLayers(value, '[', ']')
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
	if (bracket
		&& ((bracket[0] === '(' && bracket[1] === ')')
			|| (bracket[0] === '[' && bracket[1] === ']')
			|| (options?.useNovelAiWeightSymbol && bracket[0] === '{' && bracket[1] === '}')))
	{
		return setLayers(value, 0, bracket[0], bracket[1]).replace(weightNumRegex, '$1')
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
	let value = tag.value
	let localValue = tag.localValue!
	let changed = false

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
			const bracket = hasBrackets(value)
			if (bracket
				&& ((bracket[0] === '(' && bracket[1] === ')')
					|| (bracket[0] === '[' && bracket[1] === ']')
					|| (useNovelAiWeightSymbol && bracket[0] === '{' && bracket[1] === '}')))
			{
				value = setLayers(value, 0, bracket[0], bracket[1])
				if (localValue !== '') localValue = setLayers(localValue, 0, bracket[0], bracket[1])
			}
			value = value.replace(weightNumRegex, '$1')
			if (localValue !== '') localValue = localValue.replace(weightNumRegex, '$1')
		}
		else
		{
			/** 原本沒有權重數字時，補到既有括號內（無括號則直接接在後方） */
			if (!weightNumRegex.test(value))
			{
				const bracket = hasBrackets(value)
				if (bracket)
				{
					value = setLayers(value, 1, bracket[0], bracket[1], ':' + weightNum)
					if (localValue !== '') localValue = setLayers(localValue, 1, bracket[0], bracket[1], ':' + weightNum)
				}
				else
				{
					value = value + ':' + weightNum
					if (localValue !== '') localValue = localValue + ':' + weightNum
				}
			}
			/** Lora / Lyco / Embedding 以 `:weight` 表達權重，不再補外層括號 */
			if (tagIsExtraNetworks(tag))
			{
			}
			else if (!hasBrackets(value))
			{
				if (useNovelAiWeightSymbol)
				{
					value = setLayers(value, 1, '{', '}')
					if (localValue !== '') localValue = setLayers(localValue, 1, '{', '}')
				}
				else
				{
					value = setLayers(value, 1, '(', ')')
					if (localValue !== '') localValue = setLayers(localValue, 1, '(', ')')
				}
			}
		}
		if (value !== tag.value)
		{
			tag.value = value
			if (localValue !== '') tag.localValue = localValue
			changed = true
		}
	}
	else
	{
		if (autoKeepWeightZero)
		{
			/** 保留權重數字 */
			tag.value = value.replace(weightNumRegex, '$1:0')
			if (localValue !== '') tag.localValue = tag.localValue!.replace(weightNumRegex, '$1:0')
		}
		else
		{
			/** 移除權重數字 */
			tag.value = value.replace(weightNumRegex, '$1')
			if (localValue !== '') tag.localValue = tag.localValue!.replace(weightNumRegex, '$1')
		}
	}
	return changed
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
	const useNovelAiWeightSymbol = options?.useNovelAiWeightSymbol

	let value = tag.value
	let localValue = tag.localValue!
	value = setLayers(value, 0, '[', ']')
	if (localValue !== '') localValue = setLayers(localValue, 0, '[', ']')
	if (useNovelAiWeightSymbol)
	{
		value = setLayers(value, 0, '(', ')')
		if (localValue !== '') localValue = setLayers(localValue, 0, '(', ')')
	}
	let incWeight = tag.incWeight!
	incWeight += num
	if (incWeight < 0) incWeight = 0
	tag.incWeight = incWeight
	tag.decWeight = 0
	if (useNovelAiWeightSymbol)
	{
		value = setLayers(value, incWeight, '{', '}')
		if (localValue !== '') localValue = setLayers(localValue, incWeight, '{', '}')
	}
	else
	{
		value = setLayers(value, incWeight, '(', ')')
		if (localValue !== '') localValue = setLayers(localValue, incWeight, '(', ')')
	}
	tag.value = value
	if (localValue !== '') tag.localValue = localValue
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
	let value = tag.value
	let localValue = tag.localValue!
	value = setLayers(value, 0, '(', ')')
	if (localValue !== '') localValue = setLayers(localValue, 0, '(', ')')
	if (options?.useNovelAiWeightSymbol)
	{
		value = setLayers(value, 0, '{', '}')
		if (localValue !== '') localValue = setLayers(localValue, 0, '{', '}')
	}
	let decWeight = tag.decWeight!
	decWeight += num
	if (decWeight < 0) decWeight = 0
	tag.incWeight = 0
	tag.decWeight = decWeight
	value = setLayers(value, decWeight, '[', ']')
	if (localValue !== '') localValue = setLayers(localValue, decWeight, '[', ']')
	tag.value = value
	if (localValue !== '') tag.localValue = localValue
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

