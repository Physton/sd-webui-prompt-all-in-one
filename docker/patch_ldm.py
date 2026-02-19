"""
Patch the CompVis stable-diffusion v1 clone to add stubs for Stability-AI v2 modules
that AUTOMATIC1111 v1.10.x expects. CompVis v1 is missing these v2-specific additions.
"""
import os

BASE = "/app/repositories/stable-diffusion-stability-ai"


def write_file(rel_path, content):
    full = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    if not os.path.exists(full):
        with open(full, "w") as f:
            f.write(content)
        print(f"Created: {rel_path}")
    else:
        print(f"Skipped (exists): {rel_path}")


def append_to_file(rel_path, marker, content):
    """Append content to an existing file only if marker string not already present."""
    full = os.path.join(BASE, rel_path)
    if not os.path.exists(full):
        write_file(rel_path, content)
        return
    with open(full, "r") as f:
        text = f.read()
    if marker in text:
        print(f"Skipped (already patched): {rel_path}")
        return
    with open(full, "a") as f:
        f.write("\n\n# --- Added by patch_ldm.py for AUTOMATIC1111 compatibility ---\n")
        f.write(content)
        f.write("\n")
    print(f"Patched: {rel_path}")


# ── ldm/modules/midas ─────────────────────────────────────────────────────────
# AUTOMATIC1111 sd_models.py: `import ldm.modules.midas as midas`

write_file("ldm/modules/midas/__init__.py", "from . import api\n")

write_file("ldm/modules/midas/api.py", """\
import torch
import torch.nn as nn

# Stub dict — sd_models.py iterates this to register midas model paths
ISL_PATHS = {}


class RandomDepth:
    pass


class DPTDepthModel(nn.Module):
    def __init__(self, path=None, backbone="vitl16_384", non_negative=True, **kwargs):
        super().__init__()

    def forward(self, x):
        return x


class MiDaS_Large(DPTDepthModel):
    pass


class MiDaSInference(nn.Module):
    MODEL_TYPES_TORCH_HUB = ["DPT_Large", "DPT_Hybrid", "MiDaS_small"]
    MODEL_TYPES_ISL = []

    def __init__(self, model_type):
        super().__init__()

    def forward(self, x):
        return torch.zeros(x.shape[0], 1, x.shape[2], x.shape[3])


def load_model(model_type):
    return None, None
""")

# ── ldm/data/util.py ──────────────────────────────────────────────────────────
# AUTOMATIC1111 processing.py: `from ldm.data.util import AddMiDaS`

write_file("ldm/data/__init__.py", "")

append_to_file(
    "ldm/data/util.py",
    "AddMiDaS",
    """\
class AddMiDaS:
    \"\"\"Stub for MiDaS depth conditioning (used by depth-guided generation).\"\"\"
    def __init__(self, model_type="dpt_hybrid"):
        pass

    def __call__(self, sample):
        return sample
""",
)

# ── ldm/models/diffusion/ddpm.py ──────────────────────────────────────────────
# AUTOMATIC1111 processing.py:      `from ldm.models.diffusion.ddpm import LatentDepth2ImageDiffusion`
# AUTOMATIC1111 sd_models_types.py: `from ldm.models.diffusion.ddpm import LatentDiffusion`
# LatentDiffusion is already in CompVis v1; LatentDepth2ImageDiffusion is v2 only.

append_to_file(
    "ldm/models/diffusion/ddpm.py",
    "LatentDepth2ImageDiffusion",
    """\
class LatentDepth2ImageDiffusion(LatentDiffusion):
    \"\"\"Stub for depth-guided image generation (Stable Diffusion v2 feature).\"\"\"
    def __init__(self, *args, depth_stage_config=None, **kwargs):
        super().__init__(*args, **kwargs)
""",
)

# ── ldm/modules/attention.py ──────────────────────────────────────────────────
# AUTOMATIC1111 sd_hijack.py line 30:
#   ldm.modules.attention.BasicTransformerBlock.ATTENTION_MODES["softmax-xformers"] = ...
# CompVis v1 BasicTransformerBlock has no ATTENTION_MODES dict; v2 adds it.

append_to_file(
    "ldm/modules/attention.py",
    "ATTENTION_MODES",
    """\
# Add ATTENTION_MODES dict to BasicTransformerBlock so sd_hijack.py can patch it.
BasicTransformerBlock.ATTENTION_MODES = {"softmax": CrossAttention, "softmax-xformers": CrossAttention}
""",
)

# ── ldm/modules/encoders/modules.py ───────────────────────────────────────────
# AUTOMATIC1111 sd_hijack.py and sd_models.py import FrozenOpenCLIPEmbedder.
# CompVis v1 only has FrozenCLIPEmbedder (OpenAI CLIP); v2 adds open_clip variant.

append_to_file(
    "ldm/modules/encoders/modules.py",
    "FrozenOpenCLIPEmbedder",
    """\
class FrozenOpenCLIPEmbedder(AbstractEncoder):
    \"\"\"Stub for open_clip-based text embedder (Stable Diffusion v2 feature).\"\"\"
    LAYERS = ["last", "penultimate"]

    def __init__(self, arch="ViT-H-14", version="laion2b_s32b_b79k", device="cpu",
                 max_length=77, freeze=True, layer="last"):
        super().__init__()
        self.max_length = max_length

    def encode(self, text):
        return None

    def forward(self, text):
        return None, None

    def get_unconditional_conditioning(self, N):
        return None
""",
)

print("\nLDM stub patching complete.")
