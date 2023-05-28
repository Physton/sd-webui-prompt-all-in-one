from install import packages
import launch

def get_packages_state():
    states = []
    for package_name in packages:
        package = packages[package_name]
        item = {
            'name': package_name,
            'package': package,
            'state': False
        }
        if launch.is_installed(package_name):
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