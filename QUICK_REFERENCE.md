# 快速参考 - 修改清单

## 📋 文件变更清单

### 🗑️ 已删除的文件（23个）

#### Python服务端（18个）
```
scripts/physton_prompt/translate.py
scripts/physton_prompt/gen_openai.py
scripts/physton_prompt/mbart50.py
scripts/physton_prompt/get_translate_apis.py
scripts/physton_prompt/translator/alibaba_translator.py
scripts/physton_prompt/translator/amazon_translator.py
scripts/physton_prompt/translator/baidu_translator.py
scripts/physton_prompt/translator/base_tanslator.py
scripts/physton_prompt/translator/caiyun_translator.py
scripts/physton_prompt/translator/deepl_translator.py
scripts/physton_prompt/translator/google_tanslator.py
scripts/physton_prompt/translator/iflytekV1_translator.py
scripts/physton_prompt/translator/iflytekV2_translator.py
scripts/physton_prompt/translator/mbart50_translator.py
scripts/physton_prompt/translator/microsoft_translator.py
scripts/physton_prompt/translator/mymemory_translator.py
scripts/physton_prompt/translator/niutrans_translator.py
scripts/physton_prompt/translator/openai_translator.py
scripts/physton_prompt/translator/tencent_translator.py
scripts/physton_prompt/translator/translators_translator.py
scripts/physton_prompt/translator/volcengine_translator.py
scripts/physton_prompt/translator/yandex_translator.py
scripts/physton_prompt/translator/youdao_translator.py
scripts/physton_prompt/translators/server.py
```

#### 前端组件（2个）
```
src/src/components/translateSetting.vue
src/src/components/chatgptPrompt.vue
```

#### 测试文件（4个）
```
tests/privacy_api_config.py
tests/translate.py
tests/translator.py
tests/translators.py
```

---

### ✏️ 已修改的文件（9个）

#### 后端（2个）
```
scripts/on_app_started.py
  - 删除4个API端点
  - 删除翻译导入
  - 移除mbart50初始化

scripts/physton_prompt/get_token_counter.py
  - 将sd_hijack改为可选导入
  - 添加fallback方案
```

#### 前端（7个）
```
src/src/App.vue
  - 删除TranslateSetting, ChatgptPrompt组件
  - 删除所有翻译相关的data属性
  - 删除所有翻译相关的watchers
  - 删除translate_apis处理

src/src/components/phystonPrompt.vue
  - 删除所有翻译相关的prop绑定
  
src/src/utils/gradioAPI.js
  - 删除translate()方法
  - 删除translates()方法
  - 删除genOpenAI()方法
  - 删除mbart50Initialize()方法
  
src/src/utils/common.js
  - 删除canTranslate()方法
  - 删除isEnglish()方法
  - 删除canOneTranslate()方法
  - 删除isEnglishByLangCode()方法
  
src/src/mixins/languageMixin.js
  - 删除翻译相关props
  - 删除翻译方法
  
src/src/mixins/phystonPrompt/tagMixin.js
  - 删除onTranslateToLocalClick()
  - 删除onTranslateToEnglishClick()
  
src/src/mixins/phystonPrompt/headerMixin.js
  - 删除onTranslatesToLocalClick()
  - 删除onTranslatesToEnglishClick()
  - 删除autoTranslateByIndexes()
```

---

## 🔧 API变更

### 已删除的REST API端点

| 路径 | 方法 | 功能 |
|-----|-----|------|
| `/physton_prompt/translate` | POST | 单个文本翻译 |
| `/physton_prompt/translates` | POST | 批量文本翻译 |
| `/physton_prompt/gen_openai` | POST | ChatGPT提示词生成 |
| `/physton_prompt/mbart50_initialize` | POST | mbart50模型初始化 |

### 修改的API响应

#### `/physton_prompt/get_config`

**删除字段：**
- `translate_apis` (对象)
  - `.default` - 默认翻译API
  - `.apis` - 可用的翻译API列表

**保留字段：**
- `i18n` - 国际化配置
- `packages_state` - 包状态
- `python` - Python可执行路径

---

## 🚀 部署检查清单

- [ ] 前端已编译：`npm run build`
- [ ] 无JavaScript编译错误
- [ ] 无Python模块导入错误
- [ ] 验证修改的文件（见上表）
- [ ] 测试核心功能（提示词编辑、历史记录、CSV导入）
- [ ] 验证WebUI加载正常
- [ ] 检查浏览器控制台无错误
- [ ] Token计数功能验证

---

## 🔍 验证命令

### 检查是否有翻译代码残留
```bash
grep -r "translate\|mbart50\|gen_openai" scripts/physton_prompt/ --include="*.py"
```
**预期结果**：无匹配（或仅为注释）

### 检查是否有sd_hijack强制导入
```bash
grep -r "^from modules.sd_hijack\|^import.*sd_hijack" scripts/physton_prompt/ --include="*.py"
```
**预期结果**：无匹配

### 检查是否有翻译API调用（前端）
```bash
grep -r "translates\|genOpenAI\|mbart50Initialize" src/src --include="*.js" --include="*.vue"
```
**预期结果**：无匹配

---

## 📚 文档

- `MODIFICATION_REPORT.md` - 完整修改报告
- `CLEANUP_SUMMARY.md` - 详细变更说明

---

## ⚠️ 注意事项

1. **Token计数精度**
   - 有sd_hijack：精确
   - 无sd_hijack：基于简单估计（可用但粗略）

2. **兼容性**
   - ✅ 兼容有sd_hijack的旧版WebUI
   - ✅ 兼容无sd_hijack的新版WebUI

3. **用户界面**
   - 所有翻译相关的按钮/选项已移除
   - UI应该更加简洁

---

## 📞 问题排查

| 问题 | 原因 | 解决方案 |
|-----|------|--------|
| 前端加载失败 | 编译错误 | 运行`npm run build` |
| 后端404错误 | API不存在 | 检查是否删除了翻译API的导入 |
| Token错误 | 无sd_hijack但未处理 | 已改为fallback，应正常工作 |
| 翻译按钮仍存在 | 未删除UI代码 | 检查phystonPrompt.vue是否修改 |

---

修改日期：2026年3月11日
