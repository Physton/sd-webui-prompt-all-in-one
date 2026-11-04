import { EnumPromptTagType, IPromptTag, IPromptTagValue } from '../../src/utils/promptTags/tag-types'

export type ITestPromptTagProps = Partial<Omit<IPromptTag, 'type' | 'value'>>;

export function _t_createTag_core(type: IPromptTag['type'], value: IPromptTag['value'], props?: ITestPromptTagProps): IPromptTag {
	return {
		type,
		value,
		...props
	}
}

/** 一般文字標籤（對應 _appendTag 的 type='text'）。 */
export function _t_createTag_text(value: IPromptTag['value'], props?: ITestPromptTagProps): IPromptTag {
	return _t_createTag_core(EnumPromptTagType.text, value, props)
}

/** 換行標籤（對應 _appendTag 的 type='wrap'）。 */
export function _t_createTag_wrap(props?: ITestPromptTagProps): IPromptTag {
	return _t_createTag_core(EnumPromptTagType.wrap, EnumPromptTagType.VALUE_NEWLINE, props)
}

export function _t_createTag_brk(props?: ITestPromptTagProps): IPromptTag {
	return _t_createTag_core(EnumPromptTagType.text, EnumPromptTagType.VALUE_KEYWORD_BREAK, props)
}

/** Lora 標籤（tagIsLoraLike 以 isLora / isLyco 判定）。 */
export function _t_createTag_lora(name: string, props?: ITestPromptTagProps): IPromptTag {
	return _t_createTag_core(EnumPromptTagType.lora, `<lora:${name}:1>`, { ...props, isLora: true })
}

/** 指定權重的 Lora 標籤（權重寫入 value；供「權重不視為差異」的去重案例）。 */
export function _t_createTag_lora_weight(name: string, weight: number | string, props?: ITestPromptTagProps): IPromptTag {
	return _t_createTag_core(EnumPromptTagType.lora, `<lora:${name}:${weight}>`, { ...props, isLora: true })
}

/** Lyco 標籤（tagIsLoraLike 以 isLora / isLyco 判定）。 */
export function _t_createTag_lyco(name: string, props?: ITestPromptTagProps): IPromptTag {
	return _t_createTag_core(EnumPromptTagType.lyco, `<lyco:${name}:1>`, { ...props, isLyco: true })
}
