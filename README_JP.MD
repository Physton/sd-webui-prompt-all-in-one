# sd-webui-prompt-all-in-one

[![GitHub stars](https://img.shields.io/github/stars/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/issues)
[![GitHub issues closed](https://img.shields.io/github/issues-closed/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub license](https://img.shields.io/github/license/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/blob/master/LICENSE.md)
[![GitHub commits](https://img.shields.io/github/last-commit/Physton/sd-webui-prompt-all-in-one?style=flat-square)](https://github.com/Physton/sd-webui-prompt-all-in-one/commits/main)
[![Netlify Status](https://api.netlify.com/api/v1/badges/1441a696-a1a4-4ad7-b520-4abfd96acc76/deploy-status)](https://app.netlify.com/sites/aiodoc/deploys)

<div align="center">

### [🇺🇸 English](README.MD) | [🇷🇺 Русский](README_RU.MD) | [🇨🇳 简体中文](README_CN.MD) | [🇯🇵 日本語](README_JP.MD) | [🇰🇷 한국어](README_KR.MD) | [🇨🇳 繁體中文](README_TW.MD)

</div>

sd-webui-prompt-all-in-oneは、[stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)を基にした拡張機能であり、提示語/逆提示語の入力ボックスの使用体験を向上させることを目的としています。より直感的で強力な入力インターフェース機能を備えており、自動翻訳、履歴記録、お気に入りなどの機能を提供しています。さまざまな言語に対応しており、さまざまなユーザーのニーズに応えることができます。

---

<div align="center">

インストール手順、機能の詳細、使用方法、よくある質問などについては、[ドキュメント](https://aiodoc.physton.com/)をご参照ください。

</div>

----

もし拡張機能が役に立つと思った場合は、GitHubでスターをつけていただけると嬉しいです！また、コーヒーをご馳走いただける場合は、[寄付](#寄付)をお願いします。

----

## 翻訳APIの説明

1. `API KEYは必要ありません`：これらは非常に不安定であり、すべてのAPIがあなたのコンピュータで使用できるわけではありません。翻訳に失敗した場合は、他のAPIに切り替えてみてください。⚠️⚠️⚠️**問題を提出しないでください！**
2. `API KEYが必要です`：API KEYを個別に申請する必要があります。異なるインターフェースの申請方法は、対応するインターフェースに切り替えた後、対応する申請チュートリアルが表示されます。⚠️⚠️⚠️**ほとんどの場合、これらは `無料` です！**
3. `オフライン翻訳`：初期化時に言語モデルを自動でダウンロードする必要があります。ネットワーク環境が悪い場合、自動ダウンロードと初期化が完了しない可能性があります。

## [ドキュメント](https://aiodoc.physton.com/)

- [インストール](https://aiodoc.physton.com/Installation.html)
- [拡張機能の更新説明](https://aiodoc.physton.com/ExtensionUpdateDescription.html)
- [翻訳APIの設定](https://aiodoc.physton.com/TranslationApiConfiguration.html#translation-api-description)
- [開発のサポート](https://aiodoc.physton.com/Contributing.html)
- [カスタムテーマ](https://aiodoc.physton.com/Contributing.html#custom-theme)
- [よくある質問](https://aiodoc.physton.com/FAQ.html)
- [コーヒーをおごってください](#コーヒーをおごってください)

## 言語サポート

ほぼすべての国の言語に対応していますが、ほとんどの国のUIインターフェースは英語で表示されます。ローカライズされた言語を表示するには、翻訳してPRを提出することができます。

<details>
<summary>UIサポートされている言語</summary>
    
`简体中文` `繁體中文` `English` ` Русский` `日本語` `한국어` ` Français` `Deutsch` ` Español` `Português` `Italiano` `العربية`
</details>

<details>
<summary>翻訳サポートされている言語</summary>
    
`简体中文 (中国)` `繁體中文 (中國香港)` `繁体中文 (中國台灣)` `English (US)` `Afrikaans (South Africa)` `Shqip (Shqipëria)` `አማርኛ (ኢትዮጵያ)` `العربية (السعودية)` `Հայերեն (Հայաստան)` `অসমীয়া (ভাৰত)` `Azərbaycan dili (Latın, Azərbaycan)` `বাংলা (বাংলাদেশ)` `Башҡорт (Россия)` `Euskara (Espainia)` `Bosanski (Latinski, Bosna i Hercegovina)` `Български (България)` `Català (Espanya)` `Hrvatski (Hrvatska)` `Čeština (Česká republika)` `Dansk (Danmark)` `درى (افغانستان)` `ދިވެހިބަސް (ދިވެހިރާއްޖެ)` `Nederlands (Nederland)` `Eesti (Eesti)` `Føroyskt (Føroyar)` `vosa Vakaviti (Viti)` `Filipino (Pilipinas)` `Suomi (Suomi)` `Français (France)` `Français (Canada)` `Galego (España)` `ქართული (საქართველო)` `Deutsch (Deutschland)` `Ελληνικά (Ελλάδα)` `ગુજરાતી (ભારત)` `Kreyòl ayisyen (Ayiti)` `עברית (ישראל)` `हिन्दी (भारत)` `Hmong Daw (Latn, United States)` `Magyar (Magyarország)` `Íslenska (Ísland)` `Bahasa Indonesia (Indonesia)` `Inuktitut (Kanatami)` `Inuktitut (Latin, Canada)` `ᐃᓄᒃᑎᑐᑦ (ᑲᓇᑕᒥ)` `Gaeilge (Éire)` `Italiano (Italia)` `日本語 (日本)` `ಕನ್ನಡ (ಭಾರತ)` `Қазақ (Қазақстан)` `ភាសាខ្មែរ (កម្ពុជា)` `Klingon (Latn)` `Klingon (plqaD)` `한국어 (대한민국)` `کوردی (عێراق)` `Kurmancî (Latînî, Tirkiye)` `Кыргызча (Кыргызстан)` `ລາວ (ລາວ)` `Latviešu (Latvija)` `Lietuvių (Lietuva)` `Македонски (Северна Македонија)` `Malagasy (Madagasikara)` `Bahasa Melayu (Latin, Malaysia)` `മലയാളം (ഇന്ത്യ)` `Malti (Malta)` `Māori (Aotearoa)` `मराठी (भारत)` `Монгол (Кирилл, Монгол улс)` `ᠮᠣᠩᠭᠣᠯ ᠤᠯᠤᠰ (ᠨᠢᠭᠡᠳᠦᠯ ᠤᠨᠤᠭ᠎ᠠ)` `မြန်မာ (မြန်မာ)` `नेपाली (नेपाल)` `Norsk bokmål (Norge)` `ଓଡ଼ିଆ (ଭାରତ)` `پښتو (افغانستان)` `فارسی (ایران)` `Polski (Polska)` `Português (Brasil)` `Português (Portugal)` `ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ, ਭਾਰਤ)` `Querétaro Otomi (Latn, México)` `Română (România)` `Русский (Россия)` `Samoan (Latn, Samoa)` `Српски (ћирилица, Србија)` `Srpski (latinica, Srbija)` `Slovenčina (Slovensko)` `Slovenščina (Slovenija)` `Soomaali (Soomaaliya)` `Español (España)` `Kiswahili (Kenya)` `Svenska (Sverige)` `Reo Tahiti (Polynésie française)` `தமிழ் (இந்தியா)` `Татарча (латин, Россия)` `తెలుగు (భారత)` `ไทย (ไทย)` `བོད་ཡིག (རྒྱ་གར།)` `ትግርኛ (ኢትዮጵያ)` `lea fakatonga (Tonga)` `Türkçe (Türkiye)` `Українська (Україна)` `اردو (پاکستان)` `ئۇيغۇرچە (ئۇيغۇرچە، جۇڭگو)` `O'zbekcha (Lotin, O'zbekiston)` `Tiếng Việt (Việt Nam)` `Cymraeg (Y Deyrnas Unedig)` `Yucatec Maya (México)` `isiZulu (iNingizimu Afrika)`
</details>

## 特徴

- `直感的な入力インターフェース`：直感的で強力な入力インターフェース機能を提供し、提示語のバイリンガル表示で一目瞭然です。
- `自動翻訳`：提示語/逆提示語を自動的に翻訳し、多言語に対応しています。
- `数十種類の翻訳サービス`：数十種類のオンライン翻訳サービスとオフライン翻訳モデルがあります。
- `多言語対応`：世界のほとんどの国の言語に対応しており、任意の言語で提示語を入力できます。
- `履歴記録`：提示語/逆提示語の変更があった場合、自動的に記録されます。
- `お気に入りリスト`：お気に入りの提示語/逆提示語をワンクリックで追加および一括追加できます。
- `素早い調整`：提示語の位置をドラッグして素早く調整したり、ワンクリックで提示語の重みを増減したり、ワンクリックで削除、無効化、翻訳、お気に入りに追加などができます。
- `一括操作`：複数の提示語/逆提示語を選択してワンクリックで削除、翻訳、お気に入りに追加などができます。
- `ChatGPT`：ChatGPTを使用して提示語をインテリジェントに生成します。
- `提示語のブラックリスト`：ブラックリストを設定して、提示語を自動的にフィルタリングします。
- `ワンクリックで提示語を追加`：数千の提示語があり、クリックするだけで使用できます。
- `キーワードのハイライト`：Lora、LyCORIS、Textual Inversionのハイライトと検出が可能です。
- `キーワードのカスタムカラー`：異なる種類のキーワードに異なる色を自由に設定できます。
- `カスタムテーマ`：テーマと拡張スタイルをカスタマイズできます。
- `......` さらに多くの機能があります。

## デモ

- [言語の切り替え](https://aiodoc.physton.com/LanguageSelection.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.switch_language.gif)

- [翻訳APIの設定](https://aiodoc.physton.com/TranslationApiConfiguration.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate_setting.gif)

- [コンテンツの表示/折りたたみ](https://aiodoc.physton.com/OtherFeatures.html#show-collapse-the-extension-panel)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.fold.gif)

- [WebUI入力ボックスの表示/非表示](https://aiodoc.physton.com/OtherFeatures.html#show-hide-the-webui-input-box)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.show_input.gif)

- [自動翻訳](https://aiodoc.physton.com/AutomaticTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.auto_translate.gif)

- [ワンクリック翻訳](https://aiodoc.physton.com/BatchTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate.gif)

- [エレガントな入力](https://aiodoc.physton.com/KeywordInputBox.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.elegant_input.gif)

- [素早い調整](https://aiodoc.physton.com/ListOfKeywords.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.quick_adjust.gif)

- [お気に入りと履歴記録](https://aiodoc.physton.com/History.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.history_favorite.gif)

- [ChatGPTを使用したプロンプト生成](https://aiodoc.physton.com/UsingChatgptToGeneratePrompts.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.chatgpt.gif)

- [WebUIの入力ボックスでの記述](https://aiodoc.physton.com/WritingInWebUIInputBox.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.writing_webui.gif)

- [a1111-sd-webui-tagcompleteのサポート](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.tagcomplete.gif)

- [Lora、LyCORIS、Textual Inversionのハイライトと検出](https://aiodoc.physton.com/ListOfKeywords.html#highlight-keyword)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.keyword_detection.gif)

- [プロンプトのフォーマット](https://aiodoc.physton.com/FormatOfPrompts.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.prompt_format.gif)

- [一括操作](https://aiodoc.physton.com/BatchOperation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.batch_operation.gif)

- [カスタムテーマ/スタイルの設定](https://aiodoc.physton.com/ThemeStyle.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.custom_theme.gif)

- [キーワードの一括追加](https://aiodoc.physton.com/GroupTags.html)

  ![](https://s1.imagehub.cc/images/2023/08/15/demo.group_tags.gif)

## 寄付

[寄付リスト](https://aiodoc.physton.com/Donate.html)

### コーヒーをおごってください

| ko-fi (EN) | [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/physton) |
|:-----------:| :----: |
| Paypal (EN) | [https://paypal.me/physton](https://paypal.me/physton) |
| 爱发电 (CN) | [https://afdian.net/a/physton/thank](https://afdian.net/a/physton/thank) |
| 支付宝 (CN) | ![](https://s1.imagehub.cc/images/2023/07/05/alipay.jpeg) |
| 微信赞赏 (CN) | ![](https://s1.imagehub.cc/images/2023/07/05/wechat.jpeg) |