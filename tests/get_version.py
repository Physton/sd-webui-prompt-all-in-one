import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from scripts.physton_prompt.get_version import get_git_commit_version, get_git_remote_versions, get_latest_version

print(get_git_remote_versions())
print(get_git_commit_version())
print(get_latest_version())