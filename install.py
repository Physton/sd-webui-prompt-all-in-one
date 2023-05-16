import launch

packages = {
    "chardet": "chardet",
    "translators": "translators",
    "fastapi": "fastapi",
    "hashlib": "hashlib",
    "openai": "openai",
    "boto3": "boto3",
    "aliyunsdkcore": "aliyun-python-sdk-core",
    "aliyunsdkalimt": "aliyun-python-sdk-alimt",
    "tencentcloud": "tencentcloud-sdk-python",
}

for package_name in packages:
    package = packages[package_name]
    try:
        if not launch.is_installed(package_name):
            launch.run_pip(f"install {package}", f"sd-webui-prompt-all-in-one: {package_name}")
    except Exception as e:
        print(e)
        print(f'Warning: Failed to install {package}, some preprocessors may not work.')