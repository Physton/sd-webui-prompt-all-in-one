# sd-webui-prompt-all-in-one

[![GitHub stars](https://img.shields.io/github/stars/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/issues)
[![GitHub license](https://img.shields.io/github/license/Physton/sd-webui-prompt-all-in-one?style=plastic)](https://github.com/Physton/sd-webui-prompt-all-in-one/blob/master/LICENSE.md)

sd-webui-prompt-all-in-one is an extension based on [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) that aims to improve the user experience of the prompt/negative prompt input box. It has a more intuitive and powerful input interface, provides automatic translation, history and collection functions, and supports multiple languages to meet the needs of different users.

*sd-webui-prompt-all-in-one 是一个基于 [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) 的扩展，旨在提高提示词/反向提示词输入框的使用体验。它拥有更直观、强大的输入界面功能，它提供了自动翻译、历史记录和收藏等功能，它支持多种语言，满足不同用户的需求。*

---

The localized language interface is currently available in `中文` `English` ` Русский` `日本語` `한국어` ` Français` `Deutsch` ` Español` `Português` `Italiano` `العربية`, and the translation
function supports the majority of countries worldwide.

目前支持以下语言的本地化语言界面：`中文` `English` ` Русский` `日本語` `한국어` ` Français` `Deutsch` ` Español` `Português` `Italiano` `العربية`，翻译功能支持目前世界上绝大多数国家。


> If you find this extension helpful, please give me a star on Github!
> You could also buy me a coffee: [donate](#donate)

> 如果你觉得这个扩展有帮助，请在Github上给我一颗星！
> 你也可以请我喝杯咖啡: [donate](#donate)

- [Demo / *演示*](#demo--演示)
- [Installation and Usage / *安装使用*](#installation-and-usage--安装使用)
- [Contributing / *帮助开发*](#contributing--帮助开发)
- [Development / *开发方式*](#development--开发方式)
- [FAQ / *常见问题列表*](#faq--常见问题列表)
- [Donate / *捐赠*](#Donate)

## Demo / *演示*

- Switch language / *切换语言*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/switch_language.png)


- Translation API settings / *翻译API设置*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/translate_setting.gif)

- Show/Hide content / *显示/折叠内容*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/fold.gif)

- Show/Hide the WebUI input box / *显示/隐藏WebUI输入框*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/show_input.gif)

- Automatic translation / *自动翻译*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/auto_translate.gif)

- One-click translation / *一键翻译*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/translate.gif)

- Concise input / *简洁的输入*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/concise_input.gif)

- Elegant input / *优雅的输入*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/elegant_input.gif)

- Quick adjustment / *快速调整*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/quick_adjust.gif)

- Favorite and History / *收藏和历史记录*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/history_favorite.gif)

- Writing in WebUI input box / *在WebUI的输入框中编写*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/writing_webui.gif)

- Support for [a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete) / *支持[a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/tagcomplete.gif)

- Use `danbooru.csv` in `a1111-sd-webui-tagcomplete` to enhance the translation function / *使用 `a1111-sd-webui-tagcomplete` 中的 `danbooru.csv` 增强翻译功能*

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/tagcomplete_setting.png)

  ![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/tagcomplete_translate.gif)

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

- ### Method 2 / *方式二*：

  In the extension tab of stable-diffusion-webui, select "Install from URL", enter `https://github.com/Physton/sd-webui-prompt-all-in-one.git`, and click on install.

  *在 stable-diffusion-webui 的扩展选项卡中，选择从网址安装，输入 `https://github.com/Physton/sd-webui-prompt-all-in-one.git`, 然后点击安装。*

- ### Method 3 / *方式三*：

  In the extensions tab of stable-diffusion-webui, load the official online extension library, find `sd-webui-prompt-all-in-one`, and click Install.

  *在 stable-diffusion-webui 的扩展选项卡中，加载官方在线扩展库，找到`sd-webui-prompt-all-in-one`，点击安装*


- ### Method 4 (Not recommended) / *方式四（不推荐）*：
  Download the source code package of sd-webui-prompt-all-in-one, and unzip it to the extensions directory of stable-diffusion-webui.

  *下载 sd-webui-prompt-all-in-one 的源码压缩包，解压到 stable-diffusion-webui 的 extensions 目录下。*

### Restart stable-diffusion-webui. (Not Reload WebUI)

   *重启 stable-diffusion-webui。（不是Reload重载WebUI）*


