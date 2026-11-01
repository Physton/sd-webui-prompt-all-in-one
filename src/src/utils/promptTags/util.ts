/**
 * prompt tag 的型別判定 (Type Guard) 與掃描工具。
 *
 * 欄位如 isLora / isEmbedding 由 tagMixin._setTagClass() 設定，
 * 本檔的判定函式只讀取這些欄位並回傳型別守衛 (Type Guard)，
 * 讓呼叫端在判斷後直接取得收窄後的欄位。
 *
 * @module utils/promptTags/util
 */

import { ITSAnyOfUnion } from 'ts-type';
import { loraRegex, lycoRegex } from './util/tag-lora';
import { EnumPromptTagType, IPromptTag, IPromptTagEmbeddingCore, IPromptTagLoraLikeCore, IPromptTagValue } from './tag-types';

/**
 * 是否為 Lora 或 Lyco —— 兩者同屬 Extra Networks 的權重模型標籤，
 * 呼叫端可同等處理，故合併為單一判定。
 *
 * @param tag - 要判定的 tag
 */
export function tagIsLoraLike(tag?: IPromptTag): tag is IPromptTag & IPromptTagLoraLikeCore
{
	return tag?.isLora || tag?.isLyco
}

/**
 * 是否為分行 tag —— 依 type 判定，value 為換行字元 (VALUE_NEWLINE)，
 * 是 prompt 內「一行」的分界。
 *
 * @param tag - 要判定的 tag
 */
export function tagIsWrap(tag?: IPromptTag): tag is IPromptTag & { type: EnumPromptTagType.wrap }
{
	return tag?.type === EnumPromptTagType.wrap
}

/**
 * 是否為 BREAK tag —— 以 trim 後的 value 比對 VALUE_BREAK，
 * 故 value 兩端空白不影響判定；BREAK 本身是 text 類型的普通 tag。
 *
 * @param tag - 要判定的 tag
 */
export function tagIsBreak(tag?: IPromptTag): tag is IPromptTag & { value: EnumPromptTagType.VALUE_BREAK }
{
	return tag?.value?.trim() === EnumPromptTagType.VALUE_BREAK
}

/**
 * 是否為停用 tag —— 以真值 (truthy) 判定而非嚴格 === true，
 * disabled 存非布林真值時同樣視為停用。
 *
 * @param tag - 要判定的 tag
 */
export function tagIsDisabled(tag?: IPromptTag): tag is IPromptTag & { disabled: true }
{
	return tag?.disabled!
}

/**
 * 是否為 Embedding tag —— value 或 originalValue 比對到已載入的
 * embedding 名稱時，由 tagMixin._setTagClass() 標記，此處只讀值。
 *
 * @param tag - 要判定的 tag
 */
export function tagIsEmbedding(tag?: IPromptTag): tag is IPromptTag & IPromptTagEmbeddingCore
{
	return tag?.isEmbedding!
}

/**
 * 是否為 Extra Networks tag —— Lora / Lyco / Embedding 的聯集；
 * 組字輸出到此類 tag 時才向後端請求對應的模型清單。
 *
 * @param tag - 要判定的 tag
 */
export function tagIsExtraNetworks(tag?: IPromptTag): tag is IPromptTag & (ITSAnyOfUnion<IPromptTagLoraLikeCore | IPromptTagEmbeddingCore>)
{
	return tagIsLoraLike(tag) || tagIsEmbedding(tag)
}

/**
 * 是否為「#」tag —— 普通 tag，但 value 剛好是 `#`。
 *
 * 注意與 phystonPrompt.vue genPrompt() 的 lineHasSharp 判定不同：
 * 該處檢查 value 以「#」開頭或結尾（含 # 的文字），此處只認 value 純為 `#` 的 tag。
 *
 * @param item - 要判定的 tag
 */
export function tagIsSharp(item?: IPromptTag): item is IPromptTag & { value: EnumPromptTagType.VALUE_SHARP }
{
	return item?.value?.trim() === EnumPromptTagType.VALUE_SHARP
}

export function tagIsWrapWeight(item?: IPromptTag): item is IPromptTag & {
	incWeight: number;
	decWeight: number;
}
{
	return item?.incWeight > 0 || item?.decWeight > 0
}

