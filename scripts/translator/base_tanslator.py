from scripts.get_translate_apis import get_translate_apis
from abc import ABC, abstractmethod
from math import ceil
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import OrderedDict

class BaseTranslator(ABC):
    from_lang = None
    to_lang = None
    api = None
    api_config = {}
    api_item = {}

    def __init__(self, api):
        self.api = api
        apis = get_translate_apis()
        find = False
        for group in apis['apis']:
            for item in group['children']:
                if item['key'] == api:
                    find = item
                    break
        if not find:
            raise Exception('translate api not found')
        self.api_item = find

    def set_from_lang(self, from_lang):
        from_lang = self.api_item['support'].get(from_lang, False)
        if not from_lang:
            raise Exception('translate language not support')
        self.from_lang = from_lang
        return self

    def set_to_lang(self, to_lang):
        to_lang = self.api_item['support'].get(to_lang, False)
        if not to_lang:
            raise Exception('translate language not support')
        self.to_lang = to_lang
        return self

    def set_api_config(self, api_config):
        self.api_config = api_config
        return self

    def get_concurrent(self):
        concurrent = 1
        if self.api_item.get('concurrent', False):
            concurrent = self.api_item['concurrent']
        return concurrent

    @abstractmethod
    def translate(self, text):
        pass

    def translate_batch(self, texts):
        self.concurrent = self.get_concurrent()
        concurrent = self.get_concurrent()
        texts_len = len(texts)
        group_num = ceil(texts_len / concurrent)

        # 分组并发翻译，每组完成后等待1秒，然后再进行下一组
        results = []
        with ThreadPoolExecutor(max_workers=concurrent) as executor:
            for i in range(group_num):
                group_texts = texts[i*concurrent: (i+1)*concurrent]
                texts_dict = {}
                futures = []
                for i in range(len(group_texts)):
                    text = group_texts[i]
                    texts_dict[str(i)] = ''
                    future = executor.submit(self.translate, text)
                    futures.append(future)

                for i in range(len(futures)):
                    future = futures[i]
                    text_dict = texts_dict
                    future.result()
                    text_dict[str(i)] = future.result()

                for i in range(len(texts_dict)):
                    results.append(texts_dict[str(i)])

                time.sleep(1)

        return results
