import gradio as gr
import os
import sys
from pathlib import Path
from modules import script_callbacks, extra_networks, prompt_parser
from fastapi import FastAPI, Body, Request, Response
from fastapi.responses import FileResponse
from scripts.physton_prompt.storage import Storage
from scripts.physton_prompt.get_extensions import get_extensions
from scripts.physton_prompt.get_token_counter import get_token_counter
from scripts.physton_prompt.get_i18n import get_i18n
from scripts.physton_prompt.get_translate_apis import get_translate_apis, privacy_translate_api_config, unprotected_translate_api_config
from scripts.physton_prompt.translate import translate
from scripts.physton_prompt.history import History
from scripts.physton_prompt.csv import get_csvs, get_csv
from scripts.physton_prompt.styles import get_style_full_path, get_extension_css_list
from scripts.physton_prompt.get_extra_networks import get_extra_networks
from scripts.physton_prompt.packages import get_packages_state, install_package
from scripts.physton_prompt.gen_openai import gen_openai
from scripts.physton_prompt.get_lang import get_lang
from scripts.physton_prompt.get_version import get_git_commit_version, get_git_remote_versions, get_latest_version
from scripts.physton_prompt.mbart50 import initialize as mbart50_initialize, translate as mbart50_translate
from scripts.physton_prompt.get_group_tags import get_group_tags

try:
    from modules.shared import cmd_opts

    if cmd_opts.data_dir:
        extension_dir = os.path.dirname(os.path.abspath(__file__)) + '/../'
        extension_dir = os.path.normpath(extension_dir) + os.path.sep
        data_dir = os.path.normpath(cmd_opts.data_dir) + os.path.sep
        webui_dir = os.path.normpath(Path().absolute()) + os.path.sep
        if not extension_dir.startswith(webui_dir):
            find = False
            if cmd_opts.gradio_allowed_path:
                for path in cmd_opts.gradio_allowed_path:
                    path = os.path.normpath(path) + os.path.sep
                    if path == extension_dir:
                        find = path
                        break
                    elif extension_dir.startswith(path):
                        find = path
                        break
                    else:
                        pass
            if not find:
                message = f'''
\033[1;31m[sd-webui-prompt-all-in-one]
As you have set the --data-dir parameter and have not added the extension path to the --gradio-allowed-path parameter, the extension may not function properly. Please add the following startup parameter:
由于你设置了 --data-dir 参数，并且没有将本扩展路径加入到 --gradio-allowed-path 参数中，所以本扩展可能无法正常运行。请添加启动参数：
\033[1;32m--gradio-allowed-path="{extension_dir}"
\033[0m
                '''
                print(message)
except Exception as e:
    pass


