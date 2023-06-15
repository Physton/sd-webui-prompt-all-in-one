import os
from pathlib import Path


def get_extensions():
    extends_dir = os.path.join(Path().absolute(), 'extensions')
    extends = []
    for name in os.listdir(extends_dir):
        path = os.path.join(extends_dir, name)
        if os.path.isdir(path):
            extends.append(name)
    return extends
