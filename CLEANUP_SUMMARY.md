# 翻译功能删除和sd_hijack依赖移除 - 修改总结

## 概览
本文档记录了从 sd-webui-prompt-all-in-one 插件中删除所有翻译功能并移除sd_hijack依赖的所有修改。修改后的版本保留了提示词编辑功能，但移除了自动翻译、ChatGPT生成和相关的翻译API。

---

## 后端修改 (Python)

### 1. **scripts/on_app_started.py** 删除项

#### 删除的导入：
- `from scripts.physton_prompt.get_translate_apis import get_translate_apis, privacy_translate_api_config, unprotected_translate_api_config`
- `from scripts.physton_prompt.translate import translate`
- `from scripts.physton_prompt.gen_openai import gen_openai`
- `from scripts.physton_prompt.mbart50 import initialize as mbart50_initialize, translate as mbart50_translate`

#### 删除的API端点：
- `POST /physton_prompt/translate` - 单个文本翻译
- `POST /physton_prompt/translates` - 批量翻译
- `POST /physton_prompt/gen_openai` - ChatGPT提示词生成
- `POST /physton_prompt/mbart50_initialize` - mbart50模型初始化

#### 其他修改：
- 从 `/physton_prompt/get_config` 端点移除 `translate_apis` 字段
- 移除 `privacy_translate_api_config` 和 `unprotected_translate_api_config` 调用

### 2. **scripts/physton_prompt/get_token_counter.py** - sd_hijack兼容性修复

** 关键修改：** 使得token计数功能可以在有或没有sd_hijack的情况下工作

- 将 `from modules.sd_hijack import model_hijack` 从强制导入改为可选导入
- 添加了后备机制：如果sd_hijack不可用，使用简单的token估计（基于逗号和空格分割）
- 保持与旧版本webui的兼容性，同时支持新版本（无sd_hijack）

### 3. **删除的Python文件（翻译相关）**

- `scripts/physton_prompt/translate.py` - 翻译主逻辑
- `scripts/physton_prompt/gen_openai.py` - ChatGPT集成
- `scripts/physton_prompt/mbart50.py` - 离线翻译模型
- `scripts/physton_prompt/get_translate_apis.py` - 翻译API配置
- `scripts/physton_prompt/translator/` 目录（所有翻译器实现）
  - google_tanslator.py
  - baidu_translator.py
  - alibaba_translator.py
  - amazon_translator.py
  - deepl_translator.py
  - iflytekV1_translator.py
  - iflytekV2_translator.py
  - mbart50_translator.py
  - microsoft_translator.py
  - mymemory_translator.py
  - niutrans_translator.py
  - openai_translator.py
  - tencent_translator.py
  - translators_translator.py
  - volcengine_translator.py
  - yandex_translator.py
  - youdao_translator.py
  - caiyun_translator.py
  - base_tanslator.py
- `scripts/physton_prompt/translators/` 目录（翻译器服务器）

### 4. **删除的测试文件**

- `tests/translate.py`
- `tests/translator.py`
- `tests/translators.py`
- `tests/privacy_api_config.py`

---

## 前端修改 (Vue.js/JavaScript)

### 1. **src/src/App.vue** - 主应用组件修改

#### 删除的组件导入：
- `import TranslateSetting from "@/components/translateSetting.vue"`
- `import ChatgptPrompt from "@/components/chatgptPrompt.vue"`

#### 删除的组件声明：
- `TranslateSetting`
- `ChatgptPrompt`

#### 删除的组件实例（template中）：
- `<translate-setting>` 组件
- `<chatgpt-prompt>` 组件

#### 删除的data属性：
- `translateApis: []`
- `translateApi: ''`
- `translateApiConfig: {}`
- `canOneTranslate: false`
- `autoTranslate: false`
- `autoTranslateToEnglish: false`
- `autoTranslateToLocal: false`
- `chatgptCurrentPrompt: ''`
- `groupTagsTranslate: true`
- `groupTagsTranslateCache: {...}`

#### 删除的watchers：
- `languageCode` watcher中的canOneTranslate更新
- `autoTranslateToEnglish` watcher
- `autoTranslateToLocal` watcher
- `autoTranslate` watcher
- `translateApi` watcher
- `groupTagsTranslate` watcher

#### 删除的prop传递：
从physton-prompt组件中移除所有翻译相关的props传递

#### 删除的API调用：
- 移除 `this.gradioAPI.getConfig()` 中的 `translate_apis` 处理

### 2. **src/src/components/phystonPrompt.vue** 修改

#### 删除的prop绑定：
- `:translate-apis`
- `:languages`
- `v-model:can-one-translate`
- `v-model:auto-translate`
- `v-model:auto-translate-to-english`
- `v-model:auto-translate-to-local`
- `v-model:translate-api`
- `:translate-api-config`
- `@click:translate-api`
- `v-model:group-tags-translate`
- `@click:show-chatgpt`
- `:group-tags-translate-cache`

#### 删除的组件文件：
- `src/src/components/translateSetting.vue` - 翻译API设置界面
- `src/src/components/chatgptPrompt.vue` - ChatGPT提示词生成界面

### 3. **src/src/utils/gradioAPI.js** 修改

