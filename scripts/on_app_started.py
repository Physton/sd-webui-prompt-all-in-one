import gradio as gr
import os
from pathlib import Path
from modules import script_callbacks, extra_networks, prompt_parser
from fastapi import FastAPI, Body, Request, Response
from fastapi.responses import FileResponse
from scripts.storage import storage
from scripts.get_extensions import get_extensions
from scripts.get_token_counter import get_token_counter
from scripts.get_i18n import get_i18n
from scripts.get_translate_apis import get_translate_apis
from scripts.translate import translate
from scripts.history import history
from scripts.csv import get_csvs, get_csv
from scripts.styles import getStyleFullPath, getExtensionCssList
from scripts.get_extra_networks import get_extra_networks

VERSION = '0.0.1'

def on_app_started(_: gr.Blocks, app: FastAPI):
    st = storage()
    hi = history()

    @app.get("/physton_prompt/get_version")
    async def _get_version():
        return {"version": VERSION}

    @app.get("/physton_prompt/get_config")
    async def _get_config():
        return {
            'i18n': get_i18n(True),
            'translate_apis': get_translate_apis(True),
        }

    @app.get("/physton_prompt/get_extensions")
    async def _get_extensions():
        return {"extends": get_extensions()}

    @app.post("/physton_prompt/token_counter")
    async def _token_counter(request: Request):
        data = await request.json()
        if 'text' not in data or 'steps' not in data:
            return {"success": False, "message": "text or steps is required"}
        return get_token_counter(data['text'], data['steps'])

    @app.get("/physton_prompt/get_data")
    async def _get_data(key: str):
        return {"data": st.get(key)}

    @app.get("/physton_prompt/get_datas")
    async def _get_datas(keys: str):
        keys = keys.split(',')
        datas = {}
        for key in keys:
            datas[key] = st.get(key)
        return {"datas": datas}

    @app.post("/physton_prompt/set_data")
    async def _set_data(request: Request):
        data = await request.json()
        if 'key' not in data or 'data' not in data:
            return {"success": False, "message": "key or data is required"}
        st.set(data['key'], data['data'])
        return {"success": True}

    @app.post("/physton_prompt/set_datas")
    async def _set_datas(request: Request):
        data = await request.json()
        if not isinstance(data, dict):
            return {"success": False, "message": "data is not dict"}
        for key in data:
            st.set(key, data[key])
        return {"success": True}

    @app.get("/physton_prompt/get_data_list_item")
    async def _get_data_list_item(key: str, index: int):
        return {"item": st.list_get(key, index)}

    @app.post("/physton_prompt/push_data_list")
    async def _push_data_list(request: Request):
        data = await request.json()
        if 'key' not in data or 'item' not in data:
            return {"success": False, "message": "key or item is required"}
        st.list_push(data['key'], data['item'])
        return {"success": True}

    @app.post("/physton_prompt/pop_data_list")
    async def _pop_data_list(request: Request):
        data = await request.json()
        if 'key' not in data:
            return {"success": False, "message": "key is required"}
        return {"success": True, 'item': st.list_pop(data['key'])}

    @app.post("/physton_prompt/shift_data_list")
    async def _shift_data_list(request: Request):
        data = await request.json()
        if 'key' not in data:
            return {"success": False, "message": "key is required"}
        return {"success": True, 'item': st.list_shift(data['key'])}

    @app.post("/physton_prompt/remove_data_list")
    async def _remove_data_list(request: Request):
        data = await request.json()
        if 'key' not in data or 'index' not in data:
            return {"success": False, "message": "key or index is required"}
        st.list_remove(data['key'], data['index'])
        return {"success": True}

    @app.post("/physton_prompt/clear_data_list")
    async def _clear_data_list(request: Request):
        data = await request.json()
        if 'key' not in data:
            return {"success": False, "message": "key is required"}
        st.list_clear(data['key'])
        return {"success": True}

    @app.get("/physton_prompt/get_histories")
    async def _get_histories(type: str):
        return {"histories": hi.get_histoies(type)}

    @app.get("/physton_prompt/get_favorites")
    async def _get_favorites(type: str):
        return {"favorites": hi.get_favorites(type)}

    @app.post("/physton_prompt/push_history")
    async def _push_history(request: Request):
        data = await request.json()
        if 'type' not in data or 'tags' not in data or 'prompt' not in data:
            return {"success": False, "message": "type or tags or prompt is required"}
        hi.push_history(data['type'], data['tags'], data['prompt'], data.get('name', ''))
        return {"success": True}

    @app.post("/physton_prompt/push_favorite")
    async def _push_favorite(request: Request):
        data = await request.json()
        if 'type' not in data or 'tags' not in data or 'prompt' not in data:
            return {"success": False, "message": "type or tags or prompt is required"}
        hi.push_favorite(data['type'], data['tags'], data['prompt'], data.get('name', ''))
        return {"success": True}

    @app.get("/physton_prompt/get_latest_history")
    async def _get_latest_history(type: str):
        return {"history": hi.get_latest_history(type)}

    @app.post("/physton_prompt/set_history")
    async def _set_history(request: Request):
        data = await request.json()
        if 'type' not in data or 'id' not in data or 'tags' not in data or 'prompt' not in data or 'name' not in data:
            return {"success": False, "message": "type or id or tags or prompt is required"}
        return {"success": hi.set_history(data['type'], data['id'], data['tags'], data['prompt'], data['name'])}

    @app.post("/physton_prompt/set_history_name")
    async def _set_history_name(request: Request):
        data = await request.json()
        if 'type' not in data or 'id' not in data or 'name' not in data:
            return {"success": False, "message": "type or id or name is required"}
        return {"success": hi.set_history_name(data['type'], data['id'], data['name'])}

    @app.post("/physton_prompt/set_favorite_name")
    async def _set_favorite_name(request: Request):
        data = await request.json()
        if 'type' not in data or 'id' not in data or 'name' not in data:
            return {"success": False, "message": "type or id or name is required"}
        return {"success": hi.set_favorite_name(data['type'], data['id'], data['name'])}

    @app.post("/physton_prompt/dofavorite")
    async def _dofavorite(request: Request):
        data = await request.json()
        if 'type' not in data or 'id' not in data:
            return {"success": False, "message": "type or id is required"}
        return {"success": hi.dofavorite(data['type'], data['id'])}

    @app.post("/physton_prompt/unfavorite")
    async def _unfavorite(request: Request):
        data = await request.json()
        if 'type' not in data or 'id' not in data:
            return {"success": False, "message": "type or id is required"}
        return {"success": hi.unfavorite(data['type'], data['id'])}

    @app.post("/physton_prompt/delete_history")
    async def _delete_history(request: Request):
        data = await request.json()
        if 'type' not in data or 'id' not in data:
            return {"success": False, "message": "type or id is required"}
        return {"success": hi.remove_history(data['type'], data['id'])}

    @app.post("/physton_prompt/delete_histories")
    async def _delete_histories(request: Request):
        data = await request.json()
        if 'type' not in data:
            return {"success": False, "message": "type is required"}
        return {"success": hi.remove_histories(data['type'])}

    @app.post("/physton_prompt/translate")
    async def _translate(text: str = Body(...), from_lang: str = Body(...), to_lang: str = Body(...), api: str = Body(...), api_config: dict = Body(...)):
        return translate(text, from_lang, to_lang, api, api_config)
        return {"success": hi.remove_histories(data['type'])}

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
        file_path = getStyleFullPath(file)
        if not os.path.exists(file_path):
            return Response(status_code=404)
        return FileResponse(file_path, filename=os.path.basename(file_path))

    @app.get("/physton_prompt/get_extension_css_list")
    async def _get_extension_css_list():
        return {"css_list": getExtensionCssList()}

    @app.get("/physton_prompt/get_extra_networks")
    async def _get_extra_networks():
        return {"extra_networks": get_extra_networks()}

try:
    script_callbacks.on_app_started(on_app_started)
    print('sd-webui-prompt-all-in-one background API service started successfully.')
except Exception as e:
    print(f'sd-webui-prompt-all-in-one background API service failed to start: {e}')