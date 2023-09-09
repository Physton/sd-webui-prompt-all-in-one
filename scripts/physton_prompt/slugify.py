import os
import sys
import time

current_dir = os.path.dirname(os.path.abspath(__file__))
cache_file = os.path.normpath(os.path.join(current_dir, '../../storage/slugify.cache'))
def read_caches():
    global cache_file
    try:
        result = {}
        if not os.path.exists(cache_file):
            with open(cache_file, 'w', encoding='utf8') as f:
                pass
        with open(cache_file, 'r', encoding='utf8') as f:
            content = f.read()

        lines = content.split("\n")
        result = {}
        for line in lines:
            if line.strip():
                key, value = line.split('====')
                key = key.strip()
                value = value.strip()
                if key:
                    result[key] = value
        return result
    except Exception as e:
        return []

def save_cache(results):
    global cache_file
    try:
        if not os.path.exists(cache_file):
            with open(cache_file, 'w', encoding='utf8') as f:
                pass

        content = ''
        for item in results:
            content += f'{item["text"]}===={item["result"]}\n'

        with open(cache_file, "a") as file:
            file.write(content)
    except Exception as e:
        pass

handling = False
def slugify(keywords):
    global handling
    if handling:
        while handling:
            time.sleep(0.1)
            pass
    handling = True
    results = __slugify(keywords)
    handling = False
    return results

def __slugify(keywords):
    global current_dir

    if not isinstance(keywords, list):
        return []

    if len(keywords) <= 0:
        return []

    # 去除 keywords 中的重复项
    keywords = list(set(keywords))

    results = {}
    cache = read_caches()
    keywords2 = []
    for keyword in keywords:
        if keyword in cache:
            results[keyword] = cache[keyword]
            continue
        else:
            keywords2.append(keyword)
    keywords = keywords2

    try:
        import execjs
        import threading

        code_file = os.path.normpath(os.path.join(current_dir, '../../slugify/dist/slugify.js'))
        if not os.path.exists(code_file):
            return results

        with open(code_file, 'r', encoding='utf8') as f:
            code = f.read()

        ctx = execjs.compile(code)

        threads_results = []
        def process_keywords(keywords):
            try:
                result = ctx.call('slugifyMulti', keywords)
                threads_results.extend(result)
            except Exception as e:
                print(f'[sd-webui-prompt-all-in-one] slugify error: {e}')

        def process_thread(keywords):
            thread = threading.Thread(target=process_keywords, args=(keywords,))
            thread.start()
            return thread

        threads = []
        for i in range(0, len(keywords), 10000):
            chunk = keywords[i:i+10000]
            thread = process_thread(chunk)
            threads.append(thread)
        for thread in threads:
            thread.join()

        for item in threads_results:
            results[item['text']] = item['result']
        save_cache(threads_results)

        return results

    except Exception as e:
        print(f'[sd-webui-prompt-all-in-one] slugify error: {e}')
        return {}