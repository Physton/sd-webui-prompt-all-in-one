from scripts.physton_prompt.translator.base_tanslator import BaseTranslator
import requests
from scripts.physton_prompt.get_lang import get_lang


class DeeplTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('deepl')

    def translate(self, text):
        if not text:
            if isinstance(text, list):
                return []
            else:
                return ''
        url = 'https://api-free.deepl.com/v2/translate'
        api_key = self.api_config.get('api_key', '')
        if not api_key:
            raise Exception(get_lang('is_required', {'0': 'API Key'}))
        headers = {"Authorization": f"DeepL-Auth-Key {api_key}"}
        data = {
            'text': text,
            'source_lang': self.from_lang,
            'target_lang': self.to_lang
        }

        response = requests.post(url, headers=headers, data=data, timeout=10)
        if response.status_code != 200:
            raise Exception(get_lang('request_error', {'0': 'DeepL'}))
        if not response.text:
            raise Exception(get_lang('response_is_empty', {'0': 'DeepL'}))
        result = response.json()
        if 'message' in result:
            raise Exception(result['message'])
        if 'translations' not in result:
            raise Exception(get_lang('no_response_from', {'0': 'DeepL'}))
        if isinstance(text, list):
            results = []
            for item in result['translations']:
                results.append(item['text'])
            return results
        else:
            return result['translations'][0]['text']

    def translate_batch(self, texts):
        return self.translate(texts)
