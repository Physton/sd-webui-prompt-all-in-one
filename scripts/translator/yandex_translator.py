from scripts.translator.base_tanslator import BaseTranslator
import requests

class YandexTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('yandex')

    def translate(self, text):
        if not text:
            if isinstance(text, list):
                return []
            else:
                return ''
        api_key = self.api_config.get('api_key', '')
        if not api_key:
            raise Exception("api_key is required")

        if isinstance(text, list):
            texts = text
        else:
            texts = [text]
        body = {
            "sourceLanguageCode": self.from_lang,
            "targetLanguageCode": self.to_lang,
            "format": "PLAIN_TEXT",
            "texts": texts,
            "folderId": '',
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Api-Key {api_key}"
        }
        response = requests.post('https://translate.api.cloud.yandex.net/translate/v2/translate',
            json = body,
            headers = headers
        )
        result = response.json()
        if not result:
            raise Exception("No response from Yandex")
        if response.status_code != 200:
            if 'code' in result:
                raise Exception(result["message"])
            else:
                raise Exception(response.text)

        if 'translations' not in result:
            raise Exception("No response from Yandex")

        if len(result['translations']) != len(texts):
            raise Exception("No response from Yandex")

        if isinstance(text, list):
            return [item['text'] for item in result['translations']]
        else:
            return result['translations'][0]['text']

    def translate_batch(self, texts):
        return self.translate(texts)
