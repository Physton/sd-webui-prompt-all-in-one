import launch

packages = {
    "chardet": "chardet",
    "fastapi": "fastapi",
    "execjs": "PyExecJS",
    "lxml": "lxml",
    "tqdm": "tqdm",
    "pathos": "pathos",
    "cryptography": "cryptography",

    # The following packages are required for translation service. If you do not need translation service, you can remove them.
    # 以下是翻译所需的包，如果不需要翻译服务，可以删除掉它们。
    "openai": "openai",
    "boto3": "boto3",
    "aliyunsdkcore": "aliyun-python-sdk-core",
    "aliyunsdkalimt": "aliyun-python-sdk-alimt",
}

if __name__ == "__main__":
    for package_name in packages:
        package = packages[package_name]
        try:
            if not launch.is_installed(package_name):
                launch.run_pip(f"install {package}", f"sd-webui-prompt-all-in-one: {package_name}")
        except Exception as e:
            print(e)
            print(f'Warning: Failed to install {package}, some preprocessors may not work.')