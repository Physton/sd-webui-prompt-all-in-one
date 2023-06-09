# sd-webui-prompt-all-in-one

[![GitHub stars](https://img.shields.io/github/stars/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/issues)
[![GitHub issues closed](https://img.shields.io/github/issues-closed/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub license](https://img.shields.io/github/license/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/blob/master/LICENSE.md)
[![GitHub commits](https://img.shields.io/github/last-commit/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/commits/main)

sd-webui-prompt-all-in-one is an extension based on [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) that aims to improve the user experience of the prompt/negative prompt input box. It has a more intuitive and powerful input interface, provides automatic translation, history and collection functions, and supports multiple languages to meet the needs of different users.

*sd-webui-prompt-all-in-one 是一个基于 [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) 的扩展，旨在提高提示词/反向提示词输入框的使用体验。它拥有更直观、强大的输入界面功能，它提供了自动翻译、历史记录和收藏等功能，它支持多种语言，满足不同用户的需求。*

---

<div align="center">

### Installation tutorial, detailed feature introduction, usage instructions, frequently asked questions, and more can be found in the [Wiki](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki#english).

### 安装教程、功能详解、使用方法、常见问题等等，详见：[文档](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki#简体中文)。

</div>

---

The localized language interface is currently available in `简体中文` `繁體中文` `English` ` Русский` `日本語` `한국어` ` Français` `Deutsch` ` Español` `Português` `Italiano` `العربية`,
the UI interfaces of other countries are displayed in English. and the translation function supports the majority of countries worldwide.

目前支持以下语言的本地化语言界面：`简体中文` `繁體中文` `English` ` Русский` `日本語` `한국어` ` Français` `Deutsch` ` Español` `Português` `Italiano` `العربية`，其他国家的UI界面均显示为英文。翻译功能支持目前世界上绝大多数国家。


> If you find this extension helpful, please give me a star on Github!
> You could also buy me a coffee: [donate](#donate)

> 作者独自一人开发，免费开源提供给所有有需要的人。没有强迫任何人使用它，没有强迫任何人付费。如果你觉得不好用、不好看，可以不用它，删除它。或者请你有礼貌地提出你的意见。如果你不会好好说话，建议你重新去体验一下幼儿园生活。谢谢！
>
> 如果你觉得这个扩展有帮助，请在Github上给我一颗星！
> 你也可以请我喝杯咖啡: [donate](#donate)

> QQ群：820700336

- [Demo / *演示*](#demo--演示)

- [Wiki](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki#english) / [文档](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki#简体中文)

- [Installation and Usage](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki/01.Installation#english) / [安装使用](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki/01.Installation#简体中文)

- [Extension update description (important)](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki/31.ExtensionUpdateDescription#english) / [扩展更新说明（重要）](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki/31.ExtensionUpdateDescription#简体中文)

- [Contributing](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki/32.Contributing#english) / [帮助开发](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki/32.Contributing#简体中文)

- [Custom Theme](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki/32.Contributing#custom-theme) / [自定义主题](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki/32.Contributing#自定义主题)

- [FAQ](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki/40.FAQ#english) / [常见问题列表](https://github.com/Physton/sd-webui-prompt-all-in-one/wiki/40.FAQ#简体中文)

- [Donate / *捐赠*](#Donate)

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


## Donate

Donation list / *捐赠列表*：[DONATE.MD](DONATE.MD)

### Buy me a coffee / *请我喝杯咖啡*

- ko-fi：[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/physton)
- Paypal: [https://paypal.me/physton](https://paypal.me/physton)


- 爱发电：[https://afdian.net/a/physton](https://afdian.net/a/physton)
- 支付宝 `physton@163.com`
- 微信赞赏

    ![](https://s1.imagehub.cc/images/2023/06/06/donate-wechat.jpeg)

Developed by: https://www.physton.com
