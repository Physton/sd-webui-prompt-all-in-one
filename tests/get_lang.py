import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from scripts.physton_prompt.get_lang import get_lang

print(get_lang('is_required', {'0': '11'}))
print(get_lang('is_required1'))