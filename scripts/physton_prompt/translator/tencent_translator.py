import hashlib
import hmac
import json
import time
from datetime import datetime

import requests

from scripts.physton_prompt.get_lang import get_lang
from scripts.physton_prompt.translator.base_tanslator import BaseTranslator


class TencentTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('tencent')

    def _get_config(self):
        secret_id = self.api_config.get('secret_id', '')
        secret_key = self.api_config.get('secret_key', '')
        region = self.api_config.get('region', 'ap-shanghai')
        if not secret_id:
            raise Exception(get_lang('is_required', {'0': 'Secret ID'}))
        if not secret_key:
            raise Exception(get_lang('is_required', {'0': 'Secret Key'}))
        if not region:
            raise Exception(get_lang('is_required', {'0': 'Region'}))
        return secret_id, secret_key, region

    def translate(self, text):
        if not text:
            return ''
        secret_id, secret_key, region = self._get_config()
        params = {
            'SourceText': text,
            'Source': self.from_lang,
            'Target': self.to_lang,
            'ProjectId': 0
        }
        res = sign_tencent(secret_id, secret_key, region, params)
        response = requests.post(res['url'], json=params, timeout=10, headers=res['headers'])
        result = response.json()
        if 'Response' not in result:
            raise Exception(get_lang('no_response_from', {'0': 'Tencent'}))
        if 'TargetText' not in result['Response']:
            raise Exception(get_lang('no_response_from', {'0': 'Tencent'}))
        return result['Response']['TargetText']

    def translate_batch(self, texts):
        if not texts:
            return []
        secret_id, secret_key, region = self._get_config()
        params = {
            'SourceTextList': texts,
            'Source': self.from_lang,
            'Target': self.to_lang,
            'ProjectId': 0
        }
        res = sign_tencent(secret_id, secret_key, region, params, 'TextTranslateBatch')
        response = requests.post(res['url'], json=params, timeout=10, headers=res['headers'])
        result = response.json()
        if 'Response' not in result:
            raise Exception(get_lang('no_response_from', {'0': 'Tencent'}))
        if 'TargetTextList' not in result['Response']:
            raise Exception(get_lang('no_response_from', {'0': 'Tencent'}))
        return result['Response']['TargetTextList']


def sign_tencent(secret_id, secret_key, regin, params, action="TextTranslate", version="2018-03-21"):
    host = 'tmt.tencentcloudapi.com'
    endpoint = "https://" + host

    service = "tmt"
    algorithm = "TC3-HMAC-SHA256"
    timestamp = int(time.time())
    date = datetime.utcfromtimestamp(timestamp).strftime("%Y-%m-%d")

    # ************* 步骤 1：拼接规范请求串 *************
    http_request_method = "POST"
    canonical_uri = "/"
    canonical_querystring = ""
    ct = "application/json; charset=utf-8"
    payload = json.dumps(params)
    canonical_headers = "content-type:%s\nhost:%s\nx-tc-action:%s\n" % (ct, host, action.lower())
    signed_headers = "content-type;host;x-tc-action"
    hashed_request_payload = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    canonical_request = (http_request_method + "\n" +
                         canonical_uri + "\n" +
                         canonical_querystring + "\n" +
                         canonical_headers + "\n" +
                         signed_headers + "\n" +
                         hashed_request_payload)

    # ************* 步骤 2：拼接待签名字符串 *************
    credential_scope = date + "/" + service + "/" + "tc3_request"
    hashed_canonical_request = hashlib.sha256(canonical_request.encode("utf-8")).hexdigest()
    string_to_sign = (algorithm + "\n" +
                      str(timestamp) + "\n" +
                      credential_scope + "\n" +
                      hashed_canonical_request)

    # ************* 步骤 3：计算签名 *************
    # 计算签名摘要函数
    def sign(key, msg):
        return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()

    secret_date = sign(("TC3" + secret_key).encode("utf-8"), date)
    secret_service = sign(secret_date, service)
    secret_signing = sign(secret_service, "tc3_request")
    signature = hmac.new(secret_signing, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()

    # ************* 步骤 4：拼接 Authorization *************
    authorization = (algorithm + " " +
                     "Credential=" + secret_id + "/" + credential_scope + ", " +
                     "SignedHeaders=" + signed_headers + ", " +
                     "Signature=" + signature)

    return {
        "url": endpoint,
        "headers": {
            "Authorization": authorization,
            "Content-Type": ct,
            "Host": host,
            "X-TC-Action": action,
            "X-TC-Timestamp": str(timestamp),
            "X-TC-Version": version,
            "X-TC-Region": regin,
        },
    }
