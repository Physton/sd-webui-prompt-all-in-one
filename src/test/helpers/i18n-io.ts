import { readFileSync } from 'fs';
import { join } from 'path';
import { __PROJECT_ROOT } from '#/test/__root';

/** i18n.json 的單一語言條目結構。 */
export interface I_I18nLanguage {
	code: string;
	name: string;
	lang: Record<string, string>;
}

/** i18n.json 的檔案結構。 */
export interface I_I18nFile {
	default: string;
	languages: I_I18nLanguage[];
}

/** 模組層快取：i18n.json 在單次測試程序內不會變動。 */
let _i18n: I_I18nFile = null;

/**
 * 讀取並解析專案根目錄的 i18n.json（模組層快取）。
 * 解析失敗時由 JSON.parse 直接丟出，由呼叫端測試呈現失敗。
 */
export function loadI18n(): I_I18nFile
{
	return _i18n ??= JSON.parse(readFileSync(join(__PROJECT_ROOT, 'i18n.json'), 'utf-8'));
}

/**
 * 取得 default 語言的條目，作為鍵集合比對的基準。
 */
export function getI18nDefaultLanguage(): I_I18nLanguage
{
	const i18n = loadI18n();
	const lang = i18n.languages.find(item => item.code === i18n.default);
	if (lang == null) throw new Error(`i18n.json 的 default "${i18n.default}" 不存在於 languages 的 code 清單`);
	return lang;
}

/**
 * 取得 default 語言的 lang 鍵集合。
 */
export function getI18nDefaultLangKeys(): Set<string>
{
	return new Set(Object.keys(getI18nDefaultLanguage().lang));
}

/**
 * 區分實際翻譯語言與空佔位語言。
 *
 * lang 為空物件是刻意設計：執行期 getLang 依序 fallback
 * （當前語言 → en_US → key 名稱本身），佔位語言不需自備鍵值。
 */
export function partitionI18nLanguages(): { translated: I_I18nLanguage[]; placeholders: I_I18nLanguage[] }
{
	const translated: I_I18nLanguage[] = [];
	const placeholders: I_I18nLanguage[] = [];
	for (const lang of loadI18n().languages) {
		(Object.keys(lang.lang).length === 0 ? placeholders : translated).push(lang);
	}
	return { translated, placeholders };
}
