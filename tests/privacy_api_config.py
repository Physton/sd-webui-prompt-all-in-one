import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from scripts.physton_prompt.storage import Storage
from scripts.physton_prompt.get_translate_apis import privacy_translate_api_config, unprotected_translate_api_config
st = Storage()
key = 'translate_api.volcengine'
data = st.get(key)
data = privacy_translate_api_config(key, data)
print(data)
data = unprotected_translate_api_config(key, data)
print(data)

data = {
    'key': 'translate_api.volcengine',
    'data': {
        'access_key_id': 'AKLTYz*****************************************',
        'access_key_secret': 'TWpVNV******************************************************',
        'region': 'cn-north-1',
    }
}
data['data'] = unprotected_translate_api_config(data['key'], data['data'])
print(data)