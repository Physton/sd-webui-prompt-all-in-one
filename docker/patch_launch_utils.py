"""
Patch launch_utils.py so git_clone failures are non-fatal (print a warning
instead of crashing). Injects a safe wrapper that replaces the original symbol.
"""
import re

path = "/app/modules/launch_utils.py"
with open(path, "r") as f:
    src = f.read()

sig = "def git_clone(url, dir, name, commithash=None):"
if sig not in src:
    print("WARNING: Could not find git_clone – skipping patch")
    exit(0)

# The wrapper is inserted right after the git_clone function body.
# It captures the original via a default-argument trick to avoid recursion.
wrapper = '''

def _safe_git_clone(url, dir, name, commithash=None, _real=git_clone):
    """Non-fatal wrapper around git_clone for Docker environments."""
    try:
        _real(url, dir, name, commithash)
    except Exception as exc:
        print(f"[sd-webui-docker] WARNING: Could not clone {name} ({url}): {exc}")
        print("[sd-webui-docker] Continuing without this repository.")

git_clone = _safe_git_clone

'''

# Find where to inject: right before the next top-level def/class after git_clone
idx = src.index(sig)
rest = src[idx + len(sig):]
match = re.search(r'\ndef |\nclass ', rest)
if match:
    insert_pos = idx + len(sig) + match.start()
else:
    insert_pos = len(src)

src = src[:insert_pos] + wrapper + src[insert_pos:]

with open(path, "w") as f:
    f.write(src)

print("Successfully patched launch_utils.py")
