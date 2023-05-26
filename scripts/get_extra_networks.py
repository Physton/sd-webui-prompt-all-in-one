# -*- coding: UTF-8 -*-

from modules import script_callbacks, extra_networks, prompt_parser, shared, ui_extra_networks
import json
import os

filters = [
    'filename',
    'description',
    'search_term',
    'local_preview',
    'metadata',
]

def get_extra_networks():
    result = []
    try:
        for extra_page in ui_extra_networks.extra_pages:
            resultItem = {
                'name': extra_page.name,
                'title': extra_page.title,
                'items': []
            }
            for item in extra_page.list_items():
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
                        if extra_page.name == 'textual inversion':
                            base, ext = os.path.splitext(item['filename'])
                            info_file = base + '.civitai.info'
                        else:
                            info_file = item['filename'] + '.civitai.info'
                        if os.path.isfile(info_file):
                            with open(info_file, 'r') as f:
                                info = json.load(f)
                                info = {
                                    'name': info.get('name', ''),
                                    'model': info.get('model', {}),
                                }
                                item['civitai_info'] = info
                except Exception as e:
                    pass

                # 过滤掉不需要的字段
                for filter in filters:
                    if filter in item:
                        del item[filter]

                resultItem['items'].append(item)

            result.append(resultItem)
    except Exception as e:
        pass
    return result
