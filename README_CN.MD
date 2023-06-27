# sd-webui-prompt-all-in-one

[![GitHub stars](https://img.shields.io/github/stars/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/issues)
[![GitHub issues closed](https://img.shields.io/github/issues-closed/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub license](https://img.shields.io/github/license/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/blob/master/LICENSE.md)
[![GitHub commits](https://img.shields.io/github/last-commit/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/commits/main)
[![Netlify Status](https://api.netlify.com/api/v1/badges/1441a696-a1a4-4ad7-b520-4abfd96acc76/deploy-status)](https://app.netlify.com/sites/aiodoc/deploys)

<div align="center">

### [🇺🇸 English](README.MD) | [🇷🇺 Русский](README_RU.MD) | [🇨🇳 简体中文](README_CN.MD) | [🇨🇳 繁體中文](README_TW.MD)

</div>

sd-webui-prompt-all-in-one 是一个基于 [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) 的扩展，旨在提高提示词/反向提示词输入框的使用体验。它拥有更直观、强大的输入界面功能，它提供了自动翻译、历史记录和收藏等功能，它支持多种语言，满足不同用户的需求。

---

<div align="center">

### 安装教程、功能详解、使用方法、常见问题等等，详见：[文档](https://aiodoc.physton.com/zh-CN/)。

</div>

----

> 如果你觉得这个扩展有帮助，请在Github上给我一颗星！
> 你也可以请我喝杯咖啡: [donate](#捐赠)
>
> QQ群：820700336

----

> 中国用户镜像地址：
>
> 仓库地址：[https://gitee.com/physton/sd-webui-prompt-all-in-one.git](https://gitee.com/physton/sd-webui-prompt-all-in-one.git)
>
> 文档地址：[https://aiodoc.physton.com/](https://aiodoc.physton.com/zh-CN/)

----

## 翻译API说明

1. `不需要API KEY`：它们非常不稳定，并不是每个API都能在你的电脑中使用。如果翻译失败，请尝试切换其他API，⚠️⚠️⚠️**不要提交issue！**
2. `需要API KEY`：需要自行申请API KEY。不同接口的申请方法，在切换到对应接口后，会出现对应的申请教程。⚠️⚠️⚠️**它们大部分都是 `免费` 的！**
3. `离线翻译`：在初始化时需要自动下载语言模型。如果你的网络环境不好，可能无法完成自动下载并初始化。

## [文档](https://aiodoc.physton.com/zh-CN/)

- [安装](https://aiodoc.physton.com/zh-CN/Installation.html)
- [扩展更新说明](https://aiodoc.physton.com/zh-CN/ExtensionUpdateDescription.html)
- [翻译接口说明](https://aiodoc.physton.com/zh-CN/TranslationApiConfiguration.html#翻译接口说明)
- [帮助开发](https://aiodoc.physton.com/zh-CN/Contributing.html)
- [自定义主题](https://aiodoc.physton.com/zh-CN/Contributing.html#自定义主题)
- [常见问题](https://aiodoc.physton.com/zh-CN/FAQ.html)
- [请我喝杯咖啡](#请我喝杯咖啡)

## 语言支持

支持几乎所有国家语言的翻译，但大部分国家的UI界面会显示为英文，如果需要本地化语言显，你可以翻译后提交PR。

`简体中文` `繁體中文` `English` ` Русский` `日本語` `한국어` ` Français` `Deutsch` ` Español` `Português` `Italiano` `العربية`

## 演示

- [切换语言](https://aiodoc.physton.com/zh-CN/LanguageSelection.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.switch_language.gif)

- [翻译API设置](https://aiodoc.physton.com/zh-CN/TranslationApiConfiguration.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate_setting.gif)

- [显示/折叠内容](https://aiodoc.physton.com/zh-CN/OtherFeatures.html#显示-折叠扩展面板)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.fold.gif)

- [显示/隐藏WebUI输入框](https://aiodoc.physton.com/zh-CN/OtherFeatures.html#显示-隐藏webui输入框)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.show_input.gif)

- [自动翻译](https://aiodoc.physton.com/zh-CN/AutomaticTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.auto_translate.gif)

- [一键翻译](https://aiodoc.physton.com/zh-CN/BatchTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate.gif)

- [优雅的输入](https://aiodoc.physton.com/zh-CN/KeywordInputBox.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.elegant_input.gif)

- [快速调整](https://aiodoc.physton.com/zh-CN/ListOfKeywords.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.quick_adjust.gif)

- [收藏和历史记录](https://aiodoc.physton.com/zh-CN/History.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.history_favorite.gif)

- [使用ChatGPT生成Prompt](https://aiodoc.physton.com/zh-CN/UsingChatgptToGeneratePrompts.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.chatgpt.gif)

- [在WebUI的输入框中编写](https://aiodoc.physton.com/zh-CN/WritingInWebUIInputBox.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.writing_webui.gif)

- 支持[a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.tagcomplete.gif)

- [Lora、LyCORIS、Textual Inversion 高亮和检测](https://aiodoc.physton.com/zh-CN/ListOfKeywords.html#高亮关键词)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.keyword_detection.gif)

- [Prompt提示词格式](https://aiodoc.physton.com/zh-CN/FormatOfPrompts.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.prompt_format.gif)

- [批量操作](https://aiodoc.physton.com/zh-CN/BatchOperation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.batch_operation.gif)

- [自定义主题/扩展风格](https://aiodoc.physton.com/zh-CN/ThemeStyle.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.custom_theme.gif)

## 捐赠

[捐赠列表](https://aiodoc.physton.com/zh-CN/Donate.html)

### 请我喝杯咖啡

| ko-fi | [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/physton) |
| :---: | :---: |
| Paypal | [https://paypal.me/physton](https://paypal.me/physton) |
| 爱发电 | [https://afdian.net/a/physton](https://afdian.net/a/physton) |
| 支付宝 | `physton@163.com` |
| 微信赞赏 | ![](https://s1.imagehub.cc/images/2023/06/06/donate-wechat.jpeg) |