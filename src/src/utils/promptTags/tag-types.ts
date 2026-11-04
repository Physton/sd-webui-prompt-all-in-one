import type { ITSAnyOfUnion, ITSUnionToOptional, ITSNullable, ITSTypeAndStringLiteral } from 'ts-type'

export const enum EnumPromptTagType
{
	lora = 'lora',
	lyco = 'lyco',
	wrap = 'wrap',

	text = 'text',

	/* =============== */

	/** when value is "BREAK" */
	VALUE_KEYWORD_BREAK = 'BREAK',

	/** when value is "AND" (standalone uppercase) */
	VALUE_KEYWORD_AND = 'AND',

	/** when value is "#" */
	VALUE_SHARP = '#',

	/** when value is "\n" */
	VALUE_NEWLINE = '\n',

	/**
	 * when value is ""
	 * @internal
	 */
	VALUE_INTERNAL_EMPTY = '',
}

export const enum EnumIsEnglish
{
	NOT_ENGLISH = 0,
	ENGLISH = 1,
	UNKNOWN = -1,
}

export type IPromptTagType = EnumPromptTagType.lora | EnumPromptTagType.lyco | EnumPromptTagType.wrap | EnumPromptTagType.text;

export type IPromptTagValueEnum = Exclude<EnumPromptTagType, IPromptTagType>;
export type IPromptTagValue = ITSTypeAndStringLiteral<IPromptTagValueEnum> | (string & {});

export type IPromptTagValueRuntimeInput<T extends IPromptTagValue = IPromptTagValue> = T | null | undefined | false;

/**
 * src/src/mixins/phystonPrompt/tagMixin.js
 * RESTOREABLE_PROPERTIES
 */
export interface IPromptTagRuntimeExtraProps
{
	/** 是否為關鍵字（全大寫、獨立詞） */
  isKeyword?: boolean

	/**
	 * Whether to remove the comma after this tag when splitting by period.
	 */
	noCommaAfter?: boolean;
	/**
	 * Whether to remove the comma before this tag when splitting the standalone
	 * uppercase AND keyword. Only set on tags produced by the AND split; the
	 * comma between the previous tag and an AND tag is controlled by this flag.
	 */
	noCommaBefore?: boolean;
}

export interface IPromptTagRuntimeProps
{
	weightNum?: number;
	incWeight?: number;
	decWeight?: number;
}

export interface IPromptTagBase<Type extends IPromptTagType = IPromptTagType, Value extends IPromptTagValue = IPromptTagValue>
{
	type: Type;
	value: Value;
	localValue?: IPromptTagValue;
	disabled?: boolean;
}

export interface IPromptTagBaseWithUuid extends IPromptTagBase
{
	id?: string;
}

export interface IPromptTag extends IPromptTagBaseWithUuid, IPromptTagRuntimeExtraProps, IPromptTagRuntimeProps
{
	originalValue?: string;

	isLora?: boolean;
	loraExists?: boolean;
	loraName?: string;

	isLyco?: boolean;
	lycoExists?: boolean;
	lycoName?: string;

	isEmbedding?: boolean;
	embeddingName?: string;

	classes?: string[];

	toLocal?: boolean;
	localValue?: string;
	isEnglish?: EnumIsEnglish;
}

export type IPromptTagLoraLikeCore = ITSAnyOfUnion<{
	isLora: true;
	loraName: string;
} | {
	isLyco: true;
	lycoName: string;
}>

export type IPromptTagEmbeddingCore = {
	isEmbedding: true;
	embeddingName: string;
}
