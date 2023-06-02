from scripts.translator.base_tanslator import BaseTranslator
import uuid
import requests

class MicrosoftTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('microsoft')

    def translate(self, text):
        if not text:
            if isinstance(result['translations'], list):
                return []
            else:
                return ''
        url = 'https://api.cognitive.microsofttranslator.com/translate'
        api_key = self.api_config.get('api_key', '')
        region = self.api_config.get('region', '')
        if not api_key:
            raise Exception("api_key is required")
        if not region:
            raise Exception("region is required")
        params = {
            'api-version': '3.0',
            'from': self.from_lang,
            'to': self.to_lang
        }
        headers = {
            'Ocp-Apim-Subscription-Key': api_key,
            'Ocp-Apim-Subscription-Region': region,
            'Content-type': 'application/json',
            'X-ClientTraceId': str(uuid.uuid4())
        }

        body = []
        if isinstance(text, list):
            for item in text:
                body.append({'text': item})
        else:
            body.append({'text': text})

        response = requests.post(url, params=params, headers=headers, json=body, timeout=10)
        result = response.json()
        if 'error' in result:
            raise Exception(result['error']['message'])
        if len(result) == 0:
            raise Exception("No response from Microsoft")

        if isinstance(text, list):
            return [item['translations'][0]['text'] for item in result]
        else:
            return result[0]['translations'][0]['text']

    def translate_batch(self, texts):
        return self.translate(texts)
