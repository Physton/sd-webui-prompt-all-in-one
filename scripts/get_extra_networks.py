from modules import script_callbacks, extra_networks, prompt_parser, shared, ui_extra_networks

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
                resultItem['items'].append(item)
            result.append(resultItem)
    except Exception as e:
        pass
    return result
