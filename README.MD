# sd-webui-prompt-all-in-one

[![GitHub stars](https://img.shields.io/github/stars/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/issues)
[![GitHub license](https://img.shields.io/github/license/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/blob/master/LICENSE.md)

sd-webui-prompt-all-in-one is an extension based on [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) that aims to improve the user experience of the prompt/negative prompt input box. It has a more intuitive and powerful input interface, provides automatic translation, history and collection functions, and supports multiple languages to meet the needs of different users.

*sd-webui-prompt-all-in-one 是一个基于 [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) 的扩展，旨在提高提示词/反向提示词输入框的使用体验。它拥有更直观、强大的输入界面功能，它提供了自动翻译、历史记录和收藏等功能，它支持多种语言，满足不同用户的需求。*

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
- [Installation and Usage / *安装使用*](#installation-and-usage--安装使用)
- [Extension update description (important) / *扩展更新说明（重要）*](#extension-update-description-important--扩展更新说明重要)
- [Contributing / *帮助开发*](#contributing--帮助开发)
- [Development / *开发方式*](#development--开发方式)
- [Custom Theme / *自定义主题*](#custom-theme--自定义主题)
- [FAQ / *常见问题列表*](#faq--常见问题列表)
- [Donate / *捐赠*](#Donate)

## Demo / *演示*

- Switch language / *切换语言*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.switch_language.gif)


- Translation API settings / *翻译API设置*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.translate_setting.gif)

- Show/Hide content / *显示/折叠内容*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.fold.gif)

- Show/Hide the WebUI input box / *显示/隐藏WebUI输入框*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.show_input.gif)

- Automatic translation / *自动翻译*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.auto_translate.gif)

- One-click translation / *一键翻译*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.translate.gif)

- Elegant input / *优雅的输入*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.elegant_input.gif)

- Quick adjustment / *快速调整*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.quick_adjust.gif)

- Favorite and History / *收藏和历史记录*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.history_favorite.gif)

- Writing in WebUI input box / *在WebUI的输入框中编写*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.writing_webui.gif)

- Support for [a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete) / *支持[a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.tagcomplete.gif)

- Highlighting and detection of Lora, LyCORIS, and Textual Inversion / *Lora、LyCORIS、Textual Inversion 高亮和检测*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.keyword_detection.gif)

- Format of Prompt / *Prompt提示词格式*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.prompt_format.gif)

- Custom Theme / Extension styles / *自定义主题/扩展风格*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/demo.custom_theme.gif)


## Installation and Usage / *安装使用*

- ### Method 1 (Recommended) / *方式一（推荐）*： 

  1. Open the terminal and enter your stable-diffusion-webui directory.

      *打开终端，进入到你的 stable-diffusion-webui 目录下。*

      For example / *例如*：
   
      `cd "C:\stable-diffusion-webui"`

  2. Use git to clone sd-webui-prompt-all-in-one to the extensions directory of stable-diffusion-webui.
    
      *使用 git 克隆 sd-webui-prompt-all-in-one 到 stable-diffusion-webui 的 extensions 目录下。*
    
      ```shell
      git clone "https://github.com/Physton/sd-webui-prompt-all-in-one.git" extensions/sd-webui-prompt-all-in-one
      ```
     
      > *China中国镜像地址：*
      > ```shell
      > git clone "https://gitee.com/physton/sd-webui-prompt-all-in-one.git" extensions/sd-webui-prompt-all-in-one
      > ```

- ### Method 2 / *方式二*：

  In the extension tab of stable-diffusion-webui, select "Install from URL", enter `https://github.com/Physton/sd-webui-prompt-all-in-one.git`, and click on install.

  *在 stable-diffusion-webui 的扩展选项卡中，选择从网址安装，输入 `https://github.com/Physton/sd-webui-prompt-all-in-one.git`, 然后点击安装。*

  > *China中国镜像地址：*
  > https://gitee.com/physton/sd-webui-prompt-all-in-one.git

- ### Method 3 / *方式三*：

  In the extensions tab of stable-diffusion-webui, load the official online extension library, find `sd-webui-prompt-all-in-one`, and click Install.

  *在 stable-diffusion-webui 的扩展选项卡中，加载官方在线扩展库，找到`sd-webui-prompt-all-in-one`，点击安装*


- ### Method 4 (Not recommended) / *方式四（不推荐）*：
  Download the source code package of sd-webui-prompt-all-in-one, and unzip it to the extensions directory of stable-diffusion-webui.

  *下载 sd-webui-prompt-all-in-one 的源码压缩包，解压到 stable-diffusion-webui 的 extensions 目录下。*

### Restart stable-diffusion-webui. (Not Reload WebUI)

   *重启 stable-diffusion-webui。（不是Reload重载WebUI）*


