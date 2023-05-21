# English：

## Guide to Developing Extension Styles

- Each extension style is a separate folder.
- The extension style folder must contain a `manifest.json` file, which provides basic information about the extension style.
- The extension style folder must contain a `style.min.css` file. The `style.min.css` file is the main file of the extension style, and other `*.css` files will be ignored.
- If you need to load images in CSS files, you can use the `/physton_prompt/styles?file=extensions/扩展文件夹名/图片文件名` URL format to load them.
- There is a `demo.zip` file in the current directory that you can refer to.

## `manifest.json` Format

```json
{
  "name": "Move the keyword input box to the left",
  "i18n": {
    "zh_CN": "移动关键词输入框到左侧",
    "zh_HK": "移動關鍵字輸入框到左側",
    "zh_TW": "移動關鍵字輸入框到左側"
  },
  "author": "Physton",
  "type": "enhance"
}
```

- `name` The English name of the extension style, which must be included.
- `i18n` The multilingual name(s) of the extension style, which can be absent or multiple. The language codes are available in the `i18n.json` file in the root directory of the extension.
- `author` The author of the extension style, which can be absent.
- `type` The type of the extension style. The value can be `enhance` or `theme`.

---

# 简体中文：

## 扩展样式开发说明
- 每个扩展样式都是一个独立的文件夹。
- 扩展样式文件夹下必须包含一个`manifest.json`文件，用于说明扩展样式的基本信息。
- 扩展样式文件夹下必须包含一个`style.min.css`文件。`style.min.css`文件是扩展样式的主文件，其他`*.css`文件都将被忽略。
- 在css文件中如果需要加载图片，可以使用`/physton_prompt/styles?file=extensions/扩展文件夹名/图片文件名`的URL方式加载。
- 在当前文件中有一份`demo.zip`文件，可以用于参考。

## `manifest.json` 格式

```json
{
  "name": "Move the keyword input box to the left",
  "i18n": {
    "zh_CN": "移动关键词输入框到左侧",
    "zh_HK": "移動關鍵字輸入框到左側",
    "zh_TW": "移動關鍵字輸入框到左側"
  },
  "author": "Physton",
  "type": "enhance"
}
```
- `name` 扩展样式的英文名称，必须包含。
- `i18n` 扩展样式的多语言名称，可以没有，可以为多个。国家语言代码见扩展根目录的 `i18n.json` 文件。
- `author` 扩展样式的作者，可以没有。
- `type` 扩展样式的类型。值可以为 `enhance`：增强 或 `theme`：主题。