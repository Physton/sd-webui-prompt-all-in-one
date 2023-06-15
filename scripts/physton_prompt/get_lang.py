from scripts.physton_prompt.storage import Storage

storage = Storage()
from scripts.physton_prompt.get_i18n import get_i18n


def replace_vars(text, vars):
    for key, value in vars.items():
        text = text.replace("{" + key + "}", value)
    return text


def get_lang(key, vars={}):
    i18n = get_i18n()
    code = storage.get('languageCode')

    def find_lang(code):
        for item in i18n['languages']:
            if item['code'] == code:
                return True
        return False

    if not find_lang(code):
        code = i18n['default']

    if not find_lang(code):
        code = 'en_US'

    def find_key(key, code):
        for item in i18n['languages']:
            if item['code'] == code:
                if key in item['lang']:
                    if vars == {}:
                        return item['lang'][key]
                    else:
                        return replace_vars(item['lang'][key], vars)
        return False

    find = find_key(key, code)
    if find:
        return find

    find = find_key(key, 'en_US')
    if find:
        return find

    return replace_vars(key, vars)
