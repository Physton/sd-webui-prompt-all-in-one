from scripts.translator.base_tanslator import BaseTranslator
import requests
import hashlib
import random
import time

class YoudaoTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('youdao')

    def translate(self, text):
        if not text:
            if isinstance(text, list):
                return []
            else:
                return ''
        if isinstance(text, list):
            url = "https://openapi.youdao.com/v2/api"
        else:
            url = "https://openapi.youdao.com/api"
        app_id = self.api_config.get('app_id', '')
        app_secret = self.api_config.get('app_secret', '')
        if not app_id:
            raise Exception("app_id is required")
        if not app_secret:
            raise Exception("app_secret is required")
        curtime = str(int(time.time()))
        salt = random.randint(32768, 65536)
        if isinstance(text, list):
            sign_text = "".join(text)
        else:
            sign_text = text
        if(len(sign_text) <= 20):
            input = sign_text
        elif(len(sign_text) > 20):
            input = sign_text[:10] + str(len(sign_text)) + sign_text[-10:]
        sign = app_id + input + str(salt) + curtime + app_secret
        sign = hashlib.sha256(sign.encode()).hexdigest()
        params = {
            'q': text,
            'from': self.from_lang,
            'to': self.to_lang,
            'appKey': app_id,
            'salt': salt,
            'signType': 'v3',
            'curtime': curtime,
            'sign': sign
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"}
        response = requests.post(url, params=params, timeout=10, headers=headers)
        result = response.json()
        if 'errorCode' not in result:
            raise Exception("No response from Youdao")
        if result['errorCode'] != '0':
            raise Exception(f'errorCode: {result["errorCode"]}')
        if isinstance(text, list):
            if 'translateResults' not in result:
                raise Exception("No response from Youdao")
            results = []
            for item in result['translateResults']:
                if 'translation' not in item:
                    raise Exception("No response from Youdao")
                results.append(item['translation'])
            return results
        else:
            if 'translation' not in result:
                raise Exception("No response from Youdao")
            return result['translation'][0]

    def translate_batch(self, texts):
        return self.translate(texts)
