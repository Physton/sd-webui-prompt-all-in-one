from scripts.translator.base_tanslator import BaseTranslator
import requests
import hashlib
import random

class BaiduTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('baidu')

    def translate(self, text):
        if not text:
            return ''
        url = "https://fanyi-api.baidu.com/api/trans/vip/translate"
        app_id = self.api_config.get('app_id', '')
        app_secret = self.api_config.get('app_secret', '')
        if not app_id:
            raise Exception("app_id is required")
        if not app_secret:
            raise Exception("app_secret is required")
        salt = random.randint(32768, 65536)
        send_text = text
        if isinstance(text, list):
            send_text = '\n'.join(send_text)
        sign = app_id + send_text + str(salt) + app_secret
        sign = hashlib.md5(sign.encode()).hexdigest()
        params = {
            'q': send_text,
            'from': self.from_lang,
            'to': self.to_lang,
            'appid': app_id,
            'salt': salt,
            'sign': sign
        }
        response = requests.get(url, params=params, timeout=10)
        result = response.json()
        if 'error_code' in result:
            raise Exception(result['error_msg'])
        if 'trans_result' not in result:
            raise Exception("No response from Baidu")
        translated_text = []
        for item in result['trans_result']:
            translated_text.append(item['dst'])
        if isinstance(text, list):
            return translated_text
        else:
            return '\n'.join(translated_text)

    def translate_batch(self, texts):
        if not texts:
            return []
        for text in texts:
            text = text.replace('\n', ' ')
        return self.translate(texts)
