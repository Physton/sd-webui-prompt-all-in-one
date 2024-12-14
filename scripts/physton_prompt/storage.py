import os
import json
import time


class Storage:
    storage_path = ''

    def __init__():
        Storage.__dispose_all_locks()

    def __get_storage_path():
        Storage.storage_path = os.path.dirname(os.path.abspath(__file__)) + '/../../storage'
        Storage.storage_path = os.path.normpath(Storage.storage_path)
        if not os.path.exists(Storage.storage_path):
            os.makedirs(Storage.storage_path)

        # old_storage_path = os.path.join(Path().absolute(), 'physton-prompt')
        # if os.path.exists(old_storage_path):
        #     # 复制就的存储文件到新的存储文件夹
        #     for file in os.listdir(old_storage_path):
        #         old_file_path = os.path.join(old_storage_path, file)
        #         new_file_path = os.path.join(Storage.storage_path, file)
        #         if not os.path.exists(new_file_path):
        #             os.rename(old_file_path, new_file_path)
        #     # 删除旧的存储文件夹
        #     os.rmdir(old_storage_path)

        return Storage.storage_path

    def __get_data_filename(key):
        return Storage.__get_storage_path() + '/' + key + '.json'

    def __get_key_lock_filename(key):
        return Storage.__get_storage_path() + '/' + key + '.lock'

    def __dispose_all_locks():
        directory = Storage.__get_storage_path()
        for filename in os.listdir(directory):
            # 检查文件是否以指定后缀结尾
            if filename.endswith('.lock'):
                file_path = os.path.join(directory, filename)
                try:
                    os.remove(file_path)
                    print(f"Disposed lock: {file_path}")
                except Exception as e:
                    print(f"Dispose lock {file_path} failed: {e}")

    def __lock(key):
        file_path = Storage.__get_key_lock_filename(key)
        with open(file_path, 'w') as f:
            f.write('1')

    def __unlock(key):
        file_path = Storage.__get_key_lock_filename(key)
        if os.path.exists(file_path):
            os.remove(file_path)

    def __is_locked(key):
        file_path = Storage.__get_key_lock_filename(key)
        return os.path.exists(file_path)

    def __get(key):
        filename = Storage.__get_data_filename(key)
        if not os.path.exists(filename):
            return None
        if os.path.getsize(filename) == 0:
            return None
        try:
            import launch
            if not launch.is_installed("chardet"):
                with open(filename, 'r') as f:
                    data = json.load(f)
            else:
                import chardet
                with open(filename, 'rb') as f:
                    data = f.read()
                    encoding = chardet.detect(data).get('encoding')
                    data = json.loads(data.decode(encoding))
        except Exception as e:
            try:
                with open(filename, 'r') as f:
                    data = json.load(f)
            except Exception as e:
                print(e)
                return None
        return data

    def __set(key, data):
        file_path = Storage.__get_data_filename(key)
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=4, ensure_ascii=True)

    def set(key, data):
        while Storage.__is_locked(key):
            time.sleep(0.01)
        Storage.__lock(key)
        try:
            Storage.__set(key, data)
            Storage.__unlock(key)
        except Exception as e:
            Storage.__unlock(key)
            raise e

    def get(key):
        return Storage.__get(key)

    def delete(key):
        file_path = Storage.__get_data_filename(key)
        if os.path.exists(file_path):
            os.remove(file_path)

    def __get_list(key):
        data = Storage.get(key)
        if not data:
            data = []
        return data

    # 向列表中添加元素
    def list_push(key, item):
        while Storage.__is_locked(key):
            time.sleep(0.01)
        Storage.__lock(key)
        try:
            data = Storage.__get_list(key)
            data.append(item)
            Storage.__set(key, data)
            Storage.__unlock(key)
        except Exception as e:
            Storage.__unlock(key)
            raise e

    # 从列表中删除和返回最后一个元素
    def list_pop(key):
        while Storage.__is_locked(key):
            time.sleep(0.01)
        Storage.__lock(key)
        try:
            data = Storage.__get_list(key)
            item = data.pop()
            Storage.__set(key, data)
            Storage.__unlock(key)
            return item
        except Exception as e:
            Storage.__unlock(key)
            raise e

    # 从列表中删除和返回第一个元素
    def list_shift(key):
        while Storage.__is_locked(key):
            time.sleep(0.01)
        Storage.__lock(key)
        try:
            data = Storage.__get_list(key)
            item = data.pop(0)
            Storage.__set(key, data)
            Storage.__unlock(key)
            return item
        except Exception as e:
            Storage.__unlock(key)
            raise e

    # 从列表中删除指定元素
    def list_remove(key, index):
        while Storage.__is_locked(key):
            time.sleep(0.01)
        Storage.__lock(key)
        data = Storage.__get_list(key)
        data.pop(index)
        Storage.__set(key, data)
        Storage.__unlock(key)

    # 获取列表中指定位置的元素
    def list_get(key, index):
        data = Storage.__get_list(key)
        return data[index]

    # 清空列表中的所有元素
    def list_clear(key):
        while Storage.__is_locked(key):
            time.sleep(0.01)
        Storage.__lock(key)
        try:
            Storage.__set(key, [])
            Storage.__unlock(key)
        except Exception as e:
            Storage.__unlock(key)
            raise e
