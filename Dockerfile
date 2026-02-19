FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    wget \
    curl \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Prevent git from prompting for credentials
ENV GIT_TERMINAL_PROMPT=0
RUN git config --global credential.helper "" \
    && git config --global core.askPass ""

# Install PyTorch CPU-only
RUN pip install --no-cache-dir \
    torch==2.5.1 \
    torchvision==0.20.1 \
    --index-url https://download.pytorch.org/whl/cpu

# Clone AUTOMATIC1111 stable-diffusion-webui
RUN git clone --depth 1 https://github.com/AUTOMATIC1111/stable-diffusion-webui.git /app

WORKDIR /app

# Copy extension into WebUI extensions directory
COPY . /app/extensions/sd-webui-prompt-all-in-one/

# Install packaging and other base tools needed by the WebUI setup
RUN pip install --no-cache-dir packaging GitPython requests

# Install extension Python dependencies
RUN pip install --no-cache-dir \
    chardet \
    PyExecJS \
    lxml \
    tqdm \
    pathos \
    cryptography \
    openai \
    boto3 \
    aliyun-python-sdk-core \
    aliyun-python-sdk-alimt

# Install OpenAI CLIP (needed by ldm/modules/encoders/modules.py)
RUN pip install --no-cache-dir openai-clip

# Pre-clone repos that are publicly accessible during Docker build.
# Full clones (no --depth 1) so AUTOMATIC1111 can checkout its specific pinned commit hashes.
RUN git clone https://github.com/crowsonkb/k-diffusion.git repositories/k-diffusion \
    || echo "WARNING: k-diffusion clone failed"

RUN git clone https://github.com/salesforce/BLIP.git repositories/BLIP \
    || echo "WARNING: BLIP clone failed"

RUN git clone https://github.com/sczhou/CodeFormer.git repositories/CodeFormer \
    || echo "WARNING: CodeFormer clone failed"

RUN git clone https://github.com/CompVis/taming-transformers.git repositories/taming-transformers \
    || echo "WARNING: taming-transformers clone failed"

# Try Stability-AI first (private, will fail), fall back to CompVis mirror (same ldm structure).
# Full clone so AUTOMATIC1111 can checkout its pinned commit hash.
RUN git clone https://github.com/Stability-AI/stablediffusion.git repositories/stable-diffusion-stability-ai \
    || git clone https://github.com/CompVis/stable-diffusion.git repositories/stable-diffusion-stability-ai \
    || echo "WARNING: stable-diffusion clone failed – stub will be created at startup"

# Pre-install AUTOMATIC1111's pinned requirements so --skip-install works at runtime
# (avoids slow/timing-out pip installs on every container start)
RUN pip install --no-cache-dir -r requirements_versions.txt || \
    echo "WARNING: Some requirements failed to install; container may still work"

# Patch ldm package: add missing Stability-AI v2 stubs to the CompVis v1 clone
# (AUTOMATIC1111 1.10.x expects v2 modules like ldm.modules.midas)
COPY docker/patch_ldm.py /tmp/patch_ldm.py
RUN python /tmp/patch_ldm.py

# Patch launch_utils.py so git_clone failures are warnings, not crashes
COPY docker/patch_launch_utils.py /tmp/patch_launch_utils.py
RUN python /tmp/patch_launch_utils.py

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create storage directory for the extension
RUN mkdir -p /app/extensions/sd-webui-prompt-all-in-one/storage

EXPOSE 7860

ENV SKIP_TORCH_VERSION_CHECK=1
ENV SKIP_PYTHON_VERSION_CHECK=1
ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["/entrypoint.sh"]
