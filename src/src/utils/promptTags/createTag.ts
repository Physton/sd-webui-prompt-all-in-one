import { EnumPromptTagType, IPromptTag, IPromptTagBase, IPromptTagType, IPromptTagValue } from './tag-types';
import type {
	ITSAnyOfUnion,
	ITSUnionToOptional,
	ITSNullable,
	ITSTypeAndStringLiteral,
	ITSOverwrite,
	ITSLogicIsNever,
	ITSLogicIsAny,
} from 'ts-type';
import { _normalizeTagValue, _sortPromptTagKeys } from './util/tag-normalize';


/** 建立 tag 時可覆寫的欄位：type / value 由 _createTagBase() 強制正規化，故不開放覆寫 */
export type IPromptTagProps = Partial<Omit<IPromptTag, 'type' | 'value'>>;

/**
 * 產生 tag 的唯一識別值。
 * 以當前時間戳為前綴、隨機數補位（與 tagMixin.js 的 _appendTag() 同源），
 * 同一 session 內近似遞增，故以 id 排序即近似以建立時間排序。
 *
 * 注意：toFixed(0) 回傳字串，與 Date.now() 相加會走字串串接而非數值相加，
 * 因此回傳型態為字串；此值僅要求 session 內近似不重複，並非嚴格 UUID。
 */
export function _createTagUuid()
{
	return Date.now() + (Math.random() * 1000000).toFixed(0)
}

/**
 * 以 tag 為基礎、props 為覆寫，建立具備標準核心欄位的 tag 物件。
 * 對應 tagMixin.js 的 _appendTag() 核心欄位建立階段。
 *
 * @param tag - base fields, spread first
 * @param props - extra overrides; 'type' | 'value' are not overridable
 * @returns 具備 type / value / localValue 保證的 tag 物件
 */
export function _createTagBase<T extends IPromptTagBase, P extends IPromptTagProps>(tag: T, props?: P): ITSOverwrite<T, Omit<P, 'type' | 'value'>>
{
	/**
	 * props 覆蓋 tag，但三項核心欄位由本函式決定：
	 * type 以 tag.type 為準（缺省 text）；value 取 tag；
	 * localValue 則優先 props、再退回 tag，保留覆寫在地化文字的能力。
	 */
	return {
		...tag,
		...props,
		type: tag.type || EnumPromptTagType.text as T['type'],
		value: _normalizeTagValue(tag.value),
		localValue: _normalizeTagValue(props?.localValue ?? tag.localValue),
	}
}

export type I_IsEmptyObject<T> =
	T extends object
	? keyof T extends never
	? true
	: false
	: false

export type IConditionalOverwrite<T, P> =
	ITSLogicIsAny<P> extends true ? T :
	ITSLogicIsNever<P> extends true ? T :
	[P] extends [undefined] ? T :
	I_IsEmptyObject<P> extends true ? T :
	ITSOverwrite<T, P>

export function _updateTagProps<T extends IPromptTagBase, P extends IPromptTagProps | undefined>(tag: T, props?: P): IConditionalOverwrite<T, P>
{
	if (props)
	{
		for (const key of Object.keys(props))
		{
			tag[key] = props[key as keyof P]
		}
	}
	return tag as any
}
