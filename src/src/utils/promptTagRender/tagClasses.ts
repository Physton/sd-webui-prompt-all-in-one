import { IPromptTag } from '../promptTags/tag-types';
import { IHostPromptOptions } from '../promptTags/types';

export const enum EnumTagValueClass
{
	/** 所有可見 tag 共用的基底 class */
	Value = 'prompt-tag-value',

	/** 反向提示詞中的一般 tag */
	Neg = 'neg-tag',

	Lora = 'lora-tag',
	/** Lora 名稱不在已載入清單中 */
	LoraNotExists = 'lora-not-exists',

	Lyco = 'lyco-tag',
	/** Lyco 名稱不在已載入清單中 */
	LycoNotExists = 'lyco-not-exists',

	Embedding = 'embedding-tag',
}

/**
 * 依 tag 的分類欄位產生 `.prompt-tag-value` 要套用的 class 清單。
 *
 * 分類互斥且依序為 lora → lyco → embedding → 一般 tag，
 * 與 tagMixin._setTagClass() 的偵測順序一致：
 * embedding 判定不會覆蓋已命中的 lora / lyco。
 *
 * 分行 tag 沒有分類欄位，只會拿到基底 class（neg 為 true 時仍附上 neg-tag，
 * 但分行 tag 的樣板不使用 tag.classes，故不影響顯示）。
 *
 * @param tag     - 已由 _setTagClass() 分類的 tag
 * @param options - 渲染脈絡（neg 決定一般 tag 是否標記為反向提示詞）
 * @returns 可直接綁到 :class 的 class 清單
 */
export function getTagClasses(tag?: IPromptTag, options: IHostPromptOptions = {}): EnumTagValueClass[]
{
	const classes: EnumTagValueClass[] = [EnumTagValueClass.Value];
	if (!tag) return classes;

	if (tag.isLora)
	{
		classes.push(EnumTagValueClass.Lora);
		if (!tag.loraExists) classes.push(EnumTagValueClass.LoraNotExists);
	}
	else if (tag.isLyco)
	{
		classes.push(EnumTagValueClass.Lyco);
		if (!tag.lycoExists) classes.push(EnumTagValueClass.LycoNotExists);
	}
	else if (tag.isEmbedding)
	{
		classes.push(EnumTagValueClass.Embedding);
	}
	else if (options.neg)
	{
		classes.push(EnumTagValueClass.Neg);
	}

	return classes;
}
