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

sd-webui-prompt-all-in-one is an extension based on [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) that aims to improve the user experience of the prompt/negative prompt input box. It has a more intuitive and powerful input interface, provides automatic translation, history and collection functions, and supports multiple languages to meet the needs of different users.

---

<div align="center">

### Installation tutorial, detailed feature introduction, usage instructions, frequently asked questions, and more can be found in the [Wiki](https://aiodoc.physton.com/).

</div>

----

> If you find this extension helpful, please give me a star on Github!
> You could also buy me a coffee: [donate](#donate)

----

## Translation API Description

1. `API Key Not Required`: They are highly unstable and not every API can be used on your computer. If the translation fails, please try switching to another API. ⚠️⚠️⚠️ **Do not submit an issue!**
2. `API KEY Required`: You need to apply for an API KEY on your own. The application methods for different interfaces will appear after switching to the corresponding interface. ⚠️⚠️⚠️ **Most of them are `free`!**
3. `Offline Translation`: During initialization, automatic download of language models is required. If your network environment is poor, it may not be able to complete the automatic download and initialization.

## [Wiki](https://aiodoc.physton.com/)

- [Installation](https://aiodoc.physton.com/Installation.html)
- [Extension update description](https://aiodoc.physton.com/ExtensionUpdateDescription.html)
- [Translation API Description](https://aiodoc.physton.com/TranslationApiConfiguration.html#translation-api-description)
- [Contributing](https://aiodoc.physton.com/Contributing.html)
- [Custom Theme](https://aiodoc.physton.com/Contributing.html#custom-theme)
- [FAQ](https://aiodoc.physton.com/FAQ.html)
- [Buy me a coffee](#buy-me-a-coffee)

## Language support

Translation supports almost all national languages, but the UI interface of most countries will be displayed in English. If you need localized language display, you can translate and submit a PR.

`简体中文` `繁體中文` `English` ` Русский` `日本語` `한국어` ` Français` `Deutsch` ` Español` `Português` `Italiano` `العربية`

## Demo

- [Switch language](https://aiodoc.physton.com/LanguageSelection.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.switch_language.gif)

- [Translation API settings](https://aiodoc.physton.com/TranslationApiConfiguration.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate_setting.gif)

- [Show/Hide content](https://aiodoc.physton.com/OtherFeatures.html#show-collapse-the-extension-panel)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.fold.gif)

- [Show/Hide the WebUI input box](https://aiodoc.physton.com/OtherFeatures.html#show-hide-the-webui-input-box)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.show_input.gif)

- [Automatic translation](https://aiodoc.physton.com/AutomaticTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.auto_translate.gif)

- [One-click translation](https://aiodoc.physton.com/BatchTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate.gif)

- [Elegant input](https://aiodoc.physton.com/KeywordInputBox.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.elegant_input.gif)

- [Quick adjustment](https://aiodoc.physton.com/ListOfKeywords.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.quick_adjust.gif)

- [Favorite and History](https://aiodoc.physton.com/History.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.history_favorite.gif)

- [Use ChatGPT to Generate Prompts](https://aiodoc.physton.com/UsingChatgptToGeneratePrompts.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.chatgpt.gif)

- [Writing in WebUI input box](https://aiodoc.physton.com/WritingInWebUIInputBox.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.writing_webui.gif)

- Support for [a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.tagcomplete.gif)

- [Highlighting and detection of Lora, LyCORIS, and Textual Inversion](https://aiodoc.physton.com/ListOfKeywords.html#highlight-keyword)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.keyword_detection.gif)

- [Format of Prompt](https://aiodoc.physton.com/FormatOfPrompts.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.prompt_format.gif)

- [Batch operation](https://aiodoc.physton.com/BatchTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.batch_operation.gif)

- [Custom Theme / Extension styles](https://aiodoc.physton.com/ThemeStyle.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.custom_theme.gif)

## Donate

[Donation list](https://aiodoc.physton.com/Donate.html)

### Buy me a coffee

| ko-fi | [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/physton) |
| :---: | :---: |
| Paypal | [https://paypal.me/physton](https://paypal.me/physton) |
| 爱发电 | [https://afdian.net/a/physton](https://afdian.net/a/physton) |
| 支付宝 | `physton@163.com` |
| 微信赞赏 | ![](https://s1.imagehub.cc/images/2023/06/06/donate-wechat.jpeg) |
