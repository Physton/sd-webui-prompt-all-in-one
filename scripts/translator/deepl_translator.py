from scripts.translator.base_tanslator import BaseTranslator
import requests

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
            raise Exception("api_key is required")
        headers = {"Authorization": f"DeepL-Auth-Key {api_key}"}
        data = {
            'text': text,
            'source_lang': self.from_lang,
            'target_lang': self.to_lang
        }

        response = requests.post(url, headers=headers, data=data, timeout=10)
        if response.status_code != 200:
            raise Exception("DeepL request error")
        if not response.text:
            raise Exception("DeepL response is empty")
        result = response.json()
        if 'message' in result:
            raise Exception(result['message'])
        if 'translations' not in result:
            raise Exception("No response from DeepL")
        if isinstance(text, list):
            results = []
            for item in result['translations']:
                results.append(item['text'])
            return results
        else:
            return result['translations'][0]['text']

    def translate_batch(self, texts):
        return self.translate(texts)
