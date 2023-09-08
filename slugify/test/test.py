import execjs
import execjs.runtime_names
import os
import sys
import csv
import yaml
import time
import threading

code = ''
code_file = os.path.abspath('../dist/slugify.js')
with open(code_file, 'r', encoding='utf8') as f:
    code = f.read()

keywords = []

csv_file = os.path.abspath('../../tags/danbooru-10w-zh_cn.csv')
if os.path.exists(csv_file):
    with open(csv_file, 'r') as file:
        reader = csv.reader(file)
        for row in reader:
            if len(row) >= 2:
                keywords.append(row[1])

group_tags_file = os.path.abspath('../../group_tags/zh_CN.yaml')
if os.path.exists(group_tags_file):
    with open(group_tags_file, 'r') as file:
        data = yaml.safe_load(file)
        for item in data:
            for group in item['groups']:
                tags = group.get('tags', {})
                for key in tags:
                    if not tags[key]:
                        continue
                    keywords.append(tags[key])

results = []
ctx = execjs.compile(code)
def process_keywords(keywords):
    result = ctx.call('slugifyMulti', keywords)
    results.extend(result)

def process_thread(keywords):
    thread = threading.Thread(target=process_keywords, args=(keywords,))
    thread.start()
    return thread

start_time = time.time()
print(f'Total count: {len(keywords)}')
print(f'Start time: {start_time}')

threads = []
for i in range(0, len(keywords), 10000):
    chunk = keywords[i:i+10000]
    thread = process_thread(chunk)
    threads.append(thread)
print(f'Threads num: {len(threads)}')

for thread in threads:
    thread.join()

end_time = time.time()
print(f'End time: {end_time}')
time_diff = end_time - start_time
print(f'{time_diff} s')