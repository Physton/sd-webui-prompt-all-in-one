import launch

packages = {
    "chardet": "chardet",
    "fastapi": "fastapi",

    # The following packages are required for translation service. If you do not need translation service, you can remove them.
    # 以下是翻译所需的包，如果不需要翻译服务，可以删除掉它们。
    "translators": "translators",
    "openai": "openai",
    "boto3": "boto3",
    "aliyunsdkcore": "aliyun-python-sdk-core",
    "aliyunsdkalimt": "aliyun-python-sdk-alimt",
}

def get_packages_state():
    states = []
    for package_name in packages:
        package = packages[package_name]
        item = {
            'name': package_name,
            'package': package,
            'state': False
        }
        if launch.is_installed(package) or launch.is_installed(package_name):
            item['state'] = True

        states.append(item)

    return states

def install_package(name, package):
    result = {'state': False, 'message': ''}
    try:
        launch.run_pip(f"install {package}", f"sd-webui-prompt-all-in-one: {name}")
        result['state'] = True
        result['message'] = f'install {package} success!'
    except Exception as e:
        print(e)
        print(f'Warning: Failed to install {package}, some preprocessors may not work.')
        result['message'] = f'Error: install {package} failed!\n' + str(e)
    return result
