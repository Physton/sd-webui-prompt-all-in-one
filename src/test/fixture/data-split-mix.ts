
import type { ISplitTagsPipelineCase } from '../helpers/types/node-test-case-types';
import { assertHashCountPreserved } from '../helpers/node-test-helper2';


export const hashPreservationCases: ISplitTagsPipelineCase[] = [
	/**
	 * ── 第一組：'#' 標記數量守恆 ──
	 *
	 * 輸入含三行獨立的 '#' 標記（'#'、'#'、'#,'）。
	 * '#,' 的逗號會被 splitTags 切掉、各行的句號會被 splitByPeriod 切開，
	 * 但 '#' 本身既不是分隔符也不是標點，管線只能把它留在某個片段內，
	 * 因此最終輸出的 '#' 絕對數量必須維持 3。
	 */
	{
		/**
		 * 以單引號 + \n 轉義組成，避免原始碼行尾空白被格式化工具移除，
		 * 確保 "Overall, " / "cute, " 與回報輸入逐位元一致。
		 */
		input: '- **Art Style**: The entire image is rendered in a pixel art style, giving it a retro video game aesthetic.\n#\nOverall, \n#\n#,\nhe image portrays a cute, \nenergetic, and stylish character with a blend of traditional anime features and modern pixel art design.',
		note: 'pixel art prompt — 3 standalone # markers survive splitTags → splitByPeriod',
		assertPipeline: assertHashCountPreserved,
	},
	/** --- */
]
