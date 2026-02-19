#!/bin/bash
set -e

echo "=== sd-webui-prompt-all-in-one Docker entrypoint ==="

REPOS="/app/repositories"

# Ensure a stub directory exists for the Stability-AI repo (which is inaccessible).
# The stub provides a minimal ldm package so Python imports don't crash.
SD_REPO="$REPOS/stable-diffusion-stability-ai"
if [ ! -d "$SD_REPO/.git" ]; then
    echo "[entrypoint] Creating stub for stable-diffusion repository..."
    mkdir -p "$SD_REPO"
    cd "$SD_REPO"
    git init -q
    git commit --allow-empty -q -m "stub"
    mkdir -p ldm/models/diffusion
    touch ldm/__init__.py ldm/models/__init__.py ldm/models/diffusion/__init__.py
    cat > ldm/util.py << 'PYEOF'
def instantiate_from_config(config):
    pass
PYEOF
    cd /app
fi

# Add all required repositories to PYTHONPATH so Python can find them.
# AUTOMATIC1111's paths.py adds the SD path and a few others, but not taming-transformers.
export PYTHONPATH="$REPOS/taming-transformers:$REPOS/stable-diffusion-stability-ai:$REPOS/BLIP:$REPOS/k-diffusion:${PYTHONPATH:-}"

echo "[entrypoint] PYTHONPATH=$PYTHONPATH"
echo "[entrypoint] Starting Stable Diffusion WebUI (with --skip-install; packages pre-installed in image)..."

exec python launch.py \
    --listen \
    --port 7860 \
    --skip-torch-cuda-test \
    --no-half \
    --use-cpu all \
    --disable-safe-unpickle \
    --skip-install \
    --no-download-sd-model
