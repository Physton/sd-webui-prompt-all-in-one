import os
from scripts.physton_prompt.storage import Storage

storage = Storage()

styles_path = os.path.dirname(os.path.abspath(__file__)) + '/../../styles'
styles_path = os.path.normpath(styles_path)


def get_style_full_path(file):
    global styles_path
    path = os.path.join(styles_path, file)
    path = os.path.abspath(path)
    path = os.path.normpath(path)
    if not os.path.exists(path):
        return None
    if styles_path not in path:
        return None
    return path


def get_extension_css_list():
    global styles_path
    extension_path = os.path.join(styles_path, 'extensions')
    if not os.path.exists(extension_path):
        return []
    css_list = []
    # 扫描下面的每个文件夹
    for dir in os.listdir(extension_path):
        dir_path = os.path.join(extension_path, dir)
        if not os.path.isdir(dir_path):
            continue

        # 是否有 manifest.json 文件
        manifest_path = os.path.join(dir_path, 'manifest.json')
        if not os.path.exists(manifest_path):
            continue

        # 是否有 style.min.css 文件
        style_path = os.path.join(dir_path, 'style.min.css')
        if not os.path.exists(style_path):
            continue

        manifest = None
        try:
            with open(manifest_path, 'r', encoding='utf8', errors='ignore') as f:
                manifest = f.read()
        except Exception as e:
            print(f'读取 {manifest_path} 失败：{e}')
            pass
        if not manifest:
            continue

        css_item = {
            'dir': dir,
            'dataName': 'extensionSelect.' + dir,
            'selected': False,
            'manifest': manifest,
            'style': f'extensions/{dir}/style.min.css',
        }
        css_item['selected'] = storage.get(css_item['dataName'])
        css_list.append(css_item)

    return css_list
