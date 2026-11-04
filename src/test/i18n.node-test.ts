import { test } from 'node:test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { __PROJECT_ROOT } from '#/test/__root';
import { getI18nDefaultLanguage, loadI18n, partitionI18nLanguages } from '#/test/helpers/i18n-io';

const i18nRaw = readFileSync(join(__PROJECT_ROOT, 'i18n.json'), 'utf-8');

function parseI18nRaw()
{
	return JSON.parse(i18nRaw);
}

/** 回傳 list 中重複出現的項目（保持首次出現順序）。 */
function findDuplicates(list: readonly string[]): string[]
{
	const seen = new Set<string>();
	const dup = new Set<string>();
	for (const item of list) {
		if (seen.has(item)) dup.add(item);
		seen.add(item);
	}
	return [...dup];
}

test('i18n:json-parse', (t) => {
	t.assert.doesNotThrow(parseI18nRaw, 'i18n.json 非合法 JSON');
});

test('i18n:code-and-name-unique', (t) => {
	const { languages } = loadI18n();
	const dupCodes = findDuplicates(languages.map(item => item.code));
	const dupNames = findDuplicates(languages.map(item => item.name));
	t.assert.equal(dupCodes.length, 0, `i18n.json 存在重複的 code: ${dupCodes.join(', ')}`);
	t.assert.equal(dupNames.length, 0, `i18n.json 存在重複的 name: ${dupNames.join(', ')}`);
});

test('i18n:default-code-exists', (t) => {
	const i18n = loadI18n();
	const exists = i18n.languages.some(item => item.code === i18n.default);
	t.assert.equal(exists, true, `default "${i18n.default}" 不存在於 languages 的 code 清單`);
});

test('i18n:translated-languages-match-default-keys', (t) => {
	const base = getI18nDefaultLanguage();
	const baseKeys = new Set(Object.keys(base.lang));
	const { translated, placeholders } = partitionI18nLanguages();
	console.log(`[i18n] translated=${translated.length} placeholders=${placeholders.length} (佔位語言靠 getLang fallback，略過鍵集合比對)`);
	for (const lang of translated) {
		const keys = new Set(Object.keys(lang.lang));
		const missing = [...baseKeys].filter(key => !keys.has(key));
		const extra = [...keys].filter(key => !baseKeys.has(key));
		t.assert.equal(missing.length, 0, `${lang.code} 相較於 default ${base.code} 缺少 ${missing.length} 個 key: ${missing.join(', ')}`);
		t.assert.equal(extra.length, 0, `${lang.code} 相較於 default ${base.code} 多出 ${extra.length} 個 key: ${extra.join(', ')}`);
	}
});
