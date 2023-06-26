# sd-webui-prompt-all-in-one

[![GitHub stars](https://img.shields.io/github/stars/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/issues)
[![GitHub issues closed](https://img.shields.io/github/issues-closed/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub license](https://img.shields.io/github/license/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/blob/master/LICENSE.md)
[![GitHub commits](https://img.shields.io/github/last-commit/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/commits/main)
[![Netlify Status](https://api.netlify.com/api/v1/badges/1441a696-a1a4-4ad7-b520-4abfd96acc76/deploy-status)](https://app.netlify.com/sites/aiodoc/deploys)

sd-webui-prompt-all-in-one is an extension based on [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) that aims to improve the user experience of the prompt/negative prompt input box. It has a more intuitive and powerful input interface, provides automatic translation, history and collection functions, and supports multiple languages to meet the needs of different users.

*sd-webui-prompt-all-in-one 是一个基于 [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) 的扩展，旨在提高提示词/反向提示词输入框的使用体验。它拥有更直观、强大的输入界面功能，它提供了自动翻译、历史记录和收藏等功能，它支持多种语言，满足不同用户的需求。*

---

<div align="center">

#### Installation tutorial, detailed feature introduction, usage instructions, frequently asked questions, and more can be found in the [Wiki](https://aiodoc.netlify.app/).

#### Перевод на русский: Инструкции по установке, подробное описание функций, методы использования, часто задаваемые вопросы и многое другое можно найти в [документации](https://aiodoc.netlify.app/ru/).

#### 安装教程、功能详解、使用方法、常见问题等等，详见：[文档](https://aiodoc.netlify.app/zh-CN/)。

#### 安裝教程、功能詳解、使用方法、常見問題等等，詳見：[文檔](https://aiodoc.netlify.app/zh-TW/)。

</div>

----

> If you find this extension helpful, please give me a star on Github!
> You could also buy me a coffee: [donate](#donate)
>
> 如果你觉得这个扩展有帮助，请在Github上给我一颗星！
> 你也可以请我喝杯咖啡: [donate](#donate)
>
> QQ群：820700336

----

> 中国用户镜像地址：
>
> 仓库地址：[https://gitee.com/physton/sd-webui-prompt-all-in-one.git](https://gitee.com/physton/sd-webui-prompt-all-in-one.git)
>
> 文档地址：[https://aiodoc.netlify.app/](https://aiodoc.netlify.app/zh-CN/)

----

## Translation API Description / *翻译API说明*

1. `API Key Not Required`: They are highly unstable and not every API can be used on your computer. If the translation fails, please try switching to another API. ⚠️⚠️⚠️ **Do not submit an issue!**
    > `不需要API KEY`：它们非常不稳定，并不是每个API都能在你的电脑中使用。如果翻译失败，请尝试切换其他API，⚠️⚠️⚠️**不要提交issue！**
2. `API KEY Required`: You need to apply for an API KEY on your own. The application methods for different interfaces will appear after switching to the corresponding interface. ⚠️⚠️⚠️ **Most of them are `free`!**
    > `需要API KEY`：需要自行申请API KEY。不同接口的申请方法，在切换到对应接口后，会出现对应的申请教程。⚠️⚠️⚠️**它们大部分都是 `免费` 的！**
3. `Offline Translation`: During initialization, automatic download of language models is required. If your network environment is poor, it may not be able to complete the automatic download and initialization.
   > `离线翻译`：在初始化时需要自动下载语言模型。如果你的网络环境不好，可能无法完成自动下载并初始化。

## Wiki / *文档*

| English | Русский | 简体中文 | 繁體中文 |
| :-----: | :-----: | :-----: | :-----: |
| [Wiki](https://aiodoc.netlify.app/) | [документация](https://aiodoc.netlify.app/ru/) | [文档](https://aiodoc.netlify.app/zh-CN/) | [文檔](https://aiodoc.netlify.app/zh-TW/)
| [Installation](https://aiodoc.netlify.app/Installation.html) | [Установка](https://aiodoc.netlify.app/ru/Installation.html) | [安装](https://aiodoc.netlify.app/zh-CN/Installation.html) | [安裝](https://aiodoc.netlify.app/zh-TW/Installation.html)
| [Extension update description](https://aiodoc.netlify.app/ExtensionUpdateDescription.html) | [Обновление расширения](https://aiodoc.netlify.app/ru/ExtensionUpdateDescription.html) | [扩展更新说明](https://aiodoc.netlify.app/zh-CN/ExtensionUpdateDescription.html) | [擴展更新說明](https://aiodoc.netlify.app/zh-TW/ExtensionUpdateDescription.html) |
| [Translation API Description](https://aiodoc.netlify.app/TranslationApiConfiguration.html#translation-api-description) | [Описание интерфейса перевода](https://aiodoc.netlify.app/ru/TranslationApiConfiguration.html#открытие-окна-настроики-api-перевода) | [翻译接口说明](https://aiodoc.netlify.app/zh-CN/TranslationApiConfiguration.html#翻译接口说明) | [翻譯接口說明](https://aiodoc.netlify.app/zh-TW/TranslationApiConfiguration.html#翻譯接口說明) |
| [Contributing](https://aiodoc.netlify.app/Contributing.html) | [Помощь в разработке](https://aiodoc.netlify.app/ru/Contributing.html) | [帮助开发](https://aiodoc.netlify.app/zh-CN/Contributing.html) | [幫助開發](https://aiodoc.netlify.app/zh-TW/Contributing.html) |
| [Custom Theme](https://aiodoc.netlify.app/Contributing.html#custom-theme) | [Настройка темы](https://aiodoc.netlify.app/ru/Contributing.html#настроика-темы) | [自定义主题](https://aiodoc.netlify.app/zh-CN/Contributing.html#自定义主题) | [自定義主題](https://aiodoc.netlify.app/zh-TW/Contributing.html#自定義主題) |
| [FAQ](https://aiodoc.netlify.app/FAQ.html) | [Часто задаваемые вопросы](https://aiodoc.netlify.app/ru/FAQ.html) | [常见问题](https://aiodoc.netlify.app/zh-CN/FAQ.html) | [常見問題](https://aiodoc.netlify.app/zh-TW/FAQ.html) |
| [Donate](#donate) | [Пожертвование](#donate) | [捐赠](#donate) | [捐贈](#donate) |

## Demo / *演示*

- Switch language / *切换语言*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.switch_language.gif)


- Translation API settings / *翻译API设置*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate_setting.gif)

- Show/Hide content / *显示/折叠内容*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.fold.gif)

- Show/Hide the WebUI input box / *显示/隐藏WebUI输入框*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.show_input.gif)

- Automatic translation / *自动翻译*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.auto_translate.gif)

- One-click translation / *一键翻译*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate.gif)

- Elegant input / *优雅的输入*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.elegant_input.gif)

- Quick adjustment / *快速调整*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.quick_adjust.gif)

- Favorite and History / *收藏和历史记录*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.history_favorite.gif)

- Use ChatGPT to Generate Prompts / *使用ChatGPT生成Prompt*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.chatgpt.gif)

- Writing in WebUI input box / *在WebUI的输入框中编写*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.writing_webui.gif)

- Support for [a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete) / *支持[a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.tagcomplete.gif)

- Highlighting and detection of Lora, LyCORIS, and Textual Inversion / *Lora、LyCORIS、Textual Inversion 高亮和检测*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.keyword_detection.gif)

- Format of Prompt / *Prompt提示词格式*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.prompt_format.gif)

- Batch operation / *批量操作*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.batch_operation.gif)

- Custom Theme / Extension styles / *自定义主题/扩展风格*

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.custom_theme.gif)

## Language support / *语言支持*

Translation supports almost all national languages, but the UI interface of most countries will be displayed in English. If you need localized language display, you can translate and submit a PR.

支持几乎所有国家语言的翻译，但大部分国家的UI界面会显示为英文，如果需要本地化语言显示，你可以翻译后提交PR。

`简体中文` `繁體中文` `English` ` Русский` `日本語` `한국어` ` Français` `Deutsch` ` Español` `Português` `Italiano` `العربية`

## Donate

[Donation list / *捐赠列表*](https://aiodoc.netlify.app/Donate.html)

### Buy me a coffee / *请我喝杯咖啡*

| ko-fi | [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/physton) |
| :---: | :---: |
| Paypal | [https://paypal.me/physton](https://paypal.me/physton) |
| 爱发电 | [https://afdian.net/a/physton](https://afdian.net/a/physton) |
| 支付宝 | `physton@163.com` |
| 微信赞赏 | ![](https://s1.imagehub.cc/images/2023/06/06/donate-wechat.jpeg) |
