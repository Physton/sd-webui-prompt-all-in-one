import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
import time
import json
from scripts.physton_prompt.translate import translate
from scripts.physton_prompt.get_i18n import get_i18n
from scripts.physton_prompt.get_translate_apis import get_translate_apis
from scripts.physton_prompt.storage import Storage

i18n = get_i18n()
st = Storage()
text = 'Hello World, I am a boy'

tested_file = os.path.join(os.path.dirname(__file__), 'tested.json')
tested = []
if os.path.exists(tested_file):
    with open(tested_file, 'r') as f:
        tested = json.load(f)

def is_tested(api_key, from_lang, to_lang):
    for item in tested:
        if item['api'] == api_key and item['from'] == from_lang and item['to'] == to_lang:
            return item['translated_text']
    return False

def add_tested(api_key, from_lang, to_lang, translated_text):
    tested.append({
        'api': api_key,
        'from': from_lang,
        'to': to_lang,
        'translated_text': translated_text
    })
    with open(tested_file, 'w') as f:
        json.dump(tested, f, indent=4, ensure_ascii=False)

def test_api(api):
    print(f"开始测试 {api['name']}")
    config_name = 'translate_api.' + api['key']
    config = st.get(config_name)
    if not config:
        config = {}
    for lang_code in api['support']:
        if lang_code == 'en_US' or lang_code == 'en_GB':
            continue
        if not api['support'][lang_code]:
            continue
        if api['key'] == 'openai' or api['key'] == 'deepl':
            continue

        translated_text = is_tested(api['key'], 'en_US', lang_code)
        if not translated_text:
            print(f"  测试 en_US -> {lang_code}", end='  ')
            result = translate(text, from_lang='en_US', to_lang=lang_code, api=api['key'],api_config=config)
            if not result['success']:
                print(f"失败: {result['message']}")
                time.sleep(0.5)
                # raise Exception(f"测试 {api['name']} 失败：{result['message']}")
                continue
            add_tested(api['key'], 'en_US', lang_code, result['translated_text'])
            translated_text = result['translated_text']
            print(f"  结果: {translated_text}")
            time.sleep(0.5)

        if not is_tested(api['key'], lang_code, 'en_US'):
            print(f"  测试 {lang_code} -> en_US", end='  ')
            result = translate(translated_text, from_lang=lang_code, to_lang='en_US', api=api['key'],api_config=config)
            if not result['success']:
                print(f"失败: {result['message']}")
                time.sleep(0.5)
                # raise Exception(f"测试 {api['name']} 失败：{result['message']}")
                continue
            translated_text = result['translated_text']
            add_tested(api['key'], lang_code, 'en_US', translated_text)
            print(f"  结果: {translated_text}")
            time.sleep(0.5)

apis = get_translate_apis()
for group in apis['apis']:
    for api in group['children']:
        test_api(api)

