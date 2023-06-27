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

sd-webui-prompt-all-in-one 是一個基於 [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) 的擴展，旨在提高提示詞/反向提示詞輸入框的使用體驗。它擁有更直觀、強大的輸入界面功能，它提供了自動翻譯、歷史記錄和收藏等功能，它支持多種語言，滿足不同用戶的需求。

---

<div align="center">

### 安裝教程、功能詳解、使用方法、常見問題等等，詳見：[文檔](https://aiodoc.physton.com/zh-TW/)。

</div>

----

> 如果你覺得這個擴展有幫助，請在Github上給我一顆星！
> 你也可以請我喝杯咖啡: [donate](#捐贈)
>
> QQ群：820700336

----

> 中國用戶鏡像地址：
>
> 倉庫地址：[https://gitee.com/physton/sd-webui-prompt-all-in-one.git](https://gitee.com/physton/sd-webui-prompt-all-in-one.git)
>
> 文檔地址：[https://aiodoc.physton.com/](https://aiodoc.physton.com/zh-TW/)

----

## 翻譯API說明

1. `不需要API KEY`：它們非常不穩定，並不是每個API都能在你的電腦中使用。如果翻譯失敗，請嘗試切換其他API，⚠️⚠️⚠️**不要提交issue！**
2. `需要API KEY`：需要自行申請API KEY。不同接口的申請方法，在切換到對應接口後，會出現對應的申請教程。⚠️⚠️⚠️**它們大部分都是 `免費` 的！**
3. `離線翻譯`：在初始化時需要自動下載語言模型。如果你的網絡環境不好，可能無法完成自動下載並初始化。

## [文檔](https://aiodoc.physton.com/zh-TW/)

- [安裝](https://aiodoc.physton.com/zh-TW/Installation.html)
- [擴展更新說明](https://aiodoc.physton.com/zh-TW/ExtensionUpdateDescription.html)
- [翻譯接口說明](https://aiodoc.physton.com/zh-TW/TranslationApiConfiguration.html#翻譯接口說明)
- [幫助開發](https://aiodoc.physton.com/zh-TW/Contributing.html)
- [自定義主題](https://aiodoc.physton.com/zh-TW/Contributing.html#自定義主題)
- [常見問題](https://aiodoc.physton.com/zh-TW/FAQ.html)
- [請我喝杯咖啡](#請我喝杯咖啡)

## 語言支持

支持幾乎所有國家語言的翻譯，但大部分國家的UI界面會顯示為英文，如果需要本地化語言顯，你可以翻譯後提交PR。

`簡體中文` `繁體中文` `English` ` Русский` `日本語` `한국어` ` Français` `Deutsch` ` Español` `Português` `Italiano` `العربية`

## 演示

- [切換語言](https://aiodoc.physton.com/zh-TW/LanguageSelection.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.switch_language.gif)

- [翻譯API設置](https://aiodoc.physton.com/zh-TW/TranslationApiConfiguration.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate_setting.gif)

- [顯示/折疊內容](https://aiodoc.physton.com/zh-TW/OtherFeatures.html#顯示-摺疊擴展面板)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.fold.gif)

- [顯示/隱藏WebUI輸入框](https://aiodoc.physton.com/zh-TW/OtherFeatures.html#顯示-隱藏-webui-輸入框)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.show_input.gif)

- [自動翻譯](https://aiodoc.physton.com/zh-TW/AutomaticTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.auto_translate.gif)

- [一鍵翻譯](https://aiodoc.physton.com/zh-TW/BatchTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate.gif)

- [優雅的輸入](https://aiodoc.physton.com/zh-TW/KeywordInputBox.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.elegant_input.gif)

- [快速調整](https://aiodoc.physton.com/zh-TW/ListOfKeywords.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.quick_adjust.gif)

- [收藏和歷史記錄](https://aiodoc.physton.com/zh-TW/History.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.history_favorite.gif)

- [使用ChatGPT生成Prompt](https://aiodoc.physton.com/zh-TW/UsingChatgptToGeneratePrompts.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.chatgpt.gif)

- [在WebUI的輸入框中編寫](https://aiodoc.physton.com/zh-TW/WritingInWebUIInputBox.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.writing_webui.gif)

- 支持[a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.tagcomplete.gif)

- [Lora、LyCORIS、Textual Inversion 高亮和檢測](https://aiodoc.physton.com/zh-TW/ListOfKeywords.html#高亮關鍵詞)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.keyword_detection.gif)

- [Prompt提示詞格式](https://aiodoc.physton.com/zh-TW/FormatOfPrompts.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.prompt_format.gif)

- [批量操作](https://aiodoc.physton.com/zh-TW/BatchOperation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.batch_operation.gif)

- [自定義主題/擴展風格](https://aiodoc.physton.com/zh-TW/ThemeStyle.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.custom_theme.gif)

## 捐贈

[捐贈列表](https://aiodoc.physton.com/zh-TW/Donate.html)

### 請我喝杯咖啡

| ko-fi | [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/physton) |
| :---: | :---: |
| Paypal | [https://paypal.me/physton](https://paypal.me/physton) |
| 爱发电 | [https://afdian.net/a/physton](https://afdian.net/a/physton) |
| 支付宝 | `physton@163.com` |
| 微信赞赏 | ![](https://s1.imagehub.cc/images/2023/06/06/donate-wechat.jpeg) |