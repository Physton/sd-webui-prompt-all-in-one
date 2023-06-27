# sd-webui-prompt-all-in-one

[![GitHub звезды](https://img.shields.io/github/stars/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/stargazers)
[![GitHub вилки](https://img.shields.io/github/forks/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/network/members)
[![GitHub вопросы](https://img.shields.io/github/issues/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/issues)
[![GitHub закрытые вопросы](https://img.shields.io/github/issues-closed/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub лицензия](https://img.shields.io/github/license/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/blob/master/LICENSE.md)
[![GitHub коммиты](https://img.shields.io/github/last-commit/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/commits/main)
[![Netlify Статус](https://api.netlify.com/api/v1/badges/1441a696-a1a4-4ad7-b520-4abfd96acc76/deploy-status)](https://app.netlify.com/sites/aiodoc/deploys)

<div align="center">

### [🇺🇸 English](README.MD) | [🇷🇺 Русский](README_RU.MD) | [🇨🇳 简体中文](README_CN.MD) | [🇨🇳 繁體中文](README_TW.MD)

</div>

sd-webui-prompt-all-in-one - это расширение, основанное на [stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui), которое предназначено для улучшения опыта использования полей ввода подсказок/обратных подсказок. Оно имеет более интуитивный и мощный функционал интерфейса ввода, предоставляет функции автоматического перевода, истории и избранного, поддерживает несколько языков и удовлетворяет потребностям разных пользователей.

---

<div align="center">

### Инструкции по установке, подробное описание функций, инструкции по использованию, часто задаваемые вопросы и т.д. см.: [Документация](https://aiodoc.physton.com/ru/).

</div>

----

> Если вам понравилось это расширение, пожалуйста, поставьте звезду на GitHub!
> Вы также можете угостить меня чашкой кофе: [donate](#пожертвования)

----

## Описание API перевода

1. `API-ключ не требуется`: они очень нестабильны и не все API могут быть использованы на вашем компьютере. Если перевод не удался, попробуйте переключиться на другое API, ⚠️⚠️⚠️**не создавайте issue!**
2. `API-ключ необходим`: необходимо получить API KEY самостоятельно. После переключения на соответствующий интерфейс появится инструкция по его получению. ⚠️⚠️⚠️**Они в основном `бесплатны`!**
3. `Офлайн-перевод`: при инициализации необходимо автоматически загрузить языковую модель. Если у вас плохое интернет-соединение, может быть невозможно выполнить автоматическую загрузку и инициализацию.

## [Документация](https://aiodoc.physton.com/ru/)

- [Установка](https://aiodoc.physton.com/ru/Installation.html)
- [Описание обновлений расширения](https://aiodoc.physton.com/ru/ExtensionUpdateDescription.html)
- [Описание API перевода](https://aiodoc.physton.com/ru/TranslationApiConfiguration.html#описание-интерфеиса-перевода)
- [Помощь в разработке](https://aiodoc.physton.com/ru/Contributing.html)
- [Настройка пользовательской темы](https://aiodoc.physton.com/ru/Contributing.html#ннастроика-темы)
- [Часто задаваемые вопросы](https://aiodoc.physton.com/ru/FAQ.html)
- [Угостить меня чашкой кофе](#пожертвования)

## Поддерживаемые языки

Поддержка перевода практически на всех языках мира, но большинство интерфейсов пользователя отображаются на английском языке. Если вам нужна локализация на ваш язык, вы можете перевести и предоставить PR.

`简体中文` `繁體中文` `English` ` Русский` `日本語` `한국어` ` Français` `Deutsch` ` Español` `Português` `Italiano` `العربية`

## Демонстрация

- [Переключение языка](https://aiodoc.physton.com/ru/LanguageSelection.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.switch_language.gif)

- [Настройка API перевода](https://aiodoc.physton.com/ru/TranslationApiConfiguration.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate_setting.gif)

- [Отображение/скрытие контента](https://aiodoc.physton.com/ru/OtherFeatures.html#показать-скрыть-расширенную-панель)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.fold.gif)

- [Отображение/скрытие поля ввода WebUI](https://aiodoc.physton.com/ru/OtherFeatures.html#показать-скрыть-поле-ввода-webui)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.show_input.gif)

- [Автоматический перевод](https://aiodoc.physton.com/ru/AutomaticTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.auto_translate.gif)

- [Однокнопочный перевод](https://aiodoc.physton.com/ru/BatchTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate.gif)

- [Элегантный ввод](https://aiodoc.physton.com/ru/KeywordInputBox.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.elegant_input.gif)

- [Быстрая настройка](https://aiodoc.physton.com/ru/ListOfKeywords.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.quick_adjust.gif)

- [Избранное и история](https://aiodoc.physton.com/ru/History.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.history_favorite.gif)

- [Генерация подсказок с помощью ChatGPT](https://aiodoc.physton.com/ru/UsingChatgptToGeneratePrompts.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.chatgpt.gif)

- [Написание в поле ввода WebUI](https://aiodoc.physton.com/ru/WritingInWebUIInputBox.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.writing_webui.gif)

- Поддержка[a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.tagcomplete.gif)

- [Подсветка и обнаружение ключевых слов Lora, LyCORIS и Textual Inversion](https://aiodoc.physton.com/ru/ListOfKeywords.html#подсветка-ключевых-слов)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.keyword_detection.gif)

- [Формат подсказок](https://aiodoc.physton.com/ru/FormatOfPrompts.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.prompt_format.gif)

- [Массовые операции]https://aiodoc.physton.com/ru/BatchTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.batch_operation.gif)

- [Настройка пользовательской темы/стиля расширения](https://aiodoc.physton.com/ru/ThemeStyle.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.custom_theme.gif)

## Пожертвования

[Список пожертвований](https://aiodoc.physton.com/ru/Donate.html)

### Угостить меня чашкой кофе

| ko-fi | [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/physton) |
| :---: | :---: |
| Paypal | [https://paypal.me/physton](https://paypal.me/physton) |
| 爱发电 | [https://afdian.net/a/physton](https://afdian.net/a/physton) |
| 支付宝 | `physton@163.com` |
| 微信赞赏 | ![](https://s1.imagehub.cc/images/2023/06/06/donate-wechat.jpeg) |