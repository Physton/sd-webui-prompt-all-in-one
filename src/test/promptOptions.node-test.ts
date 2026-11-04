import { test } from 'node:test';
import { _getPromptOptionValueRecord, promptOptions } from '#/src/utils/promptOptions';
import { loadPromptOptionsFromStorage } from '#/test/helpers/promptOptions-io';
import { getI18nDefaultLangKeys } from '#/test/helpers/i18n-io';

test('promptOptions:snapshot', (t) => {
	const data = _getPromptOptionValueRecord();
	const overridden = loadPromptOptionsFromStorage();
	t.assert.snapshot({
		default: data,
		overridden,
	})
})

test('promptOptions:key-unique', (t) => {
	const keys = promptOptions.map(option => option.key);
	const unique = new Set(keys);
	t.assert.equal(keys.length, unique.size, `promptOptions 存在重複的 key: ${keys.join(', ')}`);
});

test('promptOptions:parentKey-is-existing-key', (t) => {
	const keys = new Set(promptOptions.map(option => option.key));
	for (const option of promptOptions) {
		const parentKey = option.checkUi?.parentKey;
		if (!parentKey) continue;
		t.assert.equal(keys.has(parentKey), true, `${option.key} 的 parentKey "${parentKey}" 不在 promptOptions 的 key 清單中`);
	}
});

test('promptOptions:labelLangKey-exists-in-i18n', (t) => {
	const langKeys = getI18nDefaultLangKeys();
	for (const option of promptOptions) {
		if (!option.checkUi) continue;
		t.assert.equal(langKeys.has(option.checkUi.labelLangKey), true, `${option.key} 的 labelLangKey "${option.checkUi.labelLangKey}" 不存在於 i18n default 語言的 lang 鍵清單`);
	}
});
