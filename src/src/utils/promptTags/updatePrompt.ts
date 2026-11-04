/**
 * updatePrompt.ts
 *
 * 由 phystonPrompt.vue 抽離的「更新 prompt」核心。
 *
 * 為何抽離：原方法同時包含（A）純決策——依 BREAK 與選項計算應插入的換行位置、
 * （B）編排——插入後交由 updateTags() 重跑、無需插入時改走 genPrompt() 並提交輸出。
 * A 是可單獨驗證的邏輯，B 是與宿主（Vue 元件）的接線；
 * 抽為函式後，元件只負責注入宿主行為，被測邏輯與線上執行的是同一份程式碼
 * （禁止複製邏輯）。
 *
 * @module utils/updatePrompt
 */

import { tagIsBreak, tagIsWrap } from './util'
import { IPromptTag } from './tag-types'
import type { IHostPromptOptions } from './types'

/**
 * 計算應插入換行 tag 的位置（純決策，不修改輸入）。
 *
 * 規則（與原 updatePrompt 第一段迴圈等價）：
 *   - 只看 BREAK tag；換行 tag 不參與判定。
 *   - autoBreakBeforeWrap：上一個不是換行 → 於當前索引前插入。
 *   - autoBreakAfterWrap ：下一個不是換行 → 於當前索引後插入。
 *   - BREAK 位於陣列開頭時不產生「前方換行」（原行為保留）。
 *
 * 回傳的索引基於「尚未插入任何換行」的原陣列，套用時需加上已插入數量（見 updatePrompt）。
 *
 * @param tags    - 當前標籤陣列
 * @param options - 換行插入選項
 * @returns 應插入換行的索引陣列（依遞增順序，可能重複）
 */
export function collectWrapInsertIndexes(
    tags: readonly IPromptTag[],
    { autoBreakBeforeWrap, autoBreakAfterWrap }: IHostPromptOptions = {},
): number[] {
    const insertWrapIndexes: number[] = []
    const length = tags.length
    for (let i = 0; i < length; i++) {
        const tag = tags[i]
        if (!tagIsBreak(tag)) continue
        if (autoBreakBeforeWrap) {
            // 如果是在“BREAK”关键词前面加换行符 / 判断上一个是否换行符
            if (i - 1 >= 0) {
                const prevTag = tags[i - 1]
                // 上一个已经是换行了 → 不插入
                if (!tagIsWrap(prevTag)) insertWrapIndexes.push(i)
            }
        }
        if (autoBreakAfterWrap) {
            // 如果是在“BREAK”关键词后面加换行符 / 判断下一个是否换行符
            if (i + 1 < length) {
                const nextTag = tags[i + 1]
                // 下一个已经是换行了 → 不插入
                if (!tagIsWrap(nextTag)) insertWrapIndexes.push(i + 1)
            }
        }
    }
    return insertWrapIndexes
}

/**
 * 宿主（Vue 元件）注入的介面：本函式只做編排，實際行為全由宿主提供。
 */
export interface IUpdatePromptHost {
    /** 當前標籤陣列（collectWrapInsertIndexes 的輸入，也是插入的目標） */
    tags: IPromptTag[]
    /**
     * 宿主的選項值，形狀即 IHostPromptOptions。
     * 元件實例 this 上即有同名選項屬性，呼叫端可直接以 options: this 傳入。
     */
    options: IHostPromptOptions
    /**
     * 插入換行 tag。簽名對應元件的 _appendTag(value, localValue, disabled, index, type)。
     * 宿主需依 index 做 splice，後續插入位置才會因 offset 遞增而正確。
     */
    appendTag: (value: string, localValue: string, disabled: boolean, index: number, type: string) => void
    /** 有插入時的通知：元件實作為 updateTags()（其內部會再次呼叫 updatePrompt） */
    refresh: () => void
    /** 產生 prompt 字串：元件實作為 this.genPrompt()，測試可注入被抽出的 genPrompt */
    genPrompt: () => string
    /** 提交最終 prompt：元件實作為寫入 this.prompt / textarea / 觸發 input 事件 */
    commit: (prompt: string) => void
}

/**
 * 更新 prompt（編排核心）。
 *
 * 流程（與原 updatePrompt 等價）：
 *   1. 依 BREAK 與選項計算換行插入位置。
 *   2. 依序插入（index 需加上先前已插入的數量造成的位移）。
 *   3. 有插入 → 通知宿主 refresh() 並結束（由宿主重跑本函式）。
 *   4. 無插入 → 以 genPrompt() 產生結果並 commit()。
 *
 * @param host - 宿主注入的標籤、選項與行為
 */
export function updatePromptCore(host: IUpdatePromptHost): void {
    const insertWrapIndexes = collectWrapInsertIndexes(host.tags, host.options)
    for (let i = 0; i < insertWrapIndexes.length; i++) {
        const index = insertWrapIndexes[i] + i
        host.appendTag("\n", "\n", false, index, 'wrap')
    }
    if (insertWrapIndexes.length) {
        host.refresh()
        return
    }

    host.commit(host.genPrompt())
}
