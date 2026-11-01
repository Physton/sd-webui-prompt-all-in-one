/**
 * Lora / Lyco 語法的純邏輯：語法正則、顯示分段與片段拆分。
 */

import { EnumPromptTagType, IPromptTag, IPromptTagValue } from '../tag-types'

/**
 * parseLoraLikeValue() 的解析結果：命中哪種語法及其捕捉的名稱。
 */
export interface IParsedLoraLikeValue
{
	/** 命中的語法種類；對應 tag.isLora / tag.isLyco 的布林欄位 */
	kind: EnumPromptTagType.lora | EnumPromptTagType.lyco
	/**
	 * regex 捕捉的模型名稱（未 trim）——
	 * 與 _setTagClass() 存入 loraName / lycoName 的值完全一致。
	 */
	name: string
}

/**
 * lora 語法：`<lora:name:weight>`，weight 之後允許附加描述（非錨定結尾）。
 */
export const loraRegex = /^\<lora:\s*([^\:]+)\s*(:)?\s*(\-?[0-9\.]+)?([^\>]+)?\>/

/**
 * lyco 語法：`<lyco:name:weight>`，weight 之後允許附加描述（非錨定結尾）。
 */
export const lycoRegex = /^\<lyco:\s*([^\:]+)\s*(:)?\s*(\-?[0-9\.]+)?([^\>]+)?\>$/

/**
 * lora-like 語法的顯示分段：`<lora:` / name / `:weight` / `>`。
 *
 * 名稱以 `[^:>]` 界定，故未帶權重時名稱仍完整落在第 2 段；
 * 權重之後允許附加描述（loraRegex 允許），一併歸入第 3 段，
 * 確保拆段只改變結構、不改變顯示內容。
 */
export const LORA_LIKE_CHARACTERS_REGEX = /^(<(?:lora|lyco):)([^:>]*)([^>]*)(>)$/

/**
 * 從單一字串拆出 `<lora:...>` 片段：回傳 [前綴, lora, 前綴, lora, ..., 餘尾]。
 *
 * 只拆 lora（不拆 lyco）——與原切割行為一致，其餘片段靠呼叫端的括號防護保留；
 * 各段（含首尾）皆 trim，空段由呼叫端過濾。
 *
 * lora 標籤與權重括號格式範例（本函式只會拆出 <lora:...>，其餘靠括號防護保留）：
 * aaa <lora:KuutanKoihime:0.7>  <lora:add_detail:0.6><lora:clothesTransparent_v20:1:1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0>, [<lora:A:1>:<lora:B:1>:10], [lora:A:1::10], [<lora:A:1>:10], [<lora:A:1>:0.5], [[<lora:A:1>::25]:10], [<lora:A:1> #increment:10], [<lora:A:1> #decrease:10], [<lora:A:1> #cmd\(warmup\(0.5\)\):10]
 *
 * @param value - 要拆分的字串
 * @returns 拆分後的片段陣列（至少含原始字串一項）
 */
export function splitLoraTagSegments(value: string): string[]
{
	const values: string[] = []
	const regex = /\<lora:[^\>]+\>/
	let match: RegExpExecArray | null = null
	let rest = value
	while (match = regex.exec(rest))
	{
		const startIndex = match.index
		const endIndex = startIndex + match[0].length
		values.push(rest.substring(0, startIndex).trim())
		values.push(match[0])
		rest = rest.substring(endIndex).trim()
	}
	values.push(rest)
	return values
}

/**
 * 依 value 解析 Lora / Lyco 語法（「value → 種類 / 名稱」的單一事實）。
 *
 * 使用者（皆不得自行比對 loraRegex / lycoRegex）：
 *   1. 分類  —— tagMixin._setTagClass() 設定 isLora / loraName / isLyco / lycoName
 *   2. 偵測  —— tagMixin._set() 判斷 value 是否為 Lora / Lyco 語法
 *               （是則跳過括號與權重清理）
 *   3. 提取  —— getLoraLikeName() 對「未經分類的 tag」的手動回退
 *
 * @param value - tag.value（null / undefined 視為 ''）
 * @returns 命中時回傳種類與名稱（名稱未 trim）；皆未命中回傳 null
 */
export function parseLoraLikeValue(value?: IPromptTagValue): IParsedLoraLikeValue
{
	const text = String(value ?? '');
	const lora = text.match(loraRegex);
	if (lora) return {kind: EnumPromptTagType.lora, name: lora[1]};
	const lyco = text.match(lycoRegex);
	if (lyco) return {kind: EnumPromptTagType.lyco, name: lyco[1]};
	return null;
}

/**
 * 取得 Lora / Lyco 的模型名稱。
 *
 * 兩段式提取：
 *   1. `loraName` / `lycoName` 存在時直接採用——`_setTagClass()` 已分類完成，
 *      無需再手動偵測名稱。
 *   2. 不存在時（tag 尚未經 `_setTagClass` 分類，如純測試輸入）交由
 *      parseLoraLikeValue() 解析 value——與分類共用同一份解析事實。
 *
 * @param tag - 要提取名稱的 tag（不含 Lora / Lyco 時仍會嘗試第 2 段）
 * @returns 名稱（trim 後）
 */
export function getLoraLikeName(tag?: IPromptTag): string
{
	let name: string;
	if (tag)
	{
		const storedName = tag.isLora ? tag.loraName : (tag.isLyco ? tag.lycoName : undefined)
		if (storedName?.length)
		{
			name = storedName
		}
		else
		{
			const parsed = parseLoraLikeValue(tag?.value);
			name = parsed?.name
		}
	}
	return name?.trim();
}
