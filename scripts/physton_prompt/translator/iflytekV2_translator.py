from scripts.physton_prompt.translator.base_tanslator import BaseTranslator
from datetime import datetime
from wsgiref.handlers import format_date_time
from time import mktime
import hashlib
import base64
import hmac
from urllib.parse import urlencode
import json
import requests
from scripts.physton_prompt.get_lang import get_lang


class IflytekV2Translator(BaseTranslator):
    def __init__(self):
        super().__init__('iflytekV2')

    def translate(self, text):
        if not text:
            return ''
        app_id = self.api_config.get('app_id', '')
        if not app_id:
            raise Exception(get_lang('is_required', {'0': 'APP ID'}))
        api_secret = self.api_config.get('api_secret', '')
        if not api_secret:
            raise Exception(get_lang('is_required', {'0': 'API Secret'}))
        api_key = self.api_config.get('api_key', '')
        if not api_key:
            raise Exception(get_lang('is_required', {'0': 'API Key'}))

        response = translate(text, From=self.from_lang, To=self.to_lang, APPId=app_id, APISecret=api_secret, APIKey=api_key)
        if response.status_code != 200:
            raise Exception(get_lang('request_error', {'0': 'iflytekV1'}))
        if not response.text:
            raise Exception(get_lang('response_is_empty', {'0': 'iflytekV1'}))
        result = json.loads(response.content.decode())
        if 'header' not in result:
            raise Exception(get_lang('no_response_from', {'0': 'iflytekV1'}))
        result = json.loads(response.content.decode())
        if 'code' not in result['header']:
            raise Exception(get_lang('no_response_from', {'0': 'iflytekV1'}))
        if result['header']['code'] != 0:
            raise Exception(result['header']['message'])
        restul_decode = base64.b64decode(result['payload']['result']['text']).decode()
        result_json = json.loads(restul_decode)
        if 'trans_result' not in result_json:
            raise Exception(get_lang('no_response_from', {'0': 'iflytekV1'}))
        return result_json['trans_result']['dst']

class Url:
    def __init__(self, host, path, schema):
        self.host = host
        self.path = path
        self.schema = schema
        pass

# calculate sha256 and encode to base64
def sha256base64(data):
    sha256 = hashlib.sha256()
    sha256.update(data)
    digest = base64.b64encode(sha256.digest()).decode(encoding='utf-8')
    return digest

def parse_url(requset_url):
    stidx = requset_url.index("://")
    host = requset_url[stidx + 3:]
    schema = requset_url[:stidx + 3]
    edidx = host.index("/")
    if edidx <= 0:
        raise Exception("invalid request url:" + requset_url)
    path = host[edidx:]
    host = host[:edidx]
    u = Url(host, path, schema)
    return u

# build websocket auth request url
def assemble_ws_auth_url(requset_url, method="POST", api_key="", api_secret=""):
    u = parse_url(requset_url)
    host = u.host
    path = u.path
    now = datetime.now()
    date = format_date_time(mktime(now.timetuple()))
    signature_origin = "host: {}\ndate: {}\n{} {} HTTP/1.1".format(host, date, method, path)
    signature_sha = hmac.new(api_secret.encode('utf-8'), signature_origin.encode('utf-8'),
                             digestmod=hashlib.sha256).digest()
    signature_sha = base64.b64encode(signature_sha).decode(encoding='utf-8')
    authorization_origin = "api_key=\"%s\", algorithm=\"%s\", headers=\"%s\", signature=\"%s\"" % (
        api_key, "hmac-sha256", "host date request-line", signature_sha)
    authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode(encoding='utf-8')
    values = {
        "host": host,
        "date": date,
        "authorization": authorization
    }

    return requset_url + "?" + urlencode(values)

def translate(Text, From, To, APPId, APISecret, APIKey, Host="itrans.xf-yun.com"):
    RequestUri = "/v1/its"
    url="https://"+Host+RequestUri

    body = {
        "header": {
            "app_id": APPId,
            "status": 3,
        },
        "parameter": {
            "its": {
                "from": From,
                "to": To,
                "result": {}
            }
        },
        "payload": {
            "input_data": {
                "encoding": "utf8",
                "status": 3,
                "text": base64.b64encode(Text.encode("utf-8")).decode('utf-8')
            }
        }
    }

    request_url = assemble_ws_auth_url(url, "POST", APIKey, APISecret)

    headers = {'content-type': "application/json", 'host': 'itrans.xf-yun.com', 'app_id': APPId}
    # print(request_url)
    response = requests.post(request_url, data=json.dumps(body), headers=headers)
    return response
