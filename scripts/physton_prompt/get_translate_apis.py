import os
import json
import re
from scripts.physton_prompt.storage import Storage
st = Storage()

# from scripts.physton_prompt.storage import Storage

translate_apis = {}


# st = Storage()
def get_translate_apis(reload=False):
    global translate_apis
    global st
    if reload or not translate_apis:
        translate_apis = {}
        current_dir = os.path.dirname(os.path.abspath(__file__))
        config_file = os.path.join(current_dir, '../../translate_apis.json')
        config_file = os.path.normpath(config_file)
        with open(config_file, 'r', encoding='utf8') as f:
            translate_apis = json.load(f)

        # for group in translate_apis['apis']:
        #     for item in group['children']:
        #         if 'config' not in item:
        #             continue
        #         config_name = 'translate_api.' + item['key']
        #         config = st.get(config_name)
        #         if not config:
        #             config = {}
        #         for config_item in item['config']:
        #             if config_item['key'] in config:
        #                 config_item['value'] = config[config_item['key']]
        #             else:
        #                 if 'default' in config_item:
        #                     config_item['value'] = config_item['default']
        #                 else:
        #                     config_item['value'] = ''

    return translate_apis


def privacy_translate_api_config(data_key, data):
    # 如果 data 为空或者不是 dict
    if not data or not isinstance(data, dict):
        return data
    # 如果 data_key 是 translate_api. 开头
    api = None
    if data_key == 'chatgpt_key':
        api = 'openai'
    else:
        start = 'translate_api.'
        if not data_key.startswith(start):
            return data
        api = data_key[len(start):]
    apis = get_translate_apis()
    find = False
    for group in apis['apis']:
        for item in group['children']:
            if item['key'] == api:
                find = item
                break
    if not find:
        return data
    api_item = find
    if 'config' not in api_item or not api_item['config']:
        return data

    for config in api_item['config']:
        # 如果有 privacy 的属性并且为 True
        if 'privacy' in config and config['privacy'] and config['type'] == 'input':
            if config['key'] in data:
                # 前面6个字符可见，后面的字符用 * 替换
                value = data[config['key']]
                if len(value) > 6:
                    value = value[:6] + '*' * (len(value) - 6)
                data[config['key']] = value

    return data

def unprotected_translate_api_config(data_key, data):
    api = None
    if data_key == 'chatgpt_key':
        api = 'openai'
    else:
        start = 'translate_api.'
        if not data_key.startswith(start):
            return data
        api = data_key[len(start):]

    apis = get_translate_apis()
    find = False
    for group in apis['apis']:
        for item in group['children']:
            if item['key'] == api:
                find = item
                break
    if not find:
        return data
    api_item = find
    if 'config' not in api_item or not api_item['config']:
        return data

    storage_data = st.get(data_key)

    for config in api_item['config']:
        # 如果有 privacy 的属性并且为 True
        if 'privacy' in config and config['privacy'] and config['type'] == 'input':
            if storage_data and config['key'] in storage_data:
                if config['key'] in data:
                    value = data[config['key']]
                    # 如果包含 * 号，并且前面6个字符等于 storage_data 的前面6个字符
                    if '*' in value and value[:6] == storage_data[config['key']][:6]:
                        data[config['key']] = storage_data[config['key']]

                    # 多个 * 替换成一个 *
                    # value = re.sub(r'\*+', '*', value)
                    # if value == '*' and storage_data and config['key'] in storage_data:
                        # value = storage_data[config['key']]
                        # data[config['key']] = value

    return data