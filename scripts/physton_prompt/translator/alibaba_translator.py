from scripts.physton_prompt.translator.base_tanslator import BaseTranslator
import json
from math import ceil
from scripts.physton_prompt.get_lang import get_lang


class AlibabaTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('alibaba')

    def _get_config(self):
        access_key_id = self.api_config.get('access_key_id', '')
        access_key_secret = self.api_config.get('access_key_secret', '')
        region = self.api_config.get('region', 'cn-shanghai')
        if not access_key_id:
            raise Exception(get_lang('is_required', {'0': 'Access Key ID'}))
        if not access_key_secret:
            raise Exception(get_lang('is_required', {'0': 'Access Key Secret'}))
        if not region:
            raise Exception(get_lang('is_required', {'0': 'Region ID'}))
        return access_key_id, access_key_secret, region

    def translate(self, text):
        if not text:
            return ''
        access_key_id, access_key_secret, region = self._get_config()
        from aliyunsdkcore.client import AcsClient
        from aliyunsdkalimt.request.v20181012 import TranslateRequest

        client = AcsClient(access_key_id, access_key_secret, region)
        request = TranslateRequest.TranslateRequest()
        request.set_SourceLanguage(self.from_lang)
        request.set_Scene("general")
        request.set_SourceText(text)
        request.set_FormatType("text")  # 翻译文本的格式
        request.set_TargetLanguage(self.to_lang)
        request.set_method("POST")
        response = client.do_action_with_exception(request)
        result = json.loads(response)
        if 'Code' not in result:
            raise Exception(get_lang('no_response_from', {'0': 'Alibaba'}))
        if result['Code'] != '200':
            raise Exception(result['Message'])
        if 'Translated' not in result['Data']:
            raise Exception(get_lang('no_response_from', {'0': 'Alibaba'}))
        return result['Data']['Translated']

    def translate_batch(self, texts):
        if not texts:
            return []
        access_key_id, access_key_secret, region = self._get_config()
        from aliyunsdkcore.client import AcsClient
        from aliyunsdkalimt.request.v20181012 import GetBatchTranslateRequest

        results = []

        concurrent = self.get_concurrent()
        texts_len = len(texts)
        group_num = ceil(texts_len / concurrent)
        for i in range(group_num):
            start = i * concurrent
            end = (i + 1) * concurrent
            if end > texts_len:
                end = texts_len
            group_texts = texts[start:end]
            source_texts = {}
            dist_texts = {}
            for i in range(len(group_texts)):
                source_texts[str(i)] = group_texts[i]
                dist_texts[str(i)] = ''

            client = AcsClient(access_key_id, access_key_secret, region)
            request = GetBatchTranslateRequest.GetBatchTranslateRequest()
            request.set_SourceLanguage(self.from_lang)
            request.set_Scene("general")
            request.set_SourceText(source_texts)
            request.set_FormatType("text")
            request.set_TargetLanguage(self.to_lang)
            request.set_ApiType("translate_standard")
            request.set_method("POST")
            response = client.do_action_with_exception(request)
            result = json.loads(response)
            if 'Code' not in result:
                raise Exception(get_lang('no_response_from', {'0': 'Alibaba'}))
            if result['Code'] != '200':
                raise Exception(result['Message'])
            for item in result['TranslatedList']:
                index = item['index']
                if item['code'] == '200':
                    dist_texts[index] = item['translated']

            for i in range(len(group_texts)):
                results.append(dist_texts[str(i)])

        return results
