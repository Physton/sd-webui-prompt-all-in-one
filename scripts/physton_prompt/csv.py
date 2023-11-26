import os
from pathlib import Path

base_dir = str(Path().absolute())
self_base_dir = os.path.abspath(os.path.join(os.path.join(os.path.dirname(__file__)), '../', '../'))
self_tags_dir = os.path.join(self_base_dir, 'tags')
dirs = [
    self_tags_dir,
    # os.path.join(base_dir, 'extensions', 'sd-webui-prompt-all-in-one', 'tags'),
    os.path.join(base_dir, 'extensions', 'a1111-sd-webui-tagcomplete', 'tags'),
]


def get_csvs():
    global base_dir
    global self_base_dir
    global self_tags_dir
    csvs = []
    for dir in dirs:
        if not os.path.exists(dir):
            continue
        for file in os.listdir(dir):
            if file.endswith('.csv'):
                path = os.path.join(dir, file)
                name = os.path.basename(file)
                size = os.path.getsize(path)
                if dir == self_tags_dir:
                    # 去除 self_tags_dir 后的路径
                    key = path.replace(self_tags_dir, '')
                    key = '\\extensions\\sd-webui-prompt-all-in-one\\tags\\' + name
                else:
                    # 去除 base_dir 后的路径
                    key = path.replace(base_dir, '')
                csvs.append({
                    'key': key,
                    'name': name,
                    'size': size,
                    'path': path
                })
    return csvs


def get_csv(key):
    global base_dir
    global self_base_dir
    global self_tags_dir
    path = base_dir + key
    if not os.path.exists(path):
        path = os.path.join(self_tags_dir, key.replace('\\extensions\\sd-webui-prompt-all-in-one\\tags\\', ''))
        if not os.path.exists(path):
            return None
    return path