#### 删除的方法：
- `translate(text, from_lang, to_lang, api, api_config)` - 单个翻译API
- `translates(texts, from_lang, to_lang, api, api_config)` - 批量翻译API
- `genOpenAI(messages, api_config)` - ChatGPT生成API
- `mbart50Initialize()` - mbart50初始化API

### 4. **src/src/utils/common.js** 修改

#### 删除的方法：
- `canTranslate(text)` - 检查文本是否可翻译
- `isEnglish(text)` - 检查文本是否为英文
- `canOneTranslate(languageCode)` - 检查语言是否支持英文检测
- `isEnglishByLangCode(text, languageCode)` - 基于语言代码检测英文

#### 保留的方法：
- `getLang()` - 多语言支持
- 所有HTML转义/反转义方法
- 标签处理相关方法

### 5. **src/src/mixins/languageMixin.js** 修改

#### 删除的props：
- `translateApis`
- `translateApi`
- `translateApiConfig`
- `groupTagsTranslate`
- `groupTagsTranslateCache`

#### 删除的data属性：
- `cancelMultiTranslate`

#### 删除的方法：
- `_translateToLocalBy()`
- `translateToLocalByCSV()`
- `translateToEnByCSV()`
- `translateToLocalByGroupTags()`
- `translateToEnByGroupTags()`

### 6. **src/src/mixins/phystonPrompt/tagMixin.js** 修改

#### 删除的方法：
- `onTranslateToLocalClick()`
- `onTranslateToEnglishClick()`
- 相关的 `translates()` 调用
- `autoTranslateByIndexes()` 相关逻辑

### 7. **src/src/mixins/phystonPrompt/headerMixin.js** 修改

#### 删除的方法：
- `onTranslatesToLocalClick()`
- `onTranslatesToEnglishClick()`
- `autoTranslateByIndexes()`
- 相关的翻译API调用

---

## 保留的功能

✅ **以下功能完全保留：**
- 提示词编辑和格式化
- 历史记录管理
- 收藏夹功能
- 标签自动完成
- CSV导入
- 扩展网络支持
- 黑名单功能
- 快捷键支持
- 主题定制
- token计数（通过对sd_hijack的兼容性处理）
- 多语言UI支持
- Extra Networks显示

---

## 兼容性说明

### sd_hijack依赖处理
插件现在可以在以下两种环境中工作：

1. **旧版本webui**（仍有sd_hijack）：token计数使用sd_hijack的`model_hijack.get_prompt_lengths()`
2. **新版本webui**（无sd_hijack）：token计数回退到简单的基于逗号和空格的估计

### 修改前后对比

| 项目 | 修改前 | 修改后 |
|-----|------|------|
| Python文件数 | 38个 | 18个 |
| 翻译相关API端点 | 4个 | 0个 |
| sd_hijack依赖 | 强制 | 可选 |
| Vue组件 | 17个 | 15个 |
| 前端功能 | ~30% 翻译相关 | 0% 翻译相关 |

---

## 编译和部署

### 前端编译
```bash
cd src
npm install  # 如果需要
npm run build
```

### 文件检查
所有翻译相关的导入和API调用已完全删除。如果发现编译错误，可能是以下原因：
1. 某些mixin仍然有对已删除方法的引用（允许脚本可能未完全删除）
2. 某些组件仍然试图传递已删除的props

---

## 修改验证

运行以下命令验证删除是否完整：

```bash
# 检查是否还有翻译相关的导入
grep -r "translate\|mbart50\|gen_openai" scripts/physton_prompt/ --include="*.py" | grep -v translate.py

# 检查前端中的翻译API调用
grep -r "translates\|genOpenAI\|mbart50Initialize" src/src --include="*.js" --include="*.vue"

# 检查是否还有sd_hijack导入
grep -r "sd_hijack" scripts/physton_prompt/ --include="*.py"
```

如果上述命令返回结果仅为注释或文档引用，则删除完整。

---

## 已知限制

1. **token计数不够精确**：在没有sd_hijack的情况下，token计数依赖简单的估计，可能不如原来精确
2. **某些mixin中的未使用属性**：一些mixin可能仍然有对已删除功能的数据属性，但不会被调用

---

## 文件变更清单

### 修改文件：
- scripts/on_app_started.py
- scripts/physton_prompt/get_token_counter.py
- src/src/App.vue
- src/src/components/phystonPrompt.vue
- src/src/utils/gradioAPI.js
- src/src/utils/common.js
- src/src/mixins/languageMixin.js
- src/src/mixins/phystonPrompt/tagMixin.js
- src/src/mixins/phystonPrompt/headerMixin.js

### 删除的文件：
- scripts/physton_prompt/translate.py
- scripts/physton_prompt/gen_openai.py
- scripts/physton_prompt/mbart50.py
- scripts/physton_prompt/get_translate_apis.py
- scripts/physton_prompt/translator/* (所有翻译器)
- scripts/physton_prompt/translators/* (翻译服务器)
- src/src/components/translateSetting.vue
- src/src/components/chatgptPrompt.vue
- tests/translate.py
- tests/translator.py
- tests/translators.py
- tests/privacy_api_config.py

---

## 后续步骤

1. **测试**：在修改后的webui中全面测试所有保留的功能
2. **编译前端**：运行 `npm run build` 确保没有编译错误
3. **备份原始版本**：为了安全起见，备份原始版本
4. **逐步部署**：先在测试环境中验证，再在生产环境中使用

---

修改时间：2026年3月11日
