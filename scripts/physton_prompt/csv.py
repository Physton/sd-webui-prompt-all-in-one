import os
from pathlib import Path

base_dir = str(Path().absolute())
dirs = [
    os.path.join(base_dir, 'extensions', 'sd-webui-prompt-all-in-one', 'tags'),
    os.path.join(base_dir, 'extensions', 'a1111-sd-webui-tagcomplete', 'tags'),
]


def get_csvs():
    global base_dir
    csvs = []
    for dir in dirs:
        if not os.path.exists(dir):
            continue
        for file in os.listdir(dir):
            if file.endswith('.csv'):
                path = os.path.join(dir, file)
                name = os.path.basename(file)
                size = os.path.getsize(path)
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
    path = base_dir + key
    if not os.path.exists(path):
        return None
    return path
