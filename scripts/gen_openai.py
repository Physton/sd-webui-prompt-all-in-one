def gen_openai(messages, api_config):
    import openai
    openai.api_base = api_config.get('api_base', 'https://api.openai.com/v1')
    openai.api_key = api_config.get('api_key', '')
    model = api_config.get('model', 'gpt-3.5-turbo')
    if not openai.api_key:
        raise Exception("api_key is required")
    if not messages or len(messages) == 0:
        raise Exception("messages is required")
    completion = openai.ChatCompletion.create(model=model, messages=messages, timeout=60)
    if len(completion.choices) == 0:
        raise Exception("No response from OpenAI")
    content = completion.choices[0].message.content
    return content
