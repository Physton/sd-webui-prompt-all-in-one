import os
from scripts.physton_prompt.get_lang import get_lang

model = None
tokenizer = None
model_name = "facebook/mbart-large-50-many-to-many-mmt"
cache_dir = os.path.normpath(os.path.dirname(os.path.abspath(__file__)) + '/../../models')
loading = False

def initialize(reload=False):
    global model, tokenizer, model_name, cache_dir, loading
    if loading:
        raise Exception(get_lang('model_is_loading'))
        return
    if not reload and model is not None:
        return
    loading = True
    from transformers import MBart50TokenizerFast, MBartForConditionalGeneration
    print(f'[sd-webui-prompt-all-in-one] Loading model {model_name} from {cache_dir}...')
    model = MBartForConditionalGeneration.from_pretrained(model_name, cache_dir=cache_dir)
    tokenizer = MBart50TokenizerFast.from_pretrained(model_name, cache_dir=cache_dir)
    print(f'[sd-webui-prompt-all-in-one] Model {model_name} loaded.')
    loading = False

def translate(text, src_lang, target_lang):
    global model, tokenizer

    if not text:
        if isinstance(text, list):
            return []
        else:
            return ''

    if model is None:
        raise Exception(get_lang('model_not_initialized'))

    if tokenizer is None:
        raise Exception(get_lang('model_not_initialized'))

    if src_lang == target_lang:
        return text

    tokenizer.src_lang = src_lang
    encoded_input = tokenizer(text, return_tensors="pt", padding=True)
    generated_tokens = model.generate(
        **encoded_input, forced_bos_token_id=tokenizer.lang_code_to_id[target_lang],
        max_new_tokens=500
    )
    return tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
