from scripts.physton_prompt.translator.base_tanslator import BaseTranslator
from scripts.physton_prompt.get_lang import get_lang


class AmazonTranslator(BaseTranslator):
    def __init__(self):
        super().__init__('amazon')

    def translate(self, text):
        if not text:
            return ''
        api_key_id = self.api_config.get('api_key_id', '')
        api_key_secret = self.api_config.get('api_key_secret', '')
        region = self.api_config.get('region', '')
        if not api_key_id:
            raise Exception(get_lang('is_required', {'0': 'API Key ID'}))
        if not api_key_secret:
            raise Exception(get_lang('is_required', {'0': 'API Key Secret'}))
        if not region:
            raise Exception(get_lang('is_required', {'0': 'Region'}))

        import boto3
        translate = boto3.client(service_name='translate', region_name=region, use_ssl=True,
                                 aws_access_key_id=api_key_id, aws_secret_access_key=api_key_secret)
        result = translate.translate_text(Text=text, SourceLanguageCode=self.from_lang, TargetLanguageCode=self.to_lang)
        if 'TranslatedText' not in result:
            raise Exception(get_lang('no_response_from', {'0': 'Amazon'}))
        return result['TranslatedText']
