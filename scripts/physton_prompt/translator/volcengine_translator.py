from scripts.physton_prompt.translator.base_tanslator import BaseTranslator
import datetime
import hashlib
import hmac
import requests
import json
from urllib.parse import quote
from scripts.physton_prompt.get_lang import get_lang


class VolcengineTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('volcengine')

    def translate(self, text):
        if not text:
            if isinstance(text, list):
                return []
            else:
                return ''
        url = 'https://open.volcengineapi.com'
        access_key_id = self.api_config.get('access_key_id', '')
        access_key_secret = self.api_config.get('access_key_secret', '')
        region = self.api_config.get('region', 'cn-north-1')
        if not access_key_id:
            raise Exception(get_lang('is_required', {'0': 'Access Key ID'}))
        if not access_key_secret:
            raise Exception(get_lang('is_required', {'0': 'Secret Access Key'}))

        if isinstance(text, list):
            texts = text
        else:
            texts = [text]

        body = {
            "TextList": texts,
            "SourceLanguage": self.from_lang,
            "TargetLanguage": self.to_lang,
        }
        response = request(access_key_id, access_key_secret, region, json.dumps(body))
        if not response.text:
            raise Exception(get_lang('response_is_empty', {'0': 'volcengine'}))
        result = response.json()
        if not result:
            raise Exception(get_lang('response_is_empty', {'0': 'volcengine'}))
        if 'ResponseMetaData' not in result:
            raise Exception(get_lang('response_is_empty', {'0': 'volcengine'}))
        if 'Error' in result['ResponseMetaData']:
            raise Exception(result['ResponseMetaData']['Error']['Message'])
        if 'Message' in result['ResponseMetaData']:
            raise Exception(result['ResponseMetadata']['Message'])
        if 'TranslationList' not in result or not result['TranslationList'] or len(result['TranslationList']) == 0:
            raise Exception(get_lang('no_response_from', {'0': 'volcengine'}))

        if isinstance(text, list):
            return [item['Translation'] for item in result['TranslationList']]
        else:
            return result['TranslationList'][0]['Translation']

    def translate_batch(self, texts):
        return self.translate(texts)


def norm_query(params):
    query = ""
    for key in sorted(params.keys()):
        if type(params[key]) == list:
            for k in params[key]:
                query = (
                        query + quote(key, safe="-_.~") + "=" + quote(k, safe="-_.~") + "&"
                )
        else:
            query = (query + quote(key, safe="-_.~") + "=" + quote(params[key], safe="-_.~") + "&")
    query = query[:-1]
    return query.replace("+", "%20")

def hmac_sha256(key: bytes, content: str):
    return hmac.new(key, content.encode("utf-8"), hashlib.sha256).digest()

def hash_sha256(content: str):
    return hashlib.sha256(content.encode("utf-8")).hexdigest()

def request(access_key_id, access_key_secret, region, body):
    service = "translate"
    date = datetime.datetime.utcnow()
    method = 'POST'
    host = "open.volcengineapi.com"
    contentType = "application/json"
    action = "TranslateText"
    version = "2020-06-01"

    query = {
        "Action": action,
        "Version": version,
    }
    header = {
        'Content-Type': contentType,
    }

    # 创建身份证明。其中的 Service 和 Region 字段是固定的。ak 和 sk 分别代表
    # AccessKeyID 和 SecretAccessKey。同时需要初始化签名结构体。一些签名计算时需要的属性也在这里处理。
    # 初始化身份证明结构体
    credential = {
        "access_key_id": access_key_id,
        "secret_access_key": access_key_secret,
        "service": service,
        "region": region,
    }
    # 初始化签名结构体
    request_param = {
        "body": body,
        "host": host,
        "path": "/",
        "method": method,
        "content_type": contentType,
        "date": date,
        "query": {"Action": action, "Version": version, **query},
    }
    if body is None:
        request_param["body"] = ""
    # 第四步：接下来开始计算签名。在计算签名前，先准备好用于接收签算结果的 signResult 变量，并设置一些参数。
    # 初始化签名结果的结构体
    x_date = request_param["date"].strftime("%Y%m%dT%H%M%SZ")
    short_x_date = x_date[:8]
    x_content_sha256 = hash_sha256(request_param["body"])
    sign_result = {
        "Host": request_param["host"],
        "X-Content-Sha256": x_content_sha256,
        "X-Date": x_date,
        "Content-Type": request_param["content_type"],
    }
    # 第五步：计算 Signature 签名。
    signed_headers_str = ";".join(
        ["content-type", "host", "x-content-sha256", "x-date"]
    )
    # signed_headers_str = signed_headers_str + ";x-security-token"
    canonical_request_str = "\n".join(
        [request_param["method"].upper(),
        request_param["path"],
        norm_query(request_param["query"]),
        "\n".join(
            [
                "content-type:" + request_param["content_type"],
                "host:" + request_param["host"],
                "x-content-sha256:" + x_content_sha256,
                "x-date:" + x_date,
            ]
        ),
        "",
        signed_headers_str,
        x_content_sha256,
        ]
    )

    # 打印正规化的请求用于调试比对
    # print(canonical_request_str)
    hashed_canonical_request = hash_sha256(canonical_request_str)

    # 打印hash值用于调试比对
    # print(hashed_canonical_request)
    credential_scope = "/".join([short_x_date, credential["region"], credential["service"], "request"])
    string_to_sign = "\n".join(["HMAC-SHA256", x_date, credential_scope, hashed_canonical_request])

    # 打印最终计算的签名字符串用于调试比对
    # print(string_to_sign)
    k_date = hmac_sha256(credential["secret_access_key"].encode("utf-8"), short_x_date)
    k_region = hmac_sha256(k_date, credential["region"])
    k_service = hmac_sha256(k_region, credential["service"])
    k_signing = hmac_sha256(k_service, "request")
    signature = hmac_sha256(k_signing, string_to_sign).hex()

    sign_result["Authorization"] = "HMAC-SHA256 Credential={}, SignedHeaders={}, Signature={}".format(
        credential["access_key_id"] + "/" + credential_scope,
        signed_headers_str,
        signature,
    )
    header = {**header, **sign_result}
    # header = {**header, **{"X-Security-Token": SessionToken}}
    # 第六步：将 Signature 签名写入 HTTP Header 中，并发送 HTTP 请求。
    r = requests.request(method=method,
                        url="https://{}{}".format(request_param["host"], request_param["path"]),
                        headers=header,
                        params=request_param["query"],
                        data=request_param["body"],
                        )
    return r