def on_app_started(_: gr.Blocks, app: FastAPI):
    st = Storage()
    hi = History()

    @app.get("/physton_prompt/get_version")
    async def _get_version():
        return {
            'version': get_git_commit_version(),
            'latest_version': get_latest_version(),
        }

    @app.get("/physton_prompt/get_remote_versions")
    async def _get_remote_versions(page: int = 1, per_page: int = 100):
        return {
            'versions': get_git_remote_versions(page, per_page),
        }

    @app.get("/physton_prompt/get_config")
    async def _get_config():
        return {
            'i18n': get_i18n(True),
            'translate_apis': get_translate_apis(True),
            'packages_state': get_packages_state(),
            'python': sys.executable,
        }

    @app.post("/physton_prompt/install_package")
    async def _install_package(request: Request):
        try:
            data = await request.json()
        except:
            data = {}
        if 'name' not in data:
            return {"result": get_lang('is_required', {'0': 'name'})}
        if 'package' not in data:
            return {"result": get_lang('is_required', {'0': 'package'})}
        return {"result": install_package(data['name'], data['package'])}

    @app.get("/physton_prompt/get_extensions")
    async def _get_extensions():
        return {"extends": get_extensions()}

    @app.post("/physton_prompt/token_counter")
    async def _token_counter(request: Request):
        data = await request.json()
        if 'text' not in data:
            return {"result": get_lang('is_required', {'0': 'text'})}
        if 'steps' not in data:
            return {"result": get_lang('is_required', {'0': 'steps'})}
        return get_token_counter(data['text'], data['steps'])

    @app.get("/physton_prompt/get_data")
    async def _get_data(key: str):
        data = st.get(key)
        data = privacy_translate_api_config(key, data)
        return {"data": data}

    @app.get("/physton_prompt/get_datas")
    async def _get_datas(keys: str):
        keys = keys.split(',')
        datas = {}
        for key in keys:
            datas[key] = st.get(key)
            datas[key] = privacy_translate_api_config(key, datas[key])
        return {"datas": datas}

    @app.post("/physton_prompt/set_data")
    async def _set_data(request: Request):
        data = await request.json()
        if 'key' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'key'})}
        if 'data' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'data'})}
        data['data'] = unprotected_translate_api_config(data['key'], data['data'])
        st.set(data['key'], data['data'])
        return {"success": True}

    @app.post("/physton_prompt/set_datas")
    async def _set_datas(request: Request):
        data = await request.json()
        if not isinstance(data, dict):
            return {"success": False, "message": get_lang('is_not_dict', {'0': 'data'})}
        for key in data:
            data[key] = unprotected_translate_api_config(key, data[key])
            st.set(key, data[key])
        return {"success": True}

    @app.get("/physton_prompt/get_data_list_item")
    async def _get_data_list_item(key: str, index: int):
        return {"item": st.list_get(key, index)}

    @app.post("/physton_prompt/push_data_list")
    async def _push_data_list(request: Request):
        data = await request.json()
        if 'key' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'key'})}
        if 'item' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'item'})}
        st.list_push(data['key'], data['item'])
        return {"success": True}

    @app.post("/physton_prompt/pop_data_list")
    async def _pop_data_list(request: Request):
        data = await request.json()
        if 'key' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'key'})}
        return {"success": True, 'item': st.list_pop(data['key'])}

    @app.post("/physton_prompt/shift_data_list")
    async def _shift_data_list(request: Request):
        data = await request.json()
        if 'key' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'key'})}
        return {"success": True, 'item': st.list_shift(data['key'])}

    @app.post("/physton_prompt/remove_data_list")
    async def _remove_data_list(request: Request):
        data = await request.json()
        if 'key' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'key'})}
        if 'index' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'index'})}
        st.list_remove(data['key'], data['index'])
        return {"success": True}

    @app.post("/physton_prompt/clear_data_list")
    async def _clear_data_list(request: Request):
        data = await request.json()
        if 'key' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'key'})}
        st.list_clear(data['key'])
        return {"success": True}

    @app.get("/physton_prompt/get_histories")
    async def _get_histories(type: str):
        return {"histories": hi.get_histories(type)}

    @app.get("/physton_prompt/get_favorites")
    async def _get_favorites(type: str):
        return {"favorites": hi.get_favorites(type)}

    @app.post("/physton_prompt/push_history")
    async def _push_history(request: Request):
        data = await request.json()
        if 'type' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'type'})}
        if 'tags' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'tags'})}
        if 'prompt' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'prompt'})}
        hi.push_history(data['type'], data['tags'], data['prompt'], data.get('name', ''))
        return {"success": True}

    @app.post("/physton_prompt/push_favorite")
    async def _push_favorite(request: Request):
        data = await request.json()
        if 'type' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'type'})}
        if 'tags' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'tags'})}
        if 'prompt' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'prompt'})}
        hi.push_favorite(data['type'], data['tags'], data['prompt'], data.get('name', ''))
        return {"success": True}

    @app.post("/physton_prompt/move_up_favorite")
    async def _move_up_favorite(request: Request):
        data = await request.json()
        if 'type' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'type'})}
        if 'id' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'id'})}
        return {"success": hi.move_up_favorite(data['type'], data['id'])}

    @app.post("/physton_prompt/move_down_favorite")
    async def _move_down_favorite(request: Request):
        data = await request.json()
        if 'type' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'type'})}
        if 'id' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'id'})}
        return {"success": hi.move_down_favorite(data['type'], data['id'])}

    @app.get("/physton_prompt/get_latest_history")
    async def _get_latest_history(type: str):
        return {"history": hi.get_latest_history(type)}

    @app.post("/physton_prompt/set_history")
    async def _set_history(request: Request):
        data = await request.json()
        if 'type' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'type'})}
        if 'id' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'id'})}
        if 'tags' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'tags'})}
        if 'prompt' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'prompt'})}
        if 'name' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'name'})}
        return {"success": hi.set_history(data['type'], data['id'], data['tags'], data['prompt'], data['name'])}

    @app.post("/physton_prompt/set_history_name")
    async def _set_history_name(request: Request):
        data = await request.json()
        if 'type' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'type'})}
        if 'id' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'id'})}
        if 'name' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'name'})}
        return {"success": hi.set_history_name(data['type'], data['id'], data['name'])}

    @app.post("/physton_prompt/set_favorite_name")
    async def _set_favorite_name(request: Request):
        data = await request.json()
        if 'type' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'type'})}
        if 'id' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'id'})}
        if 'name' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'name'})}
        return {"success": hi.set_favorite_name(data['type'], data['id'], data['name'])}

    @app.post("/physton_prompt/dofavorite")
    async def _dofavorite(request: Request):
        data = await request.json()
        if 'type' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'type'})}
        if 'id' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'id'})}
        return {"success": hi.dofavorite(data['type'], data['id'])}

    @app.post("/physton_prompt/unfavorite")
    async def _unfavorite(request: Request):
        data = await request.json()
        if 'type' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'type'})}
        if 'id' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'id'})}
        return {"success": hi.unfavorite(data['type'], data['id'])}

    @app.post("/physton_prompt/delete_history")
    async def _delete_history(request: Request):
        data = await request.json()
        if 'type' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'type'})}
        if 'id' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'id'})}
        return {"success": hi.remove_history(data['type'], data['id'])}

    @app.post("/physton_prompt/delete_histories")
    async def _delete_histories(request: Request):
        data = await request.json()
        if 'type' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'type'})}
        return {"success": hi.remove_histories(data['type'])}

    @app.post("/physton_prompt/translate")
    async def _translate(request: Request):
        data = await request.json()
        if 'text' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'text'})}
        if 'from_lang' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'from_lang'})}
        if 'to_lang' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'to_lang'})}
        if 'api' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'api'})}
        if 'api_config' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'api_config'})}
        return translate(data['text'], data['from_lang'], data['to_lang'], data['api'], data['api_config'])

    @app.post("/physton_prompt/translates")
    async def _translates(request: Request):
        data = await request.json()
        if 'texts' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'texts'})}
        if 'from_lang' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'from_lang'})}
        if 'to_lang' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'to_lang'})}
        if 'api' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'api'})}
        if 'api_config' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'api_config'})}
        return translate(data['texts'], data['from_lang'], data['to_lang'], data['api'], data['api_config'])

    @app.get("/physton_prompt/get_csvs")
    async def _get_csvs():
        return {"csvs": get_csvs()}

    @app.get("/physton_prompt/get_csv")
    async def _get_csv(key: str):
        file = get_csv(key)
        if not file:
            return Response(status_code=404)
        return FileResponse(file, media_type='text/csv', filename=os.path.basename(file))

    @app.get("/physton_prompt/styles")
    async def _styles(file: str):
        file_path = get_style_full_path(file)
        if not file_path or not os.path.exists(file_path):
            return Response(status_code=404)
        return FileResponse(file_path, filename=os.path.basename(file_path))

    @app.get("/physton_prompt/get_extension_css_list")
    async def _get_extension_css_list():
        return {"css_list": get_extension_css_list()}

    @app.get("/physton_prompt/get_extra_networks")
    async def _get_extra_networks():
        return {"extra_networks": get_extra_networks()}

    @app.post("/physton_prompt/gen_openai")
    async def _gen_openai(request: Request):
        data = await request.json()
        if 'messages' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'messages'})}
        if 'api_config' not in data:
            return {"success": False, "message": get_lang('is_required', {'0': 'api_config'})}
        try:
            return {"success": True, 'result': gen_openai(data['messages'], data['api_config'])}
        except Exception as e:
            return {"success": False, 'message': str(e)}

    @app.post("/physton_prompt/mbart50_initialize")
    async def _mbart50_initialize(request: Request):
        try:
            mbart50_initialize(True)
            return {"success": True}
        except Exception as e:
            return {"success": False, 'message': str(e)}

    @app.get("/physton_prompt/get_group_tags")
    async def _get_group_tags(lang: str):
        return {"tags": get_group_tags(lang)}

    try:
        translate_api = st.get('translateApi')
        if translate_api == 'mbart50':
            mbart50_initialize()
    except Exception:
        pass


try:
    script_callbacks.on_app_started(on_app_started)
    print('sd-webui-prompt-all-in-one background API service started successfully.')
except Exception as e:
    print(f'sd-webui-prompt-all-in-one background API service failed to start: {e}')
