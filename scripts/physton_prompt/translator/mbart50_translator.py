from scripts.physton_prompt.translator.base_tanslator import BaseTranslator
from scripts.physton_prompt.get_lang import get_lang
from scripts.physton_prompt.mbart50 import initialize as mbart50_initialize, translate as mbart50_translate


class MBart50Translator(BaseTranslator):
    def __init__(self):
        super().__init__('mbart50')

    def translate(self, text):
        if not text:
            if isinstance(text, list):
                return []
            else:
                return ''

        result = mbart50_translate(text=text, src_lang=self.from_lang, target_lang=self.to_lang)
        if not result:
            raise Exception(get_lang('response_is_empty', {'0': 'mbart50'}))

        if isinstance(text, list):
            return result
        else:
            return result[0]

    def translate_batch(self, texts):
        return self.translate(texts)
