from scripts.translator.base_tanslator import BaseTranslator
import requests

class GoogleTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('google')

    def translate(self, text):
        if not text:
            return ''
        url = 'https://translation.googleapis.com/language/translate/v2/'
        api_key = self.api_config.get('api_key', '')
        if not api_key:
            raise Exception("api_key is required")
        params = {
            'key': api_key,
            'q': text,
            'source': self.from_lang,
            'target': self.to_lang,
            'format': 'text'
        }
        response = requests.get(url, params=params, timeout=10)
        result = response.json()
        if 'error' in result:
            raise Exception(result['error']['message'])
        if 'data' not in result:
            raise Exception("No response from Google")
        if 'translations' not in result['data']:
            raise Exception("No response from Google")
        return result['data']['translations'][0]['translatedText']
