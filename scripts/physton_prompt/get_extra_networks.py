# -*- coding: UTF-8 -*-

from modules import script_callbacks, extra_networks, prompt_parser, shared, ui_extra_networks
import json
import os
import copy

filters = [
    # 'filename',
    # 'description',
    'search_term',
    'local_preview',
    'metadata',
]


def get_extra_networks():
    result = []
    try:
        for extra_page in ui_extra_networks.extra_pages:
            result_item = {
                'name': extra_page.name,
                'title': extra_page.title,
                'items': []
            }
            for oriItem in extra_page.list_items():
                item = copy.deepcopy(oriItem)
                # 解析metadata
                output_name = None
                try:
                    if 'metadata' in item and item['metadata']:
                        metadata = json.loads(item['metadata'])
                        if metadata and 'ss_output_name' in metadata:
                            output_name = metadata['ss_output_name']
                except Exception as e:
                    pass
                item['output_name'] = output_name

                # 获取civitai.info
                item['civitai_info'] = {}
                try:
                    if 'filename' in item and item['filename']:
                        item['basename'] = os.path.basename(item['filename'])
                        item['dirname'] = os.path.dirname(item['filename'])
                        base, ext = os.path.splitext(item['filename'])
                        info_file = base + '.civitai.info'
                        if not os.path.isfile(info_file):
                            info_file = item['filename'] + '.civitai.info'
                        if os.path.isfile(info_file):
                            with open(info_file, 'r') as f:
                                info = json.load(f)
                                images = info.get('images', [])
                                info = {
                                    'modelId': info.get('modelId', ''),
                                    'name': info.get('name', ''),
                                    'description': info.get('description', ''),
                                    'baseModel': info.get('baseModel', ''),
                                    'model': info.get('model', {}),
                                    'trainedWords': info.get('trainedWords', []),
                                    'images': [],
                                }
                                if images and len(images) > 0:
                                    for image in images:
                                        info['images'].append(image['url'])
                                item['civitai_info'] = info
                except Exception as e:
                    pass

                # 过滤掉不需要的字段
                for filter in filters:
                    if filter in item:
                        del item[filter]

                result_item['items'].append(item)

            result.append(result_item)
    except Exception as e:
        print(f'[sd-webui-prompt-all-in-one] get_extra_networks error: {e}')
        pass
    return result
