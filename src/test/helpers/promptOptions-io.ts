
import { _getPromptOptionValueRecord, promptOptionStorageKeys } from '#/src/utils/promptOptions';
import { IPromptOptionKeyAndLegacyStorage, IPromptOptionValueRecord, IPromptOptionValueRecordWithLegacy } from '#/src/utils/promptOptions/definitions';
import { __PROJECT_STORAGE } from '#/test/__root';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * 模組層快取：讀取涉及同步檔案 I/O，且預設值在單次測試程序內不會變動；
 * 以 Object.freeze() 凍結，避免個別測試案例意外改寫共享的預設值表。
 */
let _loadedData: IPromptOptionValueRecord = null;
let _defaultData: IPromptOptionValueRecord = null;

export function getPromptOptionValueRecordCached()
{
	return _defaultData ??= Object.freeze(_getPromptOptionValueRecord());
}

/**
 * 逐鍵比對 storage/<key>.json 與程式預設值，回傳覆寫後的完整記錄表。
 * 尚未套用 Object.freeze()，凍結由呼叫端負責。
 * 檔案不存在或內容為 null 時沿用程式預設值，因此可只覆寫需要差異化的選項。
 */
function _loadPromptOptionsFromStorageCore()
{
	const data = {
		...getPromptOptionValueRecordCached(),
	} as IPromptOptionValueRecordWithLegacy;

	const label = `[loadPromptOptionsFromStorage]`

	const allKeys = new Set(Object.keys(data).concat(promptOptionStorageKeys)) as Set<IPromptOptionKeyAndLegacyStorage>

	for (const key of allKeys) {
		const filePath = join(__PROJECT_STORAGE, `${key}.json`);
		/**
		 * 預設輸出該鍵的最終值供除錯；發生覆寫時改為只印差異列，避免同一鍵重複列印。
		 */
		let shouldPrint = true;
		/**
		 * 檔案不存在時維持程式預設值（靜默沿用，不視為錯誤）。
		 */
		if (existsSync(filePath)) {
			const fileContent = readFileSync(filePath, 'utf-8');
			const fileData = JSON.parse(fileContent);

			const value = data[key];

			/**
			 * 內容為 null 視同「未覆寫」
			 */
			if (fileData != null && fileData !== value)
			{
				console.log(label, `[OVERRIDE] ${key}: ${JSON.stringify(value)} -> ${JSON.stringify(fileData)}`);
				data[key] = fileData;
				shouldPrint = false;
			}
		}
		if (shouldPrint)
		{
			console.log(label, `${key}:`, data[key]);
		}
	}

	return data;
}

/**
 * 取得覆寫後的 promptOptions 預設值記錄表（記憶體快取 + 凍結）。
 * 同一次測試程序內重複呼叫不會重新讀取檔案，確保所有測試看到同一份快照。
 *
 * @returns 凍結後的預設值記錄表
 */
export function loadPromptOptionsFromStorage()
{
	return _loadedData ??= Object.freeze(_loadPromptOptionsFromStorageCore());
}
