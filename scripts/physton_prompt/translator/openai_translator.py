from scripts.physton_prompt.translator.base_tanslator import BaseTranslator
import json
from scripts.physton_prompt.get_lang import get_lang


class OpenaiTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('openai')

    def translate(self, text):
        if not text:
            if isinstance(text, list):
                return []
            else:
                return ''
        import openai
        openai.api_base = self.api_config.get('api_base', 'https://api.openai.com/v1')
        openai.api_key = self.api_config.get('api_key', '')
        model = self.api_config.get('model', 'gpt-3.5-turbo')
        if not openai.api_key:
            raise Exception(get_lang('is_required', {'0': 'API Key'}))

        body = []
        if isinstance(text, list):
            for item in text:
                body.append({'text': item})
        else:
            body.append({'text': text})

        body_str = json.dumps(body, ensure_ascii=False)

        messages = [
            {"role": "system", "content": "You are a translator assistant."},
            {
                "role": "user",
                "content": f"You are a translator assistant. Please translate the following JSON data {self.to_lang}. Preserve the original format. Only return the translation result, without any additional content or annotations. If the prompt word is in the target language, please send it to me unchanged:\n{body_str}"
            },
        ]
        completion = openai.ChatCompletion.create(model=model, messages=messages, timeout=60)
        if len(completion.choices) == 0:
            raise Exception(get_lang('no_response_from', {'0': 'OpenAI'}))
        content = completion.choices[0].message.content
        try:
            # 找到第一个[，然后找到最后一个]，截取中间的内容
            start = content.index('[')
            end = content.rindex(']')
            if start == -1 or end == -1:
                raise Exception(get_lang('response_error', {'0': 'OpenAI'}))
            result_json = '[' + content[start + 1:end] + ']'
            # 解析json
            result = json.loads(result_json)
            if isinstance(text, list):
                return [item['text'] for item in result]
            else:
                return result[0]['text']
        except Exception as e:
            raise Exception(get_lang('response_error', {'0': 'OpenAI'}))

    def translate_batch(self, texts):
        return self.translate(texts)
