import os
import re
import requests
import subprocess
import hashlib


def get_git_commit_version():
    extension_dir = os.path.dirname(os.path.abspath(__file__)) + '/../../'
    extension_dir = os.path.normpath(extension_dir)
    git_path = os.path.join(extension_dir, '.git')
    if os.path.exists(git_path):
        try:
            git = os.environ.get('GIT', "git")
            if not git:
                git = "git"
            cmd = [git, 'rev-parse', 'HEAD']
            commit_version = subprocess.check_output(cmd, cwd=extension_dir).decode('utf-8').strip()
            if re.match(r'^[0-9a-f]{40}$', commit_version):
                return commit_version
        except Exception as e:
            pass

        try:
            ref_path = os.path.join(git_path, 'refs', 'heads', 'main')
            with open(ref_path, 'r') as f:
                commit_version = f.read().strip()
                if re.match(r'^[0-9a-f]{40}$', commit_version):
                    return commit_version
        except Exception as e:
            pass

    return ''


def _handle_versions(response, filter_update_readme=False):
    try:
        if response.status_code != 200:
            return []
        result = response.json()
        if not result:
            return []
        versions = []
        for item in result:
            message = item['commit']['message']
            is_update_readme = False
            if message.lower().strip() == 'update readme.md':
                if filter_update_readme:
                    continue
                is_update_readme = True
            versions.append({
                'version': item['sha'],
                'message': message,
                'date': item['commit']['committer']['date'],
                'is_update_readme': is_update_readme
            })
        return versions
    except Exception as e:
        return []


def get_git_remote_versions(page=1, per_page=100, filter_update_readme=False):
    api_urls = [
        'https://api.github.com/repos/physton/sd-webui-prompt-all-in-one/commits',
        'https://gitee.com/api/v5/repos/physton/sd-webui-prompt-all-in-one/commits'
    ]

    for api_url in api_urls:
        try:
            api_url += f'?page={page}&per_page={per_page}'
            key = hashlib.md5(api_url.encode('utf-8')).hexdigest()
            response = requests.get(api_url)
            versions = _handle_versions(response, filter_update_readme)
            return versions
        except Exception as e:
            pass

    return []


def get_latest_version():
    current_version = get_git_commit_version()
    # if not current_version:
    # return current_version
    versions = get_git_remote_versions(1, 10, False)
    if len(versions) < 1:
        return current_version
    return versions[0]['version']
