import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

region = 'CN'
os.environ['translators_default_region'] = region
from scripts.physton_prompt.translators.server import translate_text, tss
tss.server_region = region
tss._bing.server_region = region
tss._google.server_region = region

text = '''
Hi, this extension is developed by Physton. Welcome to use it!
If you have any suggestions or opinions, please feel free to raise an issue or PR on Github.
If you find this extension helpful, please give me a star on Github!

Developed by: Physton
Github: Physton/sd-webui-prompt-all-in-one
'''
translator = 'alibaba'
print("--------------------------------------")
print(translate_text(text, translator, 'zh', 'en'))

print("--------------------------------------")
print(translate_text('你好', translator, 'zh', 'en'))

print("--------------------------------------")
print(translate_text('女孩', translator, 'zh', 'en'))

print("--------------------------------------")
print(translate_text('美女', translator, 'zh', 'en'))