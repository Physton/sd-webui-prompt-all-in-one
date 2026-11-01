/**
 * prompt tag 的顯示 HTML 渲染工具。
 *
 * 欄位 incWeight / decWeight / value 由 tagMixin._setTag() 維護，
 * 本檔只讀取這些欄位組出顯示用 HTML，不修改 tag 本身。
 *
 * @module utils/promptTagRender/renderTag
 */

import common from "@/utils/common";
import { IPromptTag } from "../promptTags/tag-types";
import { IPromptOptionValueRecordWithLegacyRuntime } from '../promptOptions/definitions';
import { tagIsBreak, tagIsLoraLike, tagIsSharp } from '../promptTags/util';

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

/**
 * lora-like 語法分段後可分別套用樣式的 class。
 *
 * 拆段的目的：讓樣式能單獨強調 `<lora:` / `>` 這類語法符號，
 * 而不必連模型名稱一起改（名稱是使用者真正在讀的部分）。
 */
export const enum EnumTagLoraLikeCharacterClass
{
	/** `<lora:` / `<lyco:` 前綴 */
	Open = 'lora-like-open-character',
	/** 模型名稱 */
	Name = 'lora-like-name-character',
	/** `:權重`；value 未帶權重時不產生此段 */
	Weight = 'lora-like-weight-character',
	/** 結尾的 `>` */
	Close = 'lora-like-close-character',
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
function parseWeightNumIsDec(weightText?: string): boolean | undefined
{
	const matched = weightText?.match(/-?\d+(?:\.\d+)?/)
	if (!matched) return undefined
	const value = Number.parseFloat(matched[0])
	if (!Number.isFinite(value) || value === 0) return undefined
	return value < 0
}

/**
 * 結尾的權重數字分段：`本體` + `:權重`。
 *
 * 只認字串尾端，故不會像 common.weightNumRegex（未錨定）那樣把 tag 中間的冒號也當成權重；
 * 分組 1 是本體（可能為空），分組 2 是含冒號的權重數字。
 */
const WEIGHT_NUM_CHARACTERS_REGEX = /^([\s\S]*?)(:\s*-?\d+(?:\.\d+)?)$/
const WEIGHT_NUM_CHARACTERS_REGEX2 = /^([\s\S]*?)(:\s*-?\d+(?:\.\d+)?)(?: )?$/

/**
 * lora-like 語法的顯示分段：`<lora:` / name / `:weight` / `>`。
 *
 * 名稱以 `[^:>]` 界定，故未帶權重時名稱仍完整落在第 2 段；
 * 權重之後允許附加描述（common.loraRegex 允許），一併歸入第 3 段，
 * 確保拆段只改變結構、不改變顯示內容。
 */
const LORA_LIKE_CHARACTERS_REGEX = /^(<(?:lora|lyco):)([^:>]*)([^>]*)(>)$/

/**
 * 權重醒目樣式的套用對象。
 *
 * 兩者的外觀處理相同（字重、描邊、正負分色），但 class 必須分開：
 * `weight-character` 在既有語意裡就是 `()` `[]` 這類符號，
 * 權重數值（lora 的 `:weight`）是「大小」，另用 `weight-number-character`。
 */
export const enum EnumTagWeightCharacterKind
{
	/** `()` `[]` 這類權重符號 */
	Bracket = 'bracket',
	/** lora 的 `:weight` 數值 */
	Number = 'number',
}

/**
 * kind → 遞增 / 遞減的 class 名稱。
 *
 * 括號與數值各自一組，樣式才能分開調整；
 * 遞減時同時帶上遞增的 class（與括號既有做法一致），讓 dec 只需覆蓋顏色。
 */
const WEIGHT_CHARACTER_CLASS: Record<EnumTagWeightCharacterKind, { inc: string; dec: string }> = {
	[EnumTagWeightCharacterKind.Bracket]: {inc: 'weight-character', dec: 'dec-weight-character'},
	[EnumTagWeightCharacterKind.Number]: {inc: 'weight-number-character', dec: 'dec-weight-number-character'},
}

export interface ICharactersOptions
{
	tag: IPromptTag;
	className?: string;
}

export interface IWeightCharacterOptions extends ICharactersOptions
{
	/** 醒目對象：省略時為權重符號 */
	kind?: EnumTagWeightCharacterKind;
	/** 遞減權重：換用 dec 的顏色，故疊上 dec 的 class */
	isDecWeight?: boolean;
}

export interface IWrapWeightCharactersOptions extends IWeightCharacterOptions
{
	count: number;
	open: string;
	close: string;
}

/** BREAK 的固定顯示內容：左右虛線夾住 BREAK 字樣；不含使用者輸入，無須 escape */
const BREAK_HTML = '<div class="break-character">---------------------</div> <div class="character">BREAK</div> <div class="break-character">---------------------</div>'

/**
 * 權重醒目樣式用的 class 字串。
 *
 * @param options - 醒目對象（括號 / 數值）、是否遞減，以及附加的角色 class
 * @returns 以空白分隔的 class 字串
 */
function getWeightCharacterClassName(options: IWeightCharacterOptions): string
{
	const classes = WEIGHT_CHARACTER_CLASS[options.kind ?? EnumTagWeightCharacterKind.Bracket]

	let names = [classes.inc]
	if (options.isDecWeight) names.push(classes.dec)
	if (options.className?.length) names.push(options.className)

	return names.join(' ')
}

/**
 * 以權重醒目樣式包住單一段內容。
 *
 * 權重符號（`()` `[]`）與權重數值（lora 的 `:weight`）都走這裡：
 * 「權重該怎麼被醒目化」只有一份實作，差別只在 kind 決定的 class。
 *
 * @param value   - 未 escape 的內容
 * @param options - 醒目對象、是否遞減，以及附加的角色 class
 * @returns 顯示用 HTML
 */
function wrapWeightCharacter(value: string, options: IWeightCharacterOptions): string
{
	return `<div class="${getWeightCharacterClassName(options)}">${common.escapeHtml(value)}</div>`
}

/**
 * 以權重符號包住 tag 內容，並把其中的權重數字標記出來。
 *
 * 權重數字（`(cat:1.2)` 的 `:1.2`）不是括號的一部分，故從本體拆出來單獨一段：
 * 樣式才能只作用在數字上，也才能依正負分色。本體仍交給 wrapTagCharacters()
 * 處理（lora-like 會再拆成多段符號）。
 *
 * 權重 0 / 沒有結尾權重數字時，數字留在本體裡，不套用任何權重樣式。
 *
 * @param value   - 已由 setLayers() 移除外層括號的 tag 內容
 * @param options - 權重符號的重複次數與字元
 * @returns 組合後的 HTML
 */
function wrapWeightCharacters(value: string, options: IWrapWeightCharactersOptions): string
{
	const isLoraLike = tagIsLoraLike(options.tag)
	const matched = value.match(isLoraLike ? WEIGHT_NUM_CHARACTERS_REGEX : WEIGHT_NUM_CHARACTERS_REGEX2)
	const weightText = matched?.[2]
	const isDecWeight = parseWeightNumIsDec(weightText)

	/** 本體：沒有可標記的權重數字時，數字留在本體一併顯示 */
	const body = isDecWeight === undefined ? value : matched[1]

	const className = getWeightCharacterClassName(options)
	const start = `<div class="${className}">${options.open.repeat(options.count)}</div>`
	const end = `<div class="${className}">${options.close.repeat(options.count)}</div>`

	let html = body.length ? wrapTagCharacters(body, options.tag) : ''
	if (isDecWeight !== undefined)
	{
		html += wrapWeightCharacter(weightText, {
			tag: options.tag,
			kind: EnumTagWeightCharacterKind.Number,
			isDecWeight,
		})
	}

	return start + html + end
}

function wrapCharacters(value: string, options?: ICharactersOptions): string
{
	let classes = ['character']
	if (options?.className?.length)
	{
		classes.push(options.className)
	}

	const className = classes.join(' ')
	return `<div class="${className}">${common.escapeHtml(value)}</div>`
}

/**
 * 把 lora-like 的 value 依 `<lora:` / name / `:weight` / `>` 拆成多段 character。
 *
 * 不符語法時退回單一 character，顯示結果與一般 tag 相同，
 * 避免未經分類或帶額外語法的 tag 少顯示或多顯示字元。
 *
 * 權重段交給 wrapWeightCharacter()（kind = Number）套用權重數值的醒目樣式；
 * 權重 0 / 無權重時只保留角色 class，不套用任何權重樣式。
 *
 * @param value   - 未 escape 的 tag 內容
 * @param options - 渲染旗標（className 由各段角色決定，故不沿用）
 * @returns 顯示用 HTML
 */
function wrapLoraLikeCharacters(value: string, options: ICharactersOptions): string
{
	const matched = value.match(LORA_LIKE_CHARACTERS_REGEX)
	if (!matched) return wrapCharacters(value, options)

	const [, open, name, weight, close] = matched
	const wrapSegment = (segment: string, className: string) => wrapCharacters(segment, {
		tag: options.tag,
		className,
	})

	let html = wrapSegment(open, EnumTagLoraLikeCharacterClass.Open)
	html += wrapSegment(name, EnumTagLoraLikeCharacterClass.Name)
	if (weight.length)
	{
		const isDecWeight = parseWeightNumIsDec(weight)
		html += isDecWeight === undefined
			/** 0 / 無權重：只是語法的一部分，不該看起來像被加重或減輕 */
			? wrapSegment(weight, EnumTagLoraLikeCharacterClass.Weight)
			: wrapWeightCharacter(weight, {
				tag: options.tag,
				className: EnumTagLoraLikeCharacterClass.Weight,
				kind: EnumTagWeightCharacterKind.Number,
				isDecWeight,
			})
	}
	html += wrapSegment(close, EnumTagLoraLikeCharacterClass.Close)
	return html
}

/**
 * 依 tag 種類包住單一 tag 的內容：
 * lora-like 拆成符號 / 名稱 / 權重 / 結尾，其餘維持單一 character。
 *
 * @param value     - 未 escape 的 tag 內容
 * @param tag       - 要渲染的 tag
 * @param className - 附加在主體上的 class（如 sharp-character）
 * @returns 顯示用 HTML
 */
function wrapTagCharacters(value: string, tag: IPromptTag, className?: string): string
{
	const options: ICharactersOptions = { tag, className }
	if (tagIsLoraLike(tag)) return wrapLoraLikeCharacters(value, options)
	return wrapCharacters(value, options)
}

/**
 * 將單一 tag 渲染為顯示用 HTML。
 *
 * @param tag     - 要渲染的 tag；undefined 時回傳空字串
 * @param options - 渲染旗標
 * @returns 顯示用 HTML
 */
export function renderTagCore(tag: IPromptTag | undefined, options: IPromptOptionValueRecordWithLegacyRuntime): string
{
	if (!tag) return ''

	let value = tag.value
	/** BREAK 以嚴格相等判定（不 trim），僅在 autoBreakBeforeWrap / autoBreakAfterWrap 任一開啟時改渲染成分隔線； */
	if (tagIsBreak(tag) && (options.autoBreakBeforeWrap || options.autoBreakAfterWrap))
	{
		value = BREAK_HTML
	}
	else if (tag.incWeight > 0)
	{
		/**
		 * 權重：incWeight > 0 依 useNovelAiWeightSymbol 選用 {} 或 ()，
		 * NovelAI 用 {}，其餘用 ()
		 */
		const open = options.useNovelAiWeightSymbol ? EnumTagWeightSymbol.NovelAiWeightSymbolOpen : EnumTagWeightSymbol.IncWeightSymbolOpen
		const close = options.useNovelAiWeightSymbol ? EnumTagWeightSymbol.NovelAiWeightSymbolClose : EnumTagWeightSymbol.IncWeightSymbolClose
		value = wrapWeightCharacters(common.setLayers(value, 0, open, close), {
			count: tag.incWeight,
			open,
			close,
			tag,
		})
	}
	else if (tag.decWeight > 0)
	{
		/**
		 * decWeight > 0 固定選用 []
		 */
		const open = EnumTagWeightSymbol.DecWeightSymbolOpen
		const close = EnumTagWeightSymbol.DecWeightSymbolClose
		value = wrapWeightCharacters(common.setLayers(value, 0, open, close), {
			count: tag.decWeight,
			open,
			close,
			tag,
			isDecWeight: true,
		})
	}
	else
	{
		/** 只有 `#` 需要額外標記，其餘一般 tag 維持原樣 */
		value = wrapTagCharacters(value, tag, tagIsSharp(tag) ? 'sharp-character' : undefined)
	}
	return value
}
