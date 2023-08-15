import os

def get_group_tags(lang):
    current_dir = os.path.dirname(os.path.abspath(__file__))

    tags_file = os.path.join(current_dir, '../../group_tags/', 'custom.yaml')
    if not os.path.exists(tags_file):
        tags_file = os.path.join(current_dir, '../../group_tags/', lang + '.yaml')
        if not os.path.exists(tags_file):
            tags_file = os.path.join(current_dir, '../../group_tags/', 'default.yaml')
    if not os.path.exists(tags_file):
        return ''

    tags_file = os.path.normpath(tags_file)
    tags = ''
    try:
        with open(tags_file, 'r', encoding='utf8') as f:
            tags = f.read()
    except:
        pass
    return tags