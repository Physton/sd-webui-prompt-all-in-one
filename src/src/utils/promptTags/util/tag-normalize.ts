import { sortObjectKeys } from 'sort-object-keys2';
import {
	EnumPromptTagType,
	IPromptTag,
	IPromptTagBase,
	IPromptTagValue,
	IPromptTagValueRuntimeInput,
} from '../tag-types';

/**
 * _sortPromptTagKeys() 使用的鍵名排序表：依 _setTag() 填入欄位的順序分組排列
 * （識別欄位 → 值欄位 → 權重欄位），使排序後的 tag 在序列化 / 快照比對時維持穩定可讀的鍵序。
 */
export const PROMPT_TAG_KEYS_ORDER = Object.freeze([

	'id',
	'type',
	'value',
	'disabled',

	/* --- */

	'originalValue',
	'localValue',

	/* === _setTag === */

	'weightNum',
	'incWeight',
	'decWeight',

	/* --- */

] as const) satisfies readonly (keyof IPromptTag)[];

/**
 * 依 PROMPT_TAG_KEYS_ORDER 重排 tag 的鍵名順序。
 *
 * 注意：會直接變更來源物件 / this will mutate the source tag object
 *
 * @example
 * console.dir(_sortPromptTagKeys(_createTagBase({ type: EnumPromptTagType.text, id: 'test', value: 'test' })))
 */
export function _sortPromptTagKeys<T extends IPromptTagBase>(tag: T): T
{
	return sortObjectKeys(tag, {
		keys: PROMPT_TAG_KEYS_ORDER,
		useSource: true,
	})
}

/**
 * 將 null / undefined / false 統一正規化為內部空字串 (VALUE_INTERNAL_EMPTY)。
 */
export function _normalizeTagValue<T extends IPromptTagValue>(value?: IPromptTagValueRuntimeInput<T>): T
{
	return value === null || value === undefined || value === false ? EnumPromptTagType.VALUE_INTERNAL_EMPTY as T: value
}

export function _normalizeTagValueAndTrim<T extends IPromptTagValue>(value?: IPromptTagValueRuntimeInput<T>): T
{
	return _normalizeTagValue(value).trim() as T
}

export function _isNotAllowedValueOrEmpty<T extends IPromptTagValue>(value: IPromptTagValueRuntimeInput<T>): value is null | undefined | false
{
	return _normalizeTagValueAndTrim(value) === EnumPromptTagType.VALUE_INTERNAL_EMPTY
}