## Extension update description (important) / *扩展更新说明（重要）*

1. All your data, including API keys, history records, and favorite data, are stored in the `storage` directory of the extension.

    *你的所有数据：API KEY、历史记录、收藏数据等，都保存在扩展的 `storage` 目录下。*

2. Using the built-in updater in WebUI or updating via git will not cause your data to be lost.

    *使用WebUI自带的更新器，或者使用git更新，都不会导致你的数据丢失。*

3. Overwriting the extension installation with a compressed file or deleting the extension and reinstalling it will result in data loss.

    *使用压缩包等方式覆盖安装，或者删除扩展后重新安装，都会导致你的数据丢失。*

4. If you want to backup your data, you can copy the `storage` directory to another location and then copy it back when needed.

    *如果你想备份你的数据，可以将 `storage` 目录复制到其他地方，然后在需要的时候将其复制回来。*


## Contributing / *帮助开发*

<details>
<summary>
Click to expand / 点击展开
</summary>
If you want to contribute to sd-webui-prompt-all-in-one, welcome to submit issues and pull requests. You can also
contact me via:

*如果你想为 sd-webui-prompt-all-in-one 做出贡献，欢迎提交 issue 和 pull request。同时，你也可以通过以下方式联系我：*

- Email / *邮箱*：physton@163.com
</details>

## Development / *开发方式*

<details>
<summary>
Click to expand / 点击展开
</summary>

- Front-end development (vue) / *前端开发（vue）*
  1. Enter the src directory / *进入 src 目录*：
     
        `cd ./sd-webui-prompt-all-in-one/src`
  
  2. Initialize the node environment / *初始化node环境*：
  
        `npm install`

  3. Modify the code / *修改代码*
  4. Compile / *编译*：
  
        `npm run build`
  
  5. Restart stable-diffusion-webui / *重启 stable-diffusion-webui。*

- Back-end development (python) / *后端开发（python）*
  1. Enter the extension directory / *进入扩展目录*：`cd ./sd-webui-prompt-all-in-one`
  2. Modify the code / *修改代码*
  3. Restart stable-diffusion-webui / *重启 stable-diffusion-webui。*
</details>

## Custom Theme / *自定义主题*

If you need to customize the style theme of this extension, please refer to: 

*如果你需要自定义此扩展的样式主题，请参考：*

