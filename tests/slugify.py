import os
import sys
import csv
import yaml
import time
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from scripts.physton_prompt.slugify import slugify

keywords = []

csv_file = os.path.abspath('../tags/danbooru-10w-zh_cn.csv')
if os.path.exists(csv_file):
    with open(csv_file, 'r') as file:
        reader = csv.reader(file)
        for row in reader:
            if len(row) >= 2:
                keywords.append(row[1])

group_tags_file = os.path.abspath('../group_tags/zh_CN.yaml')
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

start_time = time.time()
print(f'Total count: {len(keywords)}')
print(f'Start time: {start_time}')
result = slugify(keywords)
end_time = time.time()
print(f'End time: {end_time}')
time_diff = end_time - start_time
print(f'{time_diff} s')