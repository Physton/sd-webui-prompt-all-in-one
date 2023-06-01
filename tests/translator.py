import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from scripts.translator.microsoft_translator import MicrosortTranslator
from scripts.translator.google_tanslator import GoogleTranslator
from scripts.translator.openai_translator import OpenaiTranslator
from scripts.translator.amazon_translator import AmazonTranslator
from scripts.translator.deepl_translator import DeeplTranslator
from scripts.translator.baidu_translator import BaiduTranslator

text = 'Hello World\ngirl'
texts = ['Hello World', 'girl', '[dog]', 'cat', 'car', 'apple', 'banana', 'orange', 'watermelon', 'pear', 'peach', 'grape', 'pineapple', 'strawberry', 'lemon', 'mango', 'cherry', 'coconut', 'kiwi', 'tomato', 'potato', 'onion', 'cucumber', 'carrot', 'broccoli', 'cabbage', 'lettuce', 'pepper', 'garlic', 'eggplant', 'mushroom', 'pea', 'corn', 'spinach', 'pumpkin', 'radish', 'beetroot', 'asparagus', 'celery', 'ginger', 'chili', 'cinnamon', 'nutmeg', 'clove', 'cardamom', 'cumin', 'coriander', 'turmeric', 'oregano', 'basil', 'rosemary', 'thyme', 'parsley', 'sage', 'dill', 'mint', 'lavender', 'marjoram', 'tarragon', 'chives', 'fennel', 'anise', 'leek', 'shallot', 'quince', '[nectarine]']

def test_google():
    translator = GoogleTranslator()
    translator.set_from_lang('en_US')
    translator.set_to_lang('zh_CN')
    translator.set_api_config({
        'api_key': 'AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw'
    })
    try:
        print(translator.translate(text))
        print(translator.translate_batch(texts))
    except Exception as e:
        print('error')
        print(e)

def test_microsoft():
    translator = MicrosortTranslator()
    translator.set_from_lang('en_US')
    translator.set_to_lang('zh_CN')
    translator.set_api_config({
        'api_key': '2383b70413b2419aa60fb21bbad63a84',
        'region': 'eastasia'
    })

    try:
        print(translator.translate(text))
        print(translator.translate_batch(texts))
    except Exception as e:
        print('error')
        print(e)

def test_openai():
    translator = OpenaiTranslator()
    translator.set_from_lang('en_US')
    translator.set_to_lang('zh_CN')
    translator.set_api_config({
        'api_key': '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',
        'model': 'gpt-3.5-turbo'
    })

    try:
        print(translator.translate(text))
        print(translator.translate_batch(texts))
    except Exception as e:
        print('error')
        print(e)

def test_amazon():
    translator = AmazonTranslator()
    translator.set_from_lang('en_US')
    translator.set_to_lang('zh_CN')
    translator.set_api_config({
        'api_key_id': 'AKIA2ZDKJB2V6UBZG2HM',
        'api_key_secret': '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',
        'region': 'us-east-1'
    })

    try:
        print(translator.translate(text))
        print(translator.translate_batch(texts))
    except Exception as e:
        print('error')
        print(e)

def test_deepl():
    translator = DeeplTranslator()
    translator.set_from_lang('en_US')
    translator.set_to_lang('zh_CN')
    translator.set_api_config({
        'api_key': 'c1e1c5e4-6a3e-8d5e-7c5b-6b3a0a0d5d5a'
    })

    try:
        print(translator.translate(text))
        # print(translator.translate_batch(texts))
    except Exception as e:
        print('error')
        print(e)

def test_baidu():
    translator = BaiduTranslator()
    translator.set_from_lang('en_US')
    translator.set_to_lang('zh_CN')
    translator.set_api_config({
        'app_id': '20201026000598825',
        'app_secret': 'h9mpr1QxQP1BGg3e39nq'
    })

    try:
        print(translator.translate(text))
        # print(translator.translate_batch(texts))
    except Exception as e:
        print('error')
        print(e)

test_baidu()