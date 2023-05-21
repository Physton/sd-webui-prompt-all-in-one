import os
from scripts.storage import storage
storage = storage()

styles_path = os.path.dirname(os.path.abspath(__file__)) + '/../styles'
styles_path = os.path.normpath(styles_path)

def getStyleFullPath(file):
    global styles_path
    return os.path.join(styles_path, file)

def getExtensionCssList():
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
