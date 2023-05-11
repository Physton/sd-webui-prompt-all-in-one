from scripts.get_translate_apis import get_translate_apis
import hashlib
import os
import requests
import uuid
import random
import json
import time

caches = {}

def translate_google(text, from_lang, to_lang, api_config):
    url = 'https://translation.googleapis.com/language/translate/v2/'
    api_key = api_config.get('api_key', '')
    if not api_key:
        raise Exception("api_key is required")
    params = {
        'key': api_key,
        'q': text,
        'source': from_lang,
        'target': to_lang,
        'format': 'text'
    }
    response = requests.get(url, params=params, timeout=10)
    result = response.json()
    if 'error' in result:
        raise Exception(result['error']['message'])
    return result['data']['translations'][0]['translatedText']

def translate_openai(text, from_lang, to_lang, api_config):
    import openai
    openai.api_key = api_config.get('api_key', '')
    model = api_config.get('model', 'gpt-3.5-turbo')
    if not openai.api_key:
        raise Exception("api_key is required")
    messages = [
        {"role": "system", "content": "You are a translator assistant."},
        {"role":
            "user",
            "content": f"You are a translator assistant. Please translate the following JSON data {to_lang}. Preserve the original format. Only return the translation result, without any additional content or annotations. If the prompt word is in the target language, please send it to me unchanged:\n{text}"
        },
    ]
    completion = openai.ChatCompletion.create(model=model, messages=messages, timeout=10)
    if len(completion.choices) == 0:
        raise Exception("No response from OpenAI")
    content = completion.choices[0].message.content
    return content

def translate_microsoft(text, from_lang, to_lang, api_config):
    url = 'https://api.cognitive.microsofttranslator.com/translate'
    api_key = api_config.get('api_key', '')
    region = api_config.get('region', '')
    if not api_key:
        raise Exception("api_key is required")
    if not region:
        raise Exception("region is required")
    params = {
        'api-version': '3.0',
        'from': from_lang,
        'to': to_lang
    }
    headers = {
        'Ocp-Apim-Subscription-Key': api_key,
        'Ocp-Apim-Subscription-Region': region,
        'Content-type': 'application/json',
        'X-ClientTraceId': str(uuid.uuid4())
    }
    body = [{
        'text': text
    }]
    response = requests.post(url, params=params, headers=headers, json=body, timeout=10)
    result = response.json()
    if 'error' in result:
        raise Exception(result['error']['message'])
    if len(result) == 0:
        raise Exception("No response from Microsoft")
    return result[0]['translations'][0]['text']

def translate_amazon(text, from_lang, to_lang, api_config):
    import boto3
    api_key_id = api_config.get('api_key_id', '')
    api_key_secret = api_config.get('api_key_secret', '')
    region = api_config.get('region', '')
    if not api_key_id:
        raise Exception("api_key_id is required")
    if not api_key_secret:
        raise Exception("api_key_secret is required")
    if not region:
        raise Exception("region is required")

    translate = boto3.client(service_name='translate', region_name=region, use_ssl=True, aws_access_key_id=api_key_id, aws_secret_access_key=api_key_secret)
    result = translate.translate_text(Text=text, SourceLanguageCode=from_lang, TargetLanguageCode=to_lang)
    if 'TranslatedText' not in result:
        raise Exception("No response from Amazon")
    return result['TranslatedText']

def translate_deepl(text, from_lang, to_lang, api_config):
    url = 'https://api-free.deepl.com/v2/translate'
    api_key = api_config.get('api_key', '')
    if not api_key:
        raise Exception("api_key is required")
    headers = {"Authorization": f"DeepL-Auth-Key {api_key}"}
    data = {
        'text': text,
        'source_lang': from_lang,
        'target_lang': to_lang
    }

    response = requests.post(url, headers=headers, data=data, timeout=10)
    result = response.json()
    if 'message' in result:
        raise Exception(result['message'])
    if 'translations' not in result:
        raise Exception("No response from DeepL")
    return result['translations'][0]['text']

