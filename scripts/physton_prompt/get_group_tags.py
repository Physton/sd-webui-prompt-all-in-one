import os

current_dir = os.path.dirname(os.path.abspath(__file__))

def _get_tags_filename(name):
    file = os.path.join(current_dir, '../../group_tags/', name + '.yaml')
    return file

def get_group_tags(lang):
    tags_file = _get_tags_filename('custom')
    if not os.path.exists(tags_file):
        tags_file = _get_tags_filename(lang)
        if not os.path.exists(tags_file):
            tags_file = _get_tags_filename('default')
    if not os.path.exists(tags_file):
        return ''

    tags = ''
    try:
        with open(tags_file, 'r', encoding='utf8') as f:
            tags = f.read()
    except:
        pass

    try:
        append_file = _get_tags_filename('append')
        with open(append_file, 'r', encoding='utf8') as f:
            append = f.read()
        tags += "\n\n" + append
    except:
        pass

    return tags