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

sd-webui-prompt-all-in-one는[stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)를 기반으로 한 확장 프로그램으로, 제안어/역제안어 입력란의 사용 경험을 향상시키기 위해 설계되었습니다. 이는 더 직관적이고 강력한 입력 인터페이스 기능을 갖추고 있으며, 자동 번역, 히스토리 기록 및 즐겨찾기 등의 기능을 제공합니다. 또한 다국어를 지원하여 다양한 사용자의 요구를 충족시킬 수 있습니다.

---

<div align="center">

설치 안내, 기능 설명, 사용 방법, 일반적인 문제 해결 방법 등에 대한 자세한 내용은 [문서](https://aiodoc.physton.com/)를 참조하십시오.

</div>

----

> 만약 이 확장 프로그램이 도움이 되었다면, 깃허브에서 별 한 개를 주시면 감사하겠습니다!
> 또한 커피 한 잔 사주실 수도 있습니다: [donate](#기부)

----

## 번역 API 설명

1. `API 키가 필요하지 않음` : 이들은 매우 불안정하며 모든 API가 컴퓨터에서 작동하는 것은 아닙니다. 번역이 실패하면 다른 API로 전환해보세요. ⚠️⚠️⚠️**이슈를 제출하지 마세요!**
2. `API 키가 필요함` : 직접 API 키를 신청해야 합니다. 각 인터페이스의 신청 방법은 해당 인터페이스로 전환하면 해당 신청 안내가 표시됩니다. ⚠️⚠️⚠️**대부분은 `무료`입니다!**
3. `오프라인 번역` : 초기화할 때 언어 모델을 자동으로 다운로드해야 합니다. 네트워크 환경이 좋지 않으면 자동 다운로드와 초기화를 완료할 수 없을 수 있습니다.

## [문서](https://aiodoc.physton.com/)

- [설치](https://aiodoc.physton.com/Installation.html)
- [확장 업데이트 설명](https://aiodoc.physton.com/ExtensionUpdateDescription.html)
- [번역 인터페이스 설명](https://aiodoc.physton.com/TranslationApiConfiguration.html#translation-api-description)
- [개발 도움](https://aiodoc.physton.com/Contributing.html)
- [사용자 정의 테마](https://aiodoc.physton.com/Contributing.html#custom-theme)
- [자주 묻는 질문](https://aiodoc.physton.com/FAQ.html)
- [커피한잔 사주세요](#请我喝杯咖啡)

## 언어 지원

거의 모든 국가 언어를 지원하지만 대부분의 국가에서는 UI 인터페이스가 영어로 표시됩니다. 로컬 언어로 표시하려면 번역 후 PR을 제출할 수 있습니다.

<details>
<summary>UI 지원 언어</summary>
    
`简体中文` `繁體中文` `English` ` Русский` `日本語` `한국어` ` Français` `Deutsch` ` Español` `Português` `Italiano` `العربية`
</details>

<details>
<summary>번역 지원 언어</summary>
    
`简体中文 (中国)` `繁體中文 (中國香港)` `繁体中文 (中國台灣)` `English (US)` `Afrikaans (South Africa)` `Shqip (Shqipëria)` `አማርኛ (ኢትዮጵያ)` `العربية (السعودية)` `Հայերեն (Հայաստան)` `অসমীয়া (ভাৰত)` `Azərbaycan dili (Latın, Azərbaycan)` `বাংলা (বাংলাদেশ)` `Башҡорт (Россия)` `Euskara (Espainia)` `Bosanski (Latinski, Bosna i Hercegovina)` `Български (България)` `Català (Espanya)` `Hrvatski (Hrvatska)` `Čeština (Česká republika)` `Dansk (Danmark)` `درى (افغانستان)` `ދިވެހިބަސް (ދިވެހިރާއްޖެ)` `Nederlands (Nederland)` `Eesti (Eesti)` `Føroyskt (Føroyar)` `vosa Vakaviti (Viti)` `Filipino (Pilipinas)` `Suomi (Suomi)` `Français (France)` `Français (Canada)` `Galego (España)` `ქართული (საქართველო)` `Deutsch (Deutschland)` `Ελληνικά (Ελλάδα)` `ગુજરાતી (ભારત)` `Kreyòl ayisyen (Ayiti)` `עברית (ישראל)` `हिन्दी (भारत)` `Hmong Daw (Latn, United States)` `Magyar (Magyarország)` `Íslenska (Ísland)` `Bahasa Indonesia (Indonesia)` `Inuktitut (Kanatami)` `Inuktitut (Latin, Canada)` `ᐃᓄᒃᑎᑐᑦ (ᑲᓇᑕᒥ)` `Gaeilge (Éire)` `Italiano (Italia)` `日本語 (日本)` `ಕನ್ನಡ (ಭಾರತ)` `Қазақ (Қазақстан)` `ភាសាខ្មែរ (កម្ពុជា)` `Klingon (Latn)` `Klingon (plqaD)` `한국어 (대한민국)` `کوردی (عێراق)` `Kurmancî (Latînî, Tirkiye)` `Кыргызча (Кыргызстан)` `ລາວ (ລາວ)` `Latviešu (Latvija)` `Lietuvių (Lietuva)` `Македонски (Северна Македонија)` `Malagasy (Madagasikara)` `Bahasa Melayu (Latin, Malaysia)` `മലയാളം (ഇന്ത്യ)` `Malti (Malta)` `Māori (Aotearoa)` `मराठी (भारत)` `Монгол (Кирилл, Монгол улс)` `ᠮᠣᠩᠭᠣᠯ ᠤᠯᠤᠰ (ᠨᠢᠭᠡᠳᠦᠯ ᠤᠨᠤᠭ᠎ᠠ)` `မြန်မာ (မြန်မာ)` `नेपाली (नेपाल)` `Norsk bokmål (Norge)` `ଓଡ଼ିଆ (ଭାରତ)` `پښتو (افغانستان)` `فارسی (ایران)` `Polski (Polska)` `Português (Brasil)` `Português (Portugal)` `ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ, ਭਾਰਤ)` `Querétaro Otomi (Latn, México)` `Română (România)` `Русский (Россия)` `Samoan (Latn, Samoa)` `Српски (ћирилица, Србија)` `Srpski (latinica, Srbija)` `Slovenčina (Slovensko)` `Slovenščina (Slovenija)` `Soomaali (Soomaaliya)` `Español (España)` `Kiswahili (Kenya)` `Svenska (Sverige)` `Reo Tahiti (Polynésie française)` `தமிழ் (இந்தியா)` `Татарча (латин, Россия)` `తెలుగు (భారత)` `ไทย (ไทย)` `བོད་ཡིག (རྒྱ་གར།)` `ትግርኛ (ኢትዮጵያ)` `lea fakatonga (Tonga)` `Türkçe (Türkiye)` `Українська (Україна)` `اردو (پاکستان)` `ئۇيغۇرچە (ئۇيغۇرچە، جۇڭگو)` `O'zbekcha (Lotin, O'zbekiston)` `Tiếng Việt (Việt Nam)` `Cymraeg (Y Deyrnas Unedig)` `Yucatec Maya (México)` `isiZulu (iNingizimu Afrika)`
</details>

## 기능

- `직관적인 입력 인터페이스` : 더 직관적이고 강력한 입력 인터페이스 기능을 제공하여 양쪽 언어 대조를 힌트로 표시하여 한눈에 보기 쉽게 합니다.
- `자동 번역` : 힌트 단어/역힌트 단어를 자동으로 번역하며 다국어를 지원합니다.
- `수십 가지 번역 서비스` : 수십 개의 온라인 번역과 오프라인 번역 모델을 제공합니다.
- `다국어 지원` : 거의 모든 국가의 언어를 지원하며 어떤 언어로든 힌트 단어를 입력할 수 있습니다.
- `기록` : 힌트 단어/역힌트 단어가 변경되면 자동으로 기록합니다.
- `즐겨찾기` : 원하는 힌트 단어/역힌트 단어를 한 번에 즐겨찾기로 추가하거나 일괄 즐겨찾기로 추가할 수 있습니다.
- `빠른 조정` : 힌트 단어 위치를 드래그하여 빠르게 조정하고 힌트 단어 가중치를 일괄로 증가/감소시키며 일괄 삭제, 일괄 비활성화, 일괄 번역, 일괄 즐겨찾기 등을 할 수 있습니다.
- `일괄 작업` : 여러 힌트 단어/역힌트 단어를 선택하여 일괄 삭제, 일괄 번역, 일괄 즐겨찾기 등을 할 수 있습니다.
- `ChatGPT` : ChatGPT를 통해 힌트 단어를 자동 생성합니다.
- `힌트 단어 블랙리스트` : 블랙리스트를 설정하여 힌트 단어를 자동으로 필터링합니다.
- `일괄 힌트 단어 추가` : 수천 개의 힌트 단어를 클릭하면 사용할 수 있습니다.
- `키워드 하이라이트` : Lora, LyCORIS, Textual Inversion 하이라이트와 감지 기능을 제공합니다.
- `키워드 사용자 정의 색상` : 다른 유형의 키워드에 대해 사용자 정의 색상을 지정할 수 있습니다.
- `사용자 정의 테마` : 사용자 정의 테마와 확장 스타일을 지정할 수 있습니다.
- `......` 더 많은 기능을 찾아보세요.

## 데모

- [언어 전환](https://aiodoc.physton.com/LanguageSelection.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.switch_language.gif)

- [번역 API 설정](https://aiodoc.physton.com/TranslationApiConfiguration.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate_setting.gif)

- [콘텐츠 표시/접기](https://aiodoc.physton.com/OtherFeatures.html#show-collapse-the-extension-panel)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.fold.gif)

- [WebUI 입력 상자 표시/숨기기](https://aiodoc.physton.com/OtherFeatures.html#show-hide-the-webui-input-box)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.show_input.gif)

- [자동 번역](https://aiodoc.physton.com/AutomaticTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.auto_translate.gif)

- [일괄 번역](https://aiodoc.physton.com/BatchTranslation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.translate.gif)

- [우아한 입력](https://aiodoc.physton.com/KeywordInputBox.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.elegant_input.gif)

- [빠른 조정](https://aiodoc.physton.com/ListOfKeywords.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.quick_adjust.gif)

- [즐겨찾기와 기록](https://aiodoc.physton.com/History.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.history_favorite.gif)

- [ChatGPT를 사용하여 힌트 생성](https://aiodoc.physton.com/UsingChatgptToGeneratePrompts.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.chatgpt.gif)

- [WebUI 입력 상자에서 작성](https://aiodoc.physton.com/WritingInWebUIInputBox.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.writing_webui.gif)

- [a1111-sd-webui-tagcomplete 지원](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.tagcomplete.gif)

- [Lora, LyCORIS, Textual Inversion 하이라이트와 감지](https://aiodoc.physton.com/ListOfKeywords.html#highlight-keyword)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.keyword_detection.gif)

- [힌트 형식](https://aiodoc.physton.com/FormatOfPrompts.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.prompt_format.gif)

- [일괄 작업](https://aiodoc.physton.com/BatchOperation.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.batch_operation.gif)

- [사용자 정의 테마/확장 스타일](https://aiodoc.physton.com/ThemeStyle.html)

  ![](https://s1.imagehub.cc/images/2023/06/06/demo.custom_theme.gif)

- [일괄 힌트 단어 추가](https://aiodoc.physton.com/GroupTags.html)

  ![](https://s1.imagehub.cc/images/2023/08/15/demo.group_tags.gif)

## 기부

[기부 목록](https://aiodoc.physton.com/Donate.html)

### 커피 한 잔 사주세요

| ko-fi (EN) | [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/physton) |
|:-----------:| :----: |
| Paypal (EN) | [https://paypal.me/physton](https://paypal.me/physton) |
| 爱发电 (CN) | [https://afdian.net/a/physton/thank](https://afdian.net/a/physton/thank) |
| 支付宝 (CN) | ![](https://s1.imagehub.cc/images/2023/07/05/alipay.jpeg) |
| 微信赞赏 (CN) | ![](https://s1.imagehub.cc/images/2023/07/05/wechat.jpeg) |