## Contributing / *帮助开发*

If you want to contribute to sd-webui-prompt-all-in-one, welcome to submit issues and pull requests. You can also
contact me via:

*如果你想为 sd-webui-prompt-all-in-one 做出贡献，欢迎提交 issue 和 pull request。同时，你也可以通过以下方式联系我：*

- Email / *邮箱*：physton@163.com

## Development / *开发方式*

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

## FAQ / *常见问题列表*

### Q: What is the difference between translation interfaces that do not require API keys and those that require API keys?

A: The translation interface that does not require an API key is obtained through crawling and does not require the user to apply for an API key. However, there may be translation failures, instability, slow speed, and lack of support for concurrency. The translation interface that requires an API key calls the API interface of a third-party translation service and requires the user to apply for an API key. However, the translation success rate is relatively high, some interfaces support high concurrency, and the translation speed is fast.

### Q: Unable to use translation service, clicking "Test!" results in "No module named 'xxx'" error message?

A: This is because the dependencies required by webui are not installed properly at startup. You can solve this issue by following these steps:

1. Switch to the python/bin directory used by sd-webui.
2. Run the following commands:
   ```
   ./python -m pip install chardet
   ./python -m pip install translators
   ./python -m pip install openai
   ./python -m pip install boto3
   ./python -m pip install aliyun-python-sdk-core
   ./python -m pip install aliyun-python-sdk-alimt
   ./python -m pip install tencentcloud-sdk-python
   ```
3. After the installation is complete, restart webui.

### Q: Display error message: "Connection to backend API service failed. Please manually refresh the webpage. If it still doesn't work, please restart the WebUI."

- You may need to refresh the web page or restart the WebUI.

- This is because the dependencies required by webui are not installed properly at startup. Please refer to the above installation method for installing modules.

- Go to the `extensions\sd-webui-prompt-all-in-one\storage` directory, change the encoding of the `history.*.json` and `favorite.*.json` files to UTF-8 encoding, or delete them (remember to backup first).

### Q: 无需api key的翻译接口和需要api key的翻译接口有什么区别？

A: 无需api key的翻译接口，是通过爬虫获取的，不需要用户自己申请api key，但是可能会存在翻译失败的情况，稳定下差，速度慢，不支持并发。需要api key的翻译接口，是通过调用第三方翻译服务的api接口，需要用户自己申请api key，但是翻译成功率较高，某些接口支持高并发，翻译速度快。

### Q: 无法使用翻译服务，点击“Test!”，提示“No module named 'xxx'”？

A: 这是由于webui启动时，没有正确的安装依赖导致的，可以通过以下方式解决：
1. 切换到webui所使用的python/bin目录。
2. 执行命令：
   ```
   ./python -m pip install chardet
   ./python -m pip install translators
   ./python -m pip install openai
   ./python -m pip install boto3
   ./python -m pip install aliyun-python-sdk-core
   ./python -m pip install aliyun-python-sdk-alimt
   ./python -m pip install tencentcloud-sdk-python
   ```
3. 等待安装完成后，重启webui。

### Q: 显示错误消息："连接到后台接口服务失败，请手动再刷新一次网页。如果还是不行，请重启WebUI"。

- 你可能需要刷新网页或者重启WebUI。

- 这是由于WebUI启动时，没有正确的安装依赖，参考上方安装模块的方法。

- 进入`extensions\sd-webui-prompt-all-in-one\storage`目录，将`history.*.json`和`favorite.*.json`文件编码改为UTF-8编码，或者删除它们（记得先备份）。

## Donate

Donation list / *捐赠列表*：[DONATE.MD](DONATE.MD)

### Buy me a coffee / *请我喝杯咖啡*

#### BTC-Bitcoin `3LdXwHkkVsspQzgowdy3pymwty9LiFBHda`

#### ETH-Ethereum `3DbapbGRQdbrDqBazBPYWfyKjbM5uN2SDy`

#### USDT-ERC20 `0xb8b7a067c5639e7befb9665be9bd00a4c75b6614`

#### USDT-TRC20 `TWtnKQgSTpHu1eiQGrppSniGyzYtggZYFf`

#### Paypal `physton@163.com`

#### Alipay / 支付宝 `physton@163.com`

#### Wechat / 微信赞赏

![](https://raw.githubusercontent.com/Physton/sd-webui-prompt-all-in-one-assets/main/images/donate-wechat.jpg)

Developed by: https://www.physton.com
