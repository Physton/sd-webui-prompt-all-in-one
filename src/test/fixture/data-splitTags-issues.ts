import {
	assertNoEdgeWhitespace,
	assertNoInvisibleChars,
	assertNoOrphanCommaRegressions,
} from '../helpers/node-test-helper2';
import type { ISplitTagsCase } from '../helpers/types/node-test-case-types';

/**
 * ====================================================================
 *  issues 回歸案例（regression cases）
 *
 *  分類目的：收錄「已知 bug 的原始輸入」，防止未來更新時同型 bug 復發。
 *  與一般 cases 的差異：
 *    1. 保留使用者回報的原始字串（不裁剪、不改寫），並附最小重現對照組。
 *    2. 除快照外，另有 assertResult 明確斷言（快照被盲目更新也不會漏接）。
 *
 *  ── issue #1：孤立雙引號 → 孤兒逗號 tag（genPrompt 輸出 ", ,,"）──
 *  病因（已修復）：
 *    - 輸入含孤立 `"`（JSON 殘骸 `", "}, }`）開啟引號狀態後永不關閉。
 *    - 舊版 splitAtNewline() 分行時漏重置 quoteChar（行級變數散落維護），
 *      導致引號跨行吞掉整段後續標籤，逗號分割全部失效。
 *    - lora 後處理把段落間的「分隔逗號」切成值恰為 "," 的孤兒 tag。
 *    - genPrompt 為每顆 tag 補 ", " → 孤兒逗號被渲染成 ", ,,"。
 *  修復方式：
 *    - splitTags.js / splitByPeriod.js 建立 lineState runtime 物件，
 *      行級變數集中管理，分行時 lineState.reset() 一併重置（含 quoteChar）。
 *  鎖定行為：
 *    - 分行結束引號（引號不跨行保留）。
 *    - 不得產生孤兒逗號 tag、不得有尾隨逗號 tag、lora tag 完整獨立。
 *
 *  型別契約：helpers/node-test-case-types.ts → ISplitTagsCase
 * ====================================================================
 */
export const issuesCases001: ISplitTagsCase[] = [
	/** issue #1 — 使用者回報的完整原始輸入（兩行，含孤立 "） */
	{
		input: 'Bright, direct mid-day sunlight illuminates the scene, casting clear light across her face and chest above water while creating shimmering ripple patterns through the turquoise sea floor below.   Background, Composition & SettingSetting: An open tropical sea or lagoon with crystal-clear turquoise water over a pale sandy seabed. The horizon features a vast blue sky filled with fluffy white cumulus clouds.   Composition: An over-under (split-level) water shot using a wide-angle dome lens, capturing both the vibrant underwater scene in the lower half and the sunny sky with the subject in the upper half., "}, }\nGrainy smartphone photo with high ISO noise, selfie, raw unedited aesthetic, moody boudoir erotica, voyeuristic sensual editorial look, heroin chic vibe. Candid photo raking from the side, muted desaturated colors, nostalgic film look, photo dump style. Shot on a 28mm lens at f/1.8 with visible digital grain., <lora:realism_engine_krea2_v3.1:0.4>, <lora:babegenerator.ink-realism_helper:1> <lora:2_Strongx3_wl7:1>, <lora:realism_engine_krea2_v3.1:0.25>, <lora:babegenerator.ink-realism_helper:0.65>, <lora:Krea2_TextFusion_Refusal_Reduction:2>',
		note: 'issue#1: 原始回報輸入 — 孤立雙引號不產生孤兒逗號 tag',
		assertResult: assertNoOrphanCommaRegressions,
	},
	/** issue #1 — 第二段獨立輸入（無引號對照組，正常行為不得被改壞） */
	{
		input: 'Grainy smartphone photo with high ISO noise, selfie, raw unedited aesthetic, moody boudoir erotica, voyeuristic sensual editorial look, heroin chic vibe. Candid photo raking from the side, muted desaturated colors, nostalgic film look, photo dump style. Shot on a 28mm lens at f/1.8 with visible digital grain., <lora:realism_engine_krea2_v3.1:0.4>, <lora:babegenerator.ink-realism_helper:1> <lora:2_Strongx3_wl7:1>, <lora:realism_engine_krea2_v3.1:0.25>, <lora:babegenerator.ink-realism_helper:0.65>, <lora:Krea2_TextFusion_Refusal_Reduction:2>',
		note: 'issue#1: 無引號對照組 — 正常輸入不受影響',
		assertResult: assertNoOrphanCommaRegressions,
	},
	/** issue #1 — 最小重現：孤立 " 與其唯一的差異變因 */
	{
		input: 'Scene text., }\nGrainy photo with grain., <lora:A:0.4>, <lora:B:1> <lora:C:1>, <lora:D:0.25>',
		note: 'issue#1: 最小重現 — 無引號對照組',
		assertResult: assertNoOrphanCommaRegressions,
	},
	{
		input: 'Scene text., "}, }\nGrainy photo with grain., <lora:A:0.4>, <lora:B:1> <lora:C:1>, <lora:D:0.25>',
		note: 'issue#1: 最小重現 — 加入孤立 "（唯一變因）不得產生孤兒逗號',
		assertResult: assertNoOrphanCommaRegressions,
	},
	/** issue #1 — 分行結束引號的語意鎖定：第二行照常切割 */
	{
		input: 'a "b, c\nd, e',
		note: 'issue#1: 引號不跨行保留 — 第二行逗號照常切割',
		assertResult: assertNoOrphanCommaRegressions,
	},
	/** --- */
]

export const issuesCases: ISplitTagsCase[] = [
	...issuesCases001
]