def translate_baidu(text, from_lang, to_lang, api_config):
    url = "https://fanyi-api.baidu.com/api/trans/vip/translate"
    app_id = api_config.get('app_id', '')
    app_secret = api_config.get('app_secret', '')
    if not app_id:
        raise Exception("app_id is required")
    if not app_secret:
        raise Exception("app_secret is required")
    salt = random.randint(32768, 65536)
    sign = app_id + text + str(salt) + app_secret
    sign = hashlib.md5(sign.encode()).hexdigest()
    params = {
        'q': text,
        'from': from_lang,
        'to': to_lang,
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
    translated_text = ''
    for item in result['trans_result']:
        translated_text += "\n" + item['dst']
    return translated_text
    # return result['trans_result'][0]['dst']

def translate_youdao(text, from_lang, to_lang, api_config):
    url = "https://openapi.youdao.com/api"
    app_id = api_config.get('app_id', '')
    app_secret = api_config.get('app_secret', '')
    if not app_id:
        raise Exception("app_id is required")
    if not app_secret:
        raise Exception("app_secret is required")
    curtime = str(int(time.time()))
    salt = random.randint(32768, 65536)
    if(len(text) <= 20):
        input = text
    elif(len(text) > 20):
        input = text[:10] + str(len(text)) + text[-10:]
    sign = app_id + input + str(salt) + curtime + app_secret
    sign = hashlib.sha256(sign.encode()).hexdigest()
    params = {
        'q': text,
        'from': from_lang,
        'to': to_lang,
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
    return result['translation'][0]

def translate_alibaba(text, from_lang, to_lang, api_config):
    access_key_id = api_config.get('access_key_id', '')
    access_key_secret = api_config.get('access_key_secret', '')
    region = api_config.get('region', 'cn-shanghai')
    if not access_key_id:
        raise Exception("access_key_id is required")
    if not access_key_secret:
        raise Exception("access_key_secret is required")
    if not region:
        raise Exception("region is required")

    from aliyunsdkcore.client import AcsClient
    from aliyunsdkcore.acs_exception.exceptions import ClientException
    from aliyunsdkcore.acs_exception.exceptions import ServerException
    from aliyunsdkalimt.request.v20181012 import TranslateRequest

    client = AcsClient(access_key_id, access_key_secret, region)
    request = TranslateRequest.TranslateRequest()
    request.set_SourceLanguage(from_lang)
    request.set_Scene("general")
    request.set_SourceText(text)
    request.set_FormatType("text")  #翻译文本的格式
    request.set_TargetLanguage(to_lang)
    request.set_method("POST")
    response = client.do_action_with_exception(request)
    result = json.loads(response)
    if 'Code' not in result:
        raise Exception("No response from Alibaba")
    if result['Code'] != '200':
        raise Exception(result['Message'])
    return result['Data']['Translated']

def translate_tencent(text, from_lang, to_lang, api_config):
    secret_id = api_config.get('secret_id', '')
    secret_key = api_config.get('secret_key', '')
    region = api_config.get('region', 'ap-shanghai')
    if not secret_id:
        raise Exception("secret_id is required")
    if not secret_key:
        raise Exception("secret_key is required")
    if not region:
        raise Exception("region is required")

    from tencentcloud.tmt.v20180321 import models
    from tencentcloud.common import credential
    from tencentcloud.tmt.v20180321 import tmt_client

    request = models.TextTranslateRequest()
    request.SourceText = text
    request.Source = from_lang
    request.Target = to_lang
    request.ProjectId = 0
    cred = credential.Credential(secret_id, secret_key)
    client = tmt_client.TmtClient(cred, region)
    response = client.TextTranslate(request)
    result = json.loads(response.to_json_string())
    if 'Error' in result:
        raise Exception(result['Error']['Message'])
    if 'TargetText' not in result:
        raise Exception("No response from Tencent")
    return result['TargetText']


def translate(text, from_lang, to_lang, api, api_config = {}):
    global caches
    if from_lang == 'zh_CN' or from_lang == 'zh_TW' or to_lang == 'zh_CN' or to_lang == 'zh_TW':
        os.environ['translators_default_region'] = 'China'
    else:
        os.environ['translators_default_region'] = 'EN'
    result = {
        "success": False,
        "message": "",
        "text": text,
        "translated_text": "",
        "from_lang": from_lang,
        "to_lang": to_lang,
        "api": api,
        "api_config": api_config
    }
    try:
        apis = get_translate_apis()
        find = False
        for group in apis['apis']:
            for item in group['children']:
                if item['key'] == api:
                    find = item
                    break
        if not find:
            result['message'] = 'translate_api_not_found'
            return result

        # 检查语言是否支持
        from_lang = find['support'].get(from_lang, False)
        to_lang = find['support'].get(to_lang, False)
        if not from_lang or not to_lang:
            result['message'] = 'translate_language_not_support'
            return result

        cache_name = f'{api}.{from_lang}.{to_lang}.{text}.' + json.dumps(api_config)
        cache_name = hashlib.md5(cache_name.encode('utf-8')).hexdigest()
        if cache_name in caches:
                result['translated_text'] = caches[cache_name]
                result['success'] = True
                return result

        # print(find)
        if find['key'] == 'google':
            result['translated_text'] = translate_google(text, from_lang, to_lang, api_config)
        elif find['key'] == 'openai':
            result['translated_text'] = translate_openai(text, from_lang, to_lang, api_config)
        elif find['key'] == 'microsoft':
            result['translated_text'] = translate_microsoft(text, from_lang, to_lang, api_config)
        elif find['key'] == 'amazon':
            result['translated_text'] = translate_amazon(text, from_lang, to_lang, api_config)
        elif find['key'] == 'deepl':
            result['translated_text'] = translate_deepl(text, from_lang, to_lang, api_config)
        elif find['key'] == 'baidu':
            result['translated_text'] = translate_baidu(text, from_lang, to_lang, api_config)
        elif find['key'] == 'alibaba':
            result['translated_text'] = translate_alibaba(text, from_lang, to_lang, api_config)
        elif find['key'] == 'youdao':
            result['translated_text'] = translate_youdao(text, from_lang, to_lang, api_config)
        elif find['key'] == 'tencent':
            result['translated_text'] = translate_tencent(text, from_lang, to_lang, api_config)
        elif 'type' in find and find['type'] == 'translators':
            import translators as ts
            result['translated_text'] = ts.translate_text(text, from_language=from_lang, to_language=to_lang, translator=find['translator'], timeout=10)
        else:
            result['message'] = 'translate_api_not_support'
            return result

        result['translated_text'] = result['translated_text'].strip()

        caches[cache_name] = result['translated_text']
        result['success'] = True
        return result

    except Exception as e:
        # print(e)
        result['message'] = str(e)
        return result