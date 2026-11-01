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
 * lora-like 語法的顯示分段：`<lora:` / name / `:weight` / `>`。
 *
 * 名稱以 `[^:>]` 界定，故未帶權重時名稱仍完整落在第 2 段；
 * 權重之後允許附加描述（common.loraRegex 允許），一併歸入第 3 段，
 * 確保拆段只改變結構、不改變顯示內容。
 */
const LORA_LIKE_CHARACTERS_REGEX = /^(<(?:lora|lyco):)([^:>]*)([^>]*)(>)$/

export interface ICharactersOptions
{
	tag: IPromptTag;
	className?: string;
}

export interface IWrapWeightCharactersOptions extends ICharactersOptions
{
	count: number;
	open: string;
	close: string;
	isDecWeight?: boolean;
}

/** BREAK 的固定顯示內容：左右虛線夾住 BREAK 字樣；不含使用者輸入，無須 escape */
const BREAK_HTML = '<div class="break-character">---------------------</div> <div class="character">BREAK</div> <div class="break-character">---------------------</div>'

/**
 * 以權重符號包住已渲染的 tag 內容：
 * start / end 顯示重複的權重符號，中間放 characters 的 HTML。
 *
 * @param characters - 已渲染的內容（單一 character，或 lora-like 的多段結構）
 * @param options    - 權重符號的重複次數與字元
 * @returns 組合後的 HTML
 */
function wrapWeightCharacters(characters: string, options: IWrapWeightCharactersOptions): string
{
	let className = 'weight-character'
	if (options.isDecWeight)
	{
		className += ' dec-weight-character'
	}
	if (options.className?.length)
	{
		className += ' ' + options.className
	}
	const start = `<div class="${className}">${options.open.repeat(options.count)}</div>`
	const end = `<div class="${className}">${options.close.repeat(options.count)}</div>`
	return start + characters + end
}

function wrapCharacters(value: string, options?: ICharactersOptions): string
{
	let className = 'character'
	if (options?.className?.length)
	{
		className += ' ' + options.className
	}
	return `<div class="${className}">${common.escapeHtml(value)}</div>`
}

/**
 * 把 lora-like 的 value 依 `<lora:` / name / `:weight` / `>` 拆成多段 character。
 *
 * 不符語法時退回單一 character，顯示結果與一般 tag 相同，
 * 避免未經分類或帶額外語法的 tag 少顯示或多顯示字元。
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
	const wrapSegment = (segment: string, className: EnumTagLoraLikeCharacterClass) => wrapCharacters(segment, {
		tag: options.tag,
		className,
	})

	let html = wrapSegment(open, EnumTagLoraLikeCharacterClass.Open)
	html += wrapSegment(name, EnumTagLoraLikeCharacterClass.Name)
	if (weight.length) html += wrapSegment(weight, EnumTagLoraLikeCharacterClass.Weight)
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
 * - 找不到 tag 回傳空字串。
 * - BREAK 以嚴格相等判定（不 trim），僅在 autoBreakBeforeWrap /
 *   autoBreakAfterWrap 任一開啟時改渲染成分隔線；
 *   與 promptTags/util 的 tagIsBreak()（trim 後比對）刻意不同。
 * - 權重：incWeight > 0 依 useNovelAiWeightSymbol 選用 {} 或 ()，
 *   decWeight > 0 固定選用 []，兩者皆為 0 時只包一層 character。
 * - lora-like（tagIsLoraLike）：內容再依 `<lora:` / name / `:weight` / `>`
 *   拆成多段，讓樣式能分別強調語法符號與模型名稱。
 * - 其餘 value 於 wrapCharacters 內 escapeHtml，
 *   避免標籤內容中的 HTML 破壞版面。
 *
 * @param tag     - 要渲染的 tag；undefined 時回傳空字串
 * @param options - 渲染旗標
 * @returns 顯示用 HTML
 */
export function renderTagCore(tag: IPromptTag | undefined, options: IPromptOptionValueRecordWithLegacyRuntime): string
{
	if (!tag) return ''

	let value = tag.value
	if (tagIsBreak(tag) && (options.autoBreakBeforeWrap || options.autoBreakAfterWrap))
	{
		value = BREAK_HTML
	}
	else if (tag.incWeight > 0)
	{
		/** NovelAI 用 {}，其餘用 () */
		const open = options.useNovelAiWeightSymbol ? EnumTagWeightSymbol.NovelAiWeightSymbolOpen : EnumTagWeightSymbol.IncWeightSymbolOpen
		const close = options.useNovelAiWeightSymbol ? EnumTagWeightSymbol.NovelAiWeightSymbolClose : EnumTagWeightSymbol.IncWeightSymbolClose
		value = wrapWeightCharacters(wrapTagCharacters(common.setLayers(value, 0, open, close), tag), {
			count: tag.incWeight,
			open,
			close,
			tag,
		})
	}
	else if (tag.decWeight > 0)
	{
		const open = EnumTagWeightSymbol.DecWeightSymbolOpen
		const close = EnumTagWeightSymbol.DecWeightSymbolClose
		value = wrapWeightCharacters(wrapTagCharacters(common.setLayers(value, 0, open, close), tag), {
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