> [https://github.com/Physton/sd-webui-prompt-all-in-one/tree/main/styles/extensions](https://github.com/Physton/sd-webui-prompt-all-in-one/tree/main/styles/extensions)

## FAQ / *常见问题列表*

<details>
<summary>
Q: What is the difference between translation interfaces that do not require API keys and those that require API keys?
</summary>

> A: The translation interface that does not require an API key is obtained through crawling and does not require the user to apply for an API key. However, there may be translation failures, instability, slow speed, and lack of support for concurrency. The translation interface that requires an API key calls the API interface of a third-party translation service and requires the user to apply for an API key. However, the translation success rate is relatively high, some interfaces support high concurrency, and the translation speed is fast.
</details>

<details>
<summary>
Q: Unable to use translation service, clicking "Test!" results in "No module named 'xxx'" error message?
</summary>

> A: This is because the dependencies required by webui are not installed properly at startup. You can solve this issue by following these steps:
> 1. Switch to the python/bin directory used by sd-webui.
> 2. Run the following commands:
>    ```
>    ./python -m pip install chardet
>    ./python -m pip install translators
>    ./python -m pip install openai
>    ./python -m pip install boto3
>    ./python -m pip install aliyun-python-sdk-core
>    ./python -m pip install aliyun-python-sdk-alimt
>    ```
> 3. After the installation is complete, restart webui.
</details>

<details>
<summary>
Q: Display error message: "Connection to backend API service failed. Please manually refresh the webpage. If it still doesn't work, please restart the WebUI."
</summary>

> A:
> - You may need to refresh the web page or restart the WebUI.
> - This is because the dependencies required by webui are not installed properly at startup. Please refer to the above installation method for installing modules.
> - Go to the `extensions\sd-webui-prompt-all-in-one\storage` directory, change the encoding of the `history.*.json` and `favorite.*.json` files to UTF-8 encoding, or delete them (remember to backup first).
</details>

<details>
<summary>
Q: Why did the extension install successfully and there were no error outputs in the console, but there is still no extension panel on the webpage?
</summary>

> A: You need to make sure that your WebUI version is `22bcc7b` or higher. If your WebUI version is lower than this, you need to update WebUI.
</details>

<details>
<summary>
Q: Don't need translation services, just want to use it in an offline environment?
</summary>

> A:
> 1. During initialization, the extension will install some translation interface SDK packages, such as `translators`、`openai`、`boto3`、`aliyun-python-sdk-core`、`aliyun-python-sdk-alimt`, etc. If you don't need translation services and don't want to install them, please manually open install.py, delete the code according to the comments in the code. This will not affect the use of the extension. Then uncheck the automatic translation button in the extension settings.
> 2. You can also directly change the local language to English en_US in the extension, which will hide all translation-related buttons. Although the extension will still install these translation interface SDK packages during initialization, they are imported on-demand in the code without using translation services, so they will not be loaded.
</details>

<details>
<summary>
Q: Why isn't the Prompt automatically translated into the local language when pasted in the WebUI, or only partially translated?
</summary>

> When pasting a Prompt in the WebUI, there are usually many keywords. If automatic translation is enabled, it will consume a lot of network requests. Therefore, the extension temporarily does not enable automatic translation of this feature. If needed, please manually click the "Bulk Translate" button.
> 
> If only part of the Prompt is translated, it may be because you have enabled the "tagcomplete" translation enhancement feature in the translation settings. Because this feature does not require network requests, it will translate any matching keywords it can find.
</details>

<details>
<summary>
Q: Why are some translation results "0"?
</summary>

> It may be because you have enabled the "tagcomplete" translation enhancement feature in the translation settings, but you have not selected the correct CSV file. A correct CSV file should have the index number in the first column A, the English words in the second column B, and the translation of your local language in the third column C. If your CSV file format is incorrect, it will result in a translation result of "0".
>
> You can visit [Physton/sd-webui-prompt-all-in-one-assets/tags](https://github.com/Physton/sd-webui-prompt-all-in-one-assets/tree/main/tags) where I have provided a Simplified Chinese CSV file.
>
> After selecting a different CSV file, please click the test button below to check if the translation is correct.
</details>

<details>
<summary>
Q: Why are there two identical buttons under the generate button?
</summary>

![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/paste.png)

> The first button is built into the WebUI. You can paste the Prompt from other sources into the native input box of WebUI or drag and drop an image into it. Clicking this button will automatically fill in the parameters for the input box in the WebUI interface.
> 
> The second button is added by this extension. When you hide the native input box of the WebUI, you cannot paste content into it. In this case, you can click the second button and then paste the content into the popup box. After clicking Submit, it will automatically fill in the parameters for the input box in the WebUI interface. (However, currently, it does not support dragging and dropping images into it.)
</details>

<details>
<summary>
Q: Why do some Lora and LyCORIS keep flashing repeatedly?
</summary>

> This is because your Lora model or LyCORIS model does not exist. The extension will use flashing to remind you.
</details>

<details>
<summary>
Q: Why were there two translation buttons before and now there is only one?
</summary>

> Now in some languages such as Chinese, Japanese, Korean, etc., the system supports automatic recognition of whether you are inputting English or your local language. Therefore, the previous "Translate to English" and "Translate to Local Language" buttons have been merged into one. Whether you input in English or your local language, it will be automatically recognized and translated accordingly.
</details>


<details>
<summary>
Q: Why does this extension not have a version number and update description?
</summary>

> This is because the author is too lazy. This extension has not been online for long, and new features are being developed and bugs are being fixed every day. A large number of update logs are too cumbersome. So please keep updating and explore new features by yourself!
</details>

---

<details>
<summary>
Q: 无需api key的翻译接口和需要api key的翻译接口有什么区别？
</summary>

> A: 无需api key的翻译接口，是通过爬虫获取的，不需要用户自己申请api key，但是可能会存在翻译失败的情况，稳定下差，速度慢，不支持并发。需要api key的翻译接口，是通过调用第三方翻译服务的api接口，需要用户自己申请api key，但是翻译成功率较高，某些接口支持高并发，翻译速度快。
</details>

<details>
<summary>
Q: 无法使用翻译服务，点击“测试”，提示“No module named 'xxx'”？
</summary>

> A: 这是由于webui启动时，没有正确的安装依赖导致的，可以通过以下方式解决：
> 1. 切换到webui所使用的python/bin目录。
> 2. 执行命令：
>    ```
>    ./python -m pip install chardet
>    ./python -m pip install translators
>    ./python -m pip install openai
>    ./python -m pip install boto3
>    ./python -m pip install aliyun-python-sdk-core
>    ./python -m pip install aliyun-python-sdk-alimt
>    ```
> 3. 等待安装完成后，重启webui。
</details>

<details>
<summary>
Q: 显示错误消息："连接到后台接口服务失败，请手动再刷新一次网页。如果还是不行，请重启WebUI"。
</summary>

> A:
> - 你可能需要刷新网页或者重启WebUI。
> - 这是由于WebUI启动时，没有正确的安装依赖，参考上方安装模块的方法。
> - 进入`extensions\sd-webui-prompt-all-in-one\storage`目录，将`history.*.json`和`favorite.*.json`文件编码改为UTF-8编码，或者删除它们（记得先备份）。
</details>

<details>
<summary>
Q: 为什么扩展安装成功了，控制台也没有错误输出，但网页中就是没有扩展的面板？
</summary>

> A: 你需要确保你的WebUI版本是 `22bcc7b（2023年第13周）` 及更高。如果你的WebUI版本低于此版本，你需要更新WebUI。
</details>

<details>
<summary>
Q: 不需要翻译服务，只想在离线环境中使用？
</summary>

> A:
> 1. 扩展在初始化的时候会安装一些翻译接口的SDK包，如`translators`、`openai`、`boto3`、`aliyun-python-sdk-core`、`aliyun-python-sdk-alimt`等等，如果你不需要翻译服务，也不想安装它们，请手动打开`install.py`，根据代码中的注释，删除代码，这并不会影响扩展的使用。然后取消勾选扩展设置中的自动翻译按钮。
> 2. 你也可以直接在扩展中将本地语言改为英文`en_US`，这样所有翻译相关的按钮都将被隐藏。虽然扩展在初始化时还会安装这些翻译接口的SDK包，但它们在代码中都是按需导入的，没有使用翻译服务，它们也不会被加载。
</details>

<details>
<summary>
Q: 为什么在WebUI里粘贴了Prompt，但是没有自动翻译到本地语言，或者只翻译了一部分？
</summary>

> 在WebUI中粘贴了Prompt，一般都是很多关键词，如果自动翻译会消耗很多网络请求，所以扩展暂时不开启这里自动翻译的功能。如果需要，请手动点击一下批量翻译按钮。
> 
> 如果有一部分被翻译了，是因为你在翻译设置中启用了tagcomplete翻译增强功能，因为这个功能不需要网络请求，所以会把能匹配到的关键词翻译好。
</details>

<details>
<summary>
Q: 为什么翻译结果有些是“0”？
</summary>

> 是因为你在翻译设置中启用了tagcomplete翻译增强功能，但是你没有选择正确的CSV文件，一个正确的CSV文件格式应该是，第一列A为索引数字，第二列B为英文单词，第三列C为你的本地语言翻译。如果你的CSV文件格式不对，那么就会出现翻译结果为0的情况。
> 
> 你可以前往[Physton/sd-webui-prompt-all-in-one-assets/tags](https://github.com/Physton/sd-webui-prompt-all-in-one-assets/tree/main/tags)，这里我提供了一份简体中文的CSV文件。
> 
> 在选择了不同的CSV文件后，请点击下方的测试按钮，检查它是否翻译正确。
</details>

<details>
<summary>
Q: 为什么生成按钮下面有两个描述一样的按钮？
</summary>

![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/paste.png)

> 第一个按钮是WebUI自带的，你可以在WebUI原生的输入框中粘贴来自其他地方的Prompt，或者把图片拖动进输入框中。点击这个按钮，就可以自动为WebUI界面中的输入框填写参数。
> 
> 第二个按钮是本插件添加的。你在隐藏了WebUI原生的输入框时，导致无法粘贴内容进去。那么就可以点击第二个按钮，然后在弹出框中粘贴内容，点击Submit后，就可以自动为WebUI界面中的输入框填写参数。（但是目前还不支持拖动图片进去）
</details>

<details>
<summary>
Q: 为什么有些Lora和LyCORIS会不停的闪烁？
</summary>

> 这是因为你的Lora模型或者LyCORIS模型不存在。扩展会用闪烁的方式提醒你。
</details>

<details>
<summary>
Q: 为什么之前有两个翻译按钮，现在还有一个了？
</summary>

> 现在某些语言下，例如中文、日文、韩文等等，支持了自动识别你输入的是英文还是本地语言。所以把之前的翻译到英文、翻译到本地语言两个按钮合并成了一个。不管你输入的是英文还是本地语言，都会自动翻译识别翻译。
</details>

<details>
<summary>
Q: 为什么此扩展没有版本号和更新描述？
</summary>

> 这是因为作者太懒了。此扩展并没有上线多久，每天都在开发新功能和修复BUG。大量的更新日志太过繁琐。所以请你保持常更新，自己探索新功能吧！
</details>

## Donate

Donation list / *捐赠列表*：[DONATE.MD](DONATE.MD)

### Buy me a coffee / *请我喝杯咖啡*

- ko-fi：[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/physton)
- Paypal: [https://paypal.me/physton](https://paypal.me/physton)


- 爱发电：[https://afdian.net/a/physton](https://afdian.net/a/physton)
- 支付宝 `physton@163.com`
- 微信赞赏

    ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/donate-wechat.jpg)

Developed by: https://www.physton.com
