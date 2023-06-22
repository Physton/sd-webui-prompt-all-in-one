from scripts.physton_prompt.translator.base_tanslator import BaseTranslator
import uuid
import requests
import json
from scripts.physton_prompt.get_lang import get_lang


class CaiyunTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('caiyun')

    def translate(self, text):
        if not text:
            return ''
        url = 'http://api.interpreter.caiyunai.com/v1/translator'
        token = self.api_config.get('token', '')
        if not token:
            raise Exception(get_lang('is_required', {'0': 'Token'}))

        payload = {
            "source": text,
            "trans_type": f'{self.from_lang}2{self.to_lang}',
            "request_id": str(uuid.uuid4()),
            "detect": True,
        }

        headers = {
            "content-type": "application/json",
            "x-authorization": "token " + token,
        }

        response = requests.post(url, data=json.dumps(payload), headers=headers)
        if not response.text:
            raise Exception(get_lang('response_is_empty', {'0': 'caiyun'}))
        result = response.json()
        if 'message' in result:
            raise Exception(result['message'])
        if 'target' not in result:
            raise Exception(get_lang('no_response_from', {'0': 'caiyun'}))
        return result['target']
