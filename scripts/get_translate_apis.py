import os
import json
# from scripts.storage import storage

translate_apis = {}
# st = storage()
def get_translate_apis(reload=False):
    global translate_apis
    global st
    if reload or not translate_apis:
        translate_apis = {}
        current_dir = os.path.dirname(os.path.abspath(__file__))
        config_file = os.path.join(current_dir, '../translate_apis.json')
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
