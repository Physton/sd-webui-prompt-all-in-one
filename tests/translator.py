import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from scripts.physton_prompt.translator.microsoft_translator import MicrosoftTranslator
from scripts.physton_prompt.translator.google_tanslator import GoogleTranslator
from scripts.physton_prompt.translator.openai_translator import OpenaiTranslator
from scripts.physton_prompt.translator.amazon_translator import AmazonTranslator
from scripts.physton_prompt.translator.deepl_translator import DeeplTranslator
from scripts.physton_prompt.translator.baidu_translator import BaiduTranslator
from scripts.physton_prompt.translator.youdao_translator import YoudaoTranslator
from scripts.physton_prompt.translator.alibaba_translator import AlibabaTranslator
from scripts.physton_prompt.translator.tencent_translator import TencentTranslator
from scripts.physton_prompt.translator.translators_translator import TranslatorsTranslator
from scripts.physton_prompt.translator.yandex_translator import YandexTranslator
from scripts.physton_prompt.translator.mymemory_translator import MyMemoryTranslator
from scripts.physton_prompt.translator.niutrans_translator import NiutransTranslator

from scripts.physton_prompt.translate import translate
from scripts.physton_prompt.get_i18n import get_i18n

text = 'project'
texts = [
    'Hello World',
    '1 girl', '2 girl', '3 girl', '4 girl', '5 girl',
    '1 dog', '2 dog', '3 dog', '4 dog', '5 dog',
    '1 cat', '2 cat', '3 cat', '4 cat', '5 cat',
    '1 car', '2 car', '3 car', '4 car', '5 car',
    '1 apple', '2 apple', '3 apple', '4 apple', '5 apple',
    '1 banana', '2 banana', '3 banana', '4 banana', '5 banana',
    '1 orange', '2 orange', '3 orange', '4 orange', '5 orange',
    '1 watermelon', '2 watermelon', '3 watermelon', '4 watermelon', '5 watermelon',
    '1 pear', '2 pear', '3 pear', '4 pear', '5 pear',
    '1 peach', '2 peach', '3 peach', '4 peach', '5 peach',
    '1 grape', '2 grape', '3 grape', '4 grape', '5 grape',
    '1 pineapple', '2 pineapple', '3 pineapple', '4 pineapple', '5 pineapple',
]

def test_google():
    api_config = {
        'api_key': os.getenv('GOOGLE_API_KEY')
    }
    print(translate(text, 'en_US', 'zh_CN', 'google', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'google', api_config))

def test_microsoft():
    api_config = {
        'api_key': os.getenv('MICROSOFT_API_KEY'),
        'region': 'eastasia'
    }
    print(translate(text, 'en_US', 'zh_CN', 'microsoft', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'microsoft', api_config))

def test_openai():
    api_config = {
        'api_base': os.getenv('OPENAI_API_BASE'),
        'api_key': os.getenv('OPENAI_API_KEY'),
        'model': 'gpt-3.5-turbo'
    }
    print(translate(text, 'en_US', 'zh_CN', 'openai', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'openai', api_config))

def test_amazon():
    api_config = {
        'api_key_id': os.getenv('AMAZON_API_KEY_ID'),
        'api_key_secret': os.getenv('AMAZON_API_KEY_SECRET'),
        'region': 'us-east-1'
    }
    print(translate(text, 'en_US', 'zh_CN', 'amazon', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'amazon', api_config))

def test_deepl():
    api_config = {
        'api_key': os.getenv('DEEPL_API_KEY')
    }
    print(translate(text, 'en_US', 'zh_CN', 'deepl', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'deepl', api_config))

def test_baidu():
    api_config = {
        'app_id': os.getenv('BAIDU_APP_ID'),
        'app_secret': os.getenv('BAIDU_APP_SECRET')
    }
    print(translate(text, 'en_US', 'zh_CN', 'baidu', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'baidu', api_config))

def test_youdao():
    api_config = {
        'app_id': os.getenv('YOUDAO_APP_ID'),
        'app_secret': os.getenv('YOUDAO_APP_SECRET')
    }
    print(translate(text, 'en_US', 'zh_CN', 'youdao', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'youdao', api_config))

def test_alibaba():
    api_config = {
        'access_key_id': os.getenv('ALIBABA_ACCESS_KEY_ID'),
        'access_key_secret': os.getenv('ALIBABA_ACCESS_KEY_SECRET'),
    }
    print(translate(text, 'en_US', 'zh_CN', 'alibaba', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'alibaba', api_config))

def test_tencent():
    api_config = {
        'secret_id': os.getenv('TENCENT_SECRET_ID'),
        'secret_key': os.getenv('TENCENT_SECRET_KEY'),
        'region': 'ap-shanghai'
    }
    print(translate(text, 'en_US', 'zh_CN', 'tencent', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'tencent', api_config))

def test_translators():
    print(translate(text, 'en_US', 'zh_CN', 'alibaba_free', {'region': 'EN'}))
    print(translate(texts, 'en_US', 'zh_CN', 'alibaba_free', {'region': 'EN'}))

def test_yandex():
    api_config = {
        'api_key': os.getenv('YANDEX_API_KEY'),
    }
    print(translate(text, 'en_US', 'zh_CN', 'yandex', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'yandex', api_config))

def test_mymemory():
    api_config = {
        'api_key': os.getenv('MYMEMORY_API_KEY'),
    }
    print(translate(text, 'en_US', 'zh_TW', 'myMemory_free', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'myMemory_free', api_config))

def test_niutrans():
    api_config = {
        'api_key': os.getenv('NIUTRANS_API_KEY')
    }
    print(translate(text, 'en_US', 'zh_TW', 'niutrans', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'niutrans', api_config))

def test_caiyun():
    api_config = {
        'token': os.getenv('CAIYUN_TOKEN')
    }
    print(translate(text, 'en_US', 'zh_CN', 'caiyun', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'caiyun', api_config))


def test_volcengine():
    api_config = {
        'access_key_id': os.getenv('VOLCENGINE_ACCESS_KEY_ID'),
        'access_key_secret': os.getenv('VOLCENGINE_ACCESS_KEY_SECRET'),
    }
    print(translate(text, 'en_US', 'zh_TW', 'volcengine', api_config))
    print(translate(texts, 'en_US', 'zh_TW', 'volcengine', api_config))

def test_iflytekV1():
    api_config = {
        'app_id': os.getenv('IFLYTEK_APP_ID'),
        'api_secret': os.getenv('IFLYTEK_API_SECRET'),
        'api_key': os.getenv('IFLYTEK_API_KEY'),
    }
    print(translate(text, 'en_US', 'zh_CN', 'iflytekV1', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'iflytekV1', api_config))

def test_iflytekV2():
    api_config = {
        'app_id': os.getenv('IFLYTEK_APP_ID'),
        'api_secret': os.getenv('IFLYTEK_API_SECRET'),
        'api_key': os.getenv('IFLYTEK_API_KEY'),
    }
    print(translate(text, 'en_US', 'zh_CN', 'iflytekV2', api_config))
    print(translate(texts, 'en_US', 'zh_CN', 'iflytekV2', api_config))

def test_languages():
    i18n = get_i18n()
    languages = []
    for item in i18n['languages']:
        if item['code'] == 'en_US':
            continue
        languages.append(item['code'])

    for lang in languages:
        print(f'lang: {lang} => ')
        print(translate(text, 'en_US', lang, 'myMemory_free'))
        pass

test_translators()