/**
 * findTagUntil() 的掃描條件：起點、略過條件、目標條件與行數預算。
 */
export interface IFindTagOptions<T extends IPromptTag>
{
	/** 起始索引（含）*/
	startIndex: number;
	/** 自訂略過條件：回傳 true 則跳過該 tag；僅在目標判定未命中後才檢查 */
	ignore?: (tag: T, index: number, tags: readonly T[]) => boolean;
	/** 是否略過 disabled 的 tag；與 ignore() 同樣在目標判定未命中後才檢查 */
	ignoreDisabled?: boolean;
	/** 目標判定：每一輪最先檢查，命中即回傳，不受略過條件與行數預算影響 */
	untilTarget: (tag: T, index: number, tags: readonly T[]) => boolean;
	/** 最多遍歷的行數（以分行 tag 計）：負值代表不限制，未傳或 0 使用預設 2 */
	maxLines?: number;
}

/**
 * findTagUntil() 的掃描結果：是否命中目標、停止位置與略過統計。
 */
export interface IFindTagResult<T extends IPromptTag>
{
	/** 是否有搜尋到目標 */
	found: boolean;
	/** 停止時的 index（無可停 tag 時為 tags.length；行數耗盡時為超限的分行 tag） */
	index: number;
	/** 停止時的 tag；起點超出陣列時為 undefined；行數耗盡時為該超限的分行 tag */
	tag: T | undefined;
	/** 被略過的 tag 數量 */
	ignoredCount: number;
	/** 被略過的行數（受 maxLines 上限約束） */
	linesCount: number;
	/** 傳入的起點 */
	startIndex: number;
}

/**
 * 由 startIndex 向前掃描標籤
 *
 * 四種結束情形 / four ways to finish:
 *   1. 命中目標 → found=true（略過條件不適用於目標）
 *   2. 停在第一個未被略過、且非目標的 tag → found=false
 *   3. 剩餘 tag 全被略過或起點已超出陣列 → found=false、index=tags.length 或 startIndex
 *   4. 已遍歷 maxLines 行仍全是略過 tag → found=false、index 停在超出行數的分行 tag
 *
 * 行數以分行 tag 計，預設最多遍歷 2 行；需跨更多行時傳入 maxLines。
 *
 * @param tags    - 要掃描的標籤陣列
 * @param options - 掃描條件
 * @returns 掃描結果
 */
export function findTagUntil<T extends IPromptTag>(
	tags: readonly T[],
	options: IFindTagOptions<T>,
): IFindTagResult<T>
{
	const { startIndex, ignore, ignoreDisabled, untilTarget } = options
	const total = tags.length
	let index = startIndex < 0 ? 0 : startIndex
	let ignoredCount = 0
	let linesCount = 0
	/** 行數預算 (line budget) 正規化：負值代表不限制，未傳或 0 使用預設 2 行 */
	const maxLines = options.maxLines < 0 ? Infinity : Math.max(0, options.maxLines || 2)
	let isTarget = false

	let tag: T

	while (index < total)
	{
		tag = tags[index]

		const isDisabled = ignoreDisabled && tagIsDisabled(tag)
		isTarget = !isDisabled && !!untilTarget(tag, index, tags)

		/** 目標判定優先：命中即回傳 */
		if (!isTarget)
		{
			const skipped = isDisabled || !!ignore?.(tag, index, tags)

			/** 被略過 → 累計統計後向後一個 tag 繼續掃描 */
			if (skipped)
			{
				if (tagIsWrap(tag)) {
					/** 行數預算已用盡 → 提前結束，該分行 tag 不計入遍歷 */
					if ((linesCount + 1) >= maxLines) break
					linesCount++
				}
				ignoredCount++
				index++
				continue
			}
		}

		/** 不論命中或未命中，都就地停止 */
		break
	}

	return {
		found: isTarget,
		index,
		tag,
		ignoredCount,
		linesCount,
		startIndex,
	}
}

export function findTagByID<T extends IPromptTag>(tags: readonly T[], id: string): T
{
	return tags.find(tag => tag.id === id)!
}
