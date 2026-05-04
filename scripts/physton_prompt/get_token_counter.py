from modules import script_callbacks, extra_networks, prompt_parser, sd_models
from functools import partial, reduce

try:
    from modules.sd_hijack import model_hijack
    HAS_MODEL_HIJACK = True
except ModuleNotFoundError:
    model_hijack = None
    HAS_MODEL_HIJACK = False


def _get_prompt_lengths_forge(prompt, cond_stage_model):
    """
    Forge 下的 token 计数平替实现。
    优先使用 cond_stage_model 自带的 tokenize 方法，
    fallback 到 transformers CLIPTokenizer。
    """
    try:
        # Forge/ComfyUI 的 cond_stage_model 通常有 tokenize_line
        if hasattr(cond_stage_model, 'tokenize_line'):
            tokens, token_count, max_length = cond_stage_model.tokenize_line(prompt)
            return token_count, max_length

        # 部分版本用 tokenize
        if hasattr(cond_stage_model, 'tokenize'):
            result = cond_stage_model.tokenize([prompt])
            token_count = len(result[0])
            max_length = 75
            return token_count, max_length

    except Exception:
        pass

    # 终极 fallback：直接用 transformers CLIPTokenizer，不依赖任何 WebUI 内部实现
    try:
        from transformers import CLIPTokenizer
        tokenizer = CLIPTokenizer.from_pretrained("openai/clip-vit-large-patch14")
        tokens = tokenizer.tokenize(prompt)
        token_count = len(tokens)
        max_length = 75
        return token_count, max_length
    except Exception:
        pass

    return 0, 75


def get_token_counter(text, steps):
    # copy from modules.ui.py
    try:
        text, _ = extra_networks.parse_prompt(text)

        _, prompt_flat_list, _ = prompt_parser.get_multicond_prompt_list([text])
        prompt_schedules = prompt_parser.get_learned_conditioning_prompt_schedules(prompt_flat_list, steps)

    except Exception:
        # a parsing error can happen here during typing, and we don't want to bother the user with
        # messages related to it in console
        prompt_schedules = [[[steps, text]]]

    try:
        from modules_forge import forge_version
        forge = True
    except Exception:
        forge = False

    flat_prompts = reduce(lambda list1, list2: list1 + list2, prompt_schedules)
    prompts = [prompt_text for step, prompt_text in flat_prompts]

    if forge:
        cond_stage_model = sd_models.model_data.sd_model.cond_stage_model

        if HAS_MODEL_HIJACK:
            # model_hijack 意外存在时仍走原逻辑
            token_count, max_length = max(
                [model_hijack.get_prompt_lengths(prompt, cond_stage_model) for prompt in prompts],
                key=lambda args: args[0]
            )
        else:
            # Forge 标准路径：用平替实现
            token_count, max_length = max(
                [_get_prompt_lengths_forge(prompt, cond_stage_model) for prompt in prompts],
                key=lambda args: args[0]
            )
    else:
        # 原版 A1111 路径，不变
        token_count, max_length = max(
            [model_hijack.get_prompt_lengths(prompt) for prompt in prompts],
            key=lambda args: args[0]
        )

    return {"token_count": token_count, "max_length": max_length}
