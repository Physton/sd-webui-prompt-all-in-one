import os

current_dir = os.path.dirname(os.path.abspath(__file__))

def _get_tags_filename(name):
    file = os.path.join(current_dir, '../../group_tags/', name + '.yaml')
    return file

def get_group_tags(lang):
    tags_file = _get_tags_filename('custom')
    is_exists = os.path.exists(tags_file)
    if is_exists:
        try:
            with open(tags_file, 'r', encoding='utf8') as f:
                data = f.read()
            is_exists = len(data.strip()) > 0
        except:
            is_exists = False

    if not is_exists:
        tags_file = _get_tags_filename(lang)
        if not os.path.exists(tags_file):
            tags_file = _get_tags_filename('default')
    if not os.path.exists(tags_file):
        return ''

    tags = ''

    try:
        prepend_file = _get_tags_filename('prepend')
        with open(prepend_file, 'r', encoding='utf8') as f:
            prepend = f.read()
        tags += prepend + "\n\n"
    except:
        pass

    try:
        with open(tags_file, 'r', encoding='utf8') as f:
            data = f.read()
        tags += data + "\n\n"
    except:
        pass

    try:
        append_file = _get_tags_filename('append')
        with open(append_file, 'r', encoding='utf8') as f:
            append = f.read()
        tags += append + "\n\n"
    except:
        pass

    return tags