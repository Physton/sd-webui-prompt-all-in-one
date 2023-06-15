import os
import json

i18n = {}


def get_i18n(reload=False):
    global i18n
    if reload or not i18n:
        i18n = {}
        current_dir = os.path.dirname(os.path.abspath(__file__))
        config_file = os.path.join(current_dir, '../../i18n.json')
        config_file = os.path.normpath(config_file)
        with open(config_file, 'r', encoding='utf8') as f:
            i18n = json.load(f)
    return i18n
