import { EnumPromptTagType, IPromptTag, IPromptTagValue } from '../tag-types';
import { IHostPromptOptions } from '../types';
import { tagIsKeyword, tagIsNormalText } from '../util';

/** AND 邊界字元：前後不得為詞字元（[A-Za-z0-9_]），避免內嵌詞誤切割。 */
export const reKeywordBoundary = /[A-Za-z0-9_]/

/** AND 相鄰可吃掉的分隔字元：空白與逗號（逗號有無決定 noComma* 標記）。 */
export const reKeywordDelimiter = /[ \t,]/

/**
 * 特定關鍵字 → 普通提示詞的值對應表（選項 autoKeywordToPlain 啟用時套用）。
 * 目前僅 AND：改寫為 "And" 後失去全大寫形式，下游即不再以關鍵字語意處理。
 */
const keywordPlainValues: Readonly<Partial<Record<string, string>>> = {
    [EnumPromptTagType.VALUE_KEYWORD_AND]: 'And',
}

/**
 * 關鍵字 → 普通提示詞的核心轉換（不判定選項）。
 *
 * 整筆值先查對應表：關鍵字 tag 的 value（如 "AND"）直接映射為普通形式；
 * 查不到才以 \b 文字取代處理一般文字內嵌的 AND——
 * \b 邊界保護 ANDROID、BRAND 等內嵌詞不被誤換。
 *
 * @param text - 待轉換的文字（tag value 或段落）
 * @returns 轉換後的文字；無關鍵字可轉時原樣回傳
 */
export function _replaceKeywordToPlainCore(text: IPromptTagValue): IPromptTagValue
{
	return keywordPlainValues[text] ?? text.replace(/\bAND\b/g, 'And')
}

/**
 * autoKeywordToPlain 的轉換入口（選項判定集中於此）。
 *
 * 未啟用選項原樣回傳；啟用時交給 {@link _replaceKeywordToPlainCore}：
 * 關鍵字 tag 走整筆值對應表、一般文字走 \b 文字取代，
 * 兩者都只改變值——判定邏輯與 noComma* 等機制不受影響。
 *
 * @param text - 待轉換的文字
 * @param options - 選項（讀取 autoKeywordToPlain）
 * @returns 轉換後或原樣的文字
 */
export function replaceKeywordToPlain(text: IPromptTagValue, options?: IHostPromptOptions): IPromptTagValue
{
	if (options?.autoKeywordToPlain)
	{
		return _replaceKeywordToPlainCore(text)
	}
	return text
}

/**
 * 對單一 tag 套用 autoKeywordToPlain 轉換（就地改寫 value）。
 *
 * 參與判定者：type === 'text' 的一般文字 tag 與關鍵字 tag
 *（tagIsNormalText || tagIsKeyword）；wrap / lora / lyco 等語法 tag
 * 不參與，避免改動 Lora 名稱等語法內容。只改 value，
 * 不動 noComma* 與其他欄位；供 tags 陣列層（applySplitByPeriod）
 * 與 genPrompt 輸出層共用同一份轉換。
 *
 * @param tag - 待轉換的 tag
 * @param options - 選項（讀取 autoKeywordToPlain）
 * @returns tag 本身、是否變更（changed）與轉換前原值（originalValue）
 */
export function applyTagReplaceKeywordToPlain(tag: IPromptTag, options?: IHostPromptOptions)
{
	let changed = false
	let originalValue = tag.value
	if (options?.autoKeywordToPlain && (tagIsNormalText(tag) || tagIsKeyword(tag)))
	{
		const value = replaceKeywordToPlain(tag.value, options)
		if (value !== tag.value)
		{
			tag.value = value
			changed = true
		}
	}
	return {
		tag,
		changed,
		originalValue,
	}
}
