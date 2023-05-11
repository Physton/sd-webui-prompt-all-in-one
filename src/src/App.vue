<template>
    <div>
        <block v-for="(item) in prompts" :key="item.name">
            <physton-prompt v-if="item.$textarea" :id="item.id" :ref="item.id" :name="item.name"
                            :neg="item.neg" :textarea="item.$textarea" :steps="item.$steps"
                            v-model:language-code="languageCode"
                            :translate-apis="translateApis" :languages="languages"
                            :history-key="item.historyKey" :favorite-key="item.favoriteKey"
                            v-model:auto-translate-to-english="autoTranslateToEnglish"
                            v-model:auto-translate-to-local="autoTranslateToLocal"
                            v-model:hide-default-input="hideDefaultInput"
                            v-model:enable-tooltip="enableTooltip"
                            v-model:translate-api="translateApi"
                            :translate-api-config="translateApiConfig"
                            @click:translate-api="onTranslateApiClick"
                            @click:select-language="onSelectLanguageClick"></physton-prompt>
        </block>
        <translate-setting ref="translateSetting" v-model:language-code="languageCode"
                           :translate-apis="translateApis" :languages="languages"
                           v-model:translate-api="translateApi"></translate-setting>
        <select-language ref="selectLanguage" v-model:language-code="languageCode"
                         :translate-apis="translateApis"
                         :languages="languages"
                         v-model:translate-api="translateApi"></select-language>

        <div class="physton-paste-popup" v-if="showPastePopup" @click="closePastePopup">
            <div class="paste-popup-main" @click.stop>
                <div class="paste-popup-close" @click="closePastePopup">
                    <icon-close width="24" height="24"></icon-close>
                </div>
                <div class="paste-popup-title">{{ pasteTitle }}</div>
                <div class="paste-popup-body">
                    <textarea class="paste-content" v-model="pasteContent" :placeholder="getLang('please_enter_the_content_here')"></textarea>
                    <div v-if="!pasteLoading" class="paste-submit" @click="onClickPasteSubmit">Submit</div>
                    <div v-else class="paste-submit">
                        <icon-loading width="24" height="24"></icon-loading>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import PhystonPrompt from "./components/phystonPrompt.vue"
import TranslateSetting from "@/components/translateSetting.vue";
import common from "@/utils/common";
import IconClose from "@/components/icons/iconClose.vue";
import IconLoading from "@/components/icons/iconLoading.vue";
import SelectLanguage from "@/components/selectLanguage.vue";

export default {
    name: 'App',
    components: {
        SelectLanguage,
        IconLoading,
        IconClose,
        TranslateSetting,
        PhystonPrompt,
    },
    mixins: [],
    data() {
        return {
            prompts: [
                {
                    tab: 'tab_txt2img',
                    prompt: 'txt2img_prompt',
                    counter: 'txt2img_token_counter',
                    button: 'txt2img_token_button',
                    steps: 'txt2img_steps',
                    historyKey: 'txt2img',
                    history: [],
                    favoriteKey: 'txt2img',
                    favorite: [],
                    $prompt: null,
                    $textarea: null,
                    $steps: null,
                    name: 'txt2img_prompt',
                    neg: false,
                    id: 'phystonPrompt_txt2img_prompt'
                },
                {
                    tab: 'tab_txt2img',
                    prompt: 'txt2img_neg_prompt',
                    counter: 'txt2img_negative_token_counter',
                    button: 'txt2img_negative_token_button',
                    steps: 'txt2img_steps',
                    historyKey: 'txt2img_neg',
                    history: [],
                    favoriteKey: 'txt2img_neg',
                    favorite: [],
                    $prompt: null,
                    $textarea: null,
                    $steps: null,
                    name: 'txt2img_neg_prompt',
                    neg: true,
                    id: 'phystonPrompt_txt2img_neg_prompt'
                },
                {
                    tab: 'tab_img2img',
                    prompt: 'img2img_prompt',
                    counter: 'img2img_token_counter',
                    button: 'img2img_token_button',
                    steps: 'img2img_steps',
                    historyKey: 'img2img',
                    history: [],
                    favoriteKey: 'img2img',
                    favorite: [],
                    $prompt: null,
                    $textarea: null,
                    $steps: null,
                    name: 'img2img_prompt',
                    neg: false,
                    id: 'phystonPrompt_img2img_prompt'
                },
                {
                    tab: 'tab_img2img',
                    prompt: 'img2img_neg_prompt',
                    counter: 'img2img_negative_token_counter',
                    button: 'img2img_negative_token_button',
                    steps: 'img2img_steps',
                    historyKey: 'img2img_neg',
                    history: [],
                    favoriteKey: 'img2img_neg',
                    favorite: [],
                    $prompt: null,
                    $textarea: null,
                    $steps: null,
                    name: 'img2img_neg_prompt',
                    neg: true,
                    id: 'phystonPrompt_img2img_neg_prompt'
                },
            ],
            languageCode: '',
            languages: {},
            translateApis: [],
            translateApi: '',
            translateApiConfig: {},
            autoTranslateToEnglish: false,
            autoTranslateToLocal: false,
            hideDefaultInput: false,
            enableTooltip: true,

            startWatchSave: false,

            showSelectLanguage: false,

            pasteBtn: null,
            showPastePopup: false,
            pasteTitle: '',
            pasteContent: '',
            pasteLoading: false,
        }
    },
    watch: {
        languageCode: {
            handler: function (val, oldVal) {
                if (!this.startWatchSave) return
                console.log('onLanguageCodeChange', val)
                this.gradioAPI.setData('languageCode', val).then(data => {
                }).catch(err => {
                })
            },
            immediate: false,
        },
        autoTranslateToEnglish: {
            handler: function (val, oldVal) {
                if (!this.startWatchSave) return
                console.log('onAutoTranslateToEnglishChange', val)
                this.gradioAPI.setData('autoTranslateToEnglish', val).then(data => {
                }).catch(err => {
                })
            },
            immediate: false,
        },
        autoTranslateToLocal: {
            handler: function (val, oldVal) {
                if (!this.startWatchSave) return
                console.log('onAutoTranslateToLocalChange', val)
                this.gradioAPI.setData('autoTranslateToLocal', val).then(data => {
                }).catch(err => {
                })
            },
            immediate: false,
        },
        hideDefaultInput: {
            handler: function (val, oldVal) {
                if (!this.startWatchSave) return
                console.log('onHideDefaultInputChange', val)
                this.prompts.forEach(item => {
                    item.$prompt.parentElement.parentElement.style.display = val ? 'none' : 'flex'
                })
                this.gradioAPI.setData('hideDefaultInput', val).then(data => {
                }).catch(err => {
                })
            },
            immediate: false,
        },
        enableTooltip: {
            handler: function (val, oldVal) {
                if (!this.startWatchSave) return
                localStorage.setItem('phystonPromptEnableTooltip', val ? 'true' : 'false')
                this.updateTippyState()
                this.gradioAPI.setData('enableTooltip', val).then(data => {
                }).catch(err => {
                })
            },
            immediate: false,
        },
        translateApi: {
            handler: function (val, oldVal) {
                if (!this.startWatchSave) return
                console.log('onTranslateApiChange', val, oldVal)
                this.updateTranslateApiConfig()
                this.gradioAPI.setData('translateApi', val).then(data => {
                }).catch(err => {
                })
            },
            immediate: false,
        },
    },
    mounted() {
        this.gradioAPI.getConfig().then(res => {
            console.log('config:', res)
            this.languageCode = res.i18n.default
            this.translateApi = res.translate_apis.default
            this.translateApis = res.translate_apis.apis
            let languages = {}
            res.i18n.languages.forEach(lang => {
                languages[lang.code] = lang
            })
            this.languages = languages
            this.init()
        }).catch(err => {
            this.$toastr.error('Failed to connect to Gradio API: ' + err)
            console.log(err)
        })
    },
    methods: {
        getLang(key) {
            return common.getLang(key, this.languageCode, this.languages)
        },
        init() {
            let dataListsKeys = ['languageCode', 'autoTranslateToEnglish', 'autoTranslateToLocal', 'hideDefaultInput', 'translateApi', 'enableTooltip']
            /*this.prompts.forEach(item => {
                dataListsKeys.push(item.historyKey)
                dataListsKeys.push(item.favoriteKey)
            })*/

            this.gradioAPI.getDatas(dataListsKeys).then(data => {
                if (data.languageCode !== null) {
                    let findLang = false
                    for (let key in this.languages) {
                        if (this.languages[key].code === data.languageCode) {
                            findLang = true
                            break
                        }
                    }
                    if (findLang) {
                        this.languageCode = data.languageCode
                        this.$forceUpdate()
                    }
                }
                if (data.autoTranslateToEnglish !== null) {
                    this.autoTranslateToEnglish = data.autoTranslateToEnglish
                }
                if (data.autoTranslateToLocal !== null) {
                    this.autoTranslateToLocal = data.autoTranslateToLocal
                }
                if (data.hideDefaultInput !== null) {
                    this.hideDefaultInput = data.hideDefaultInput
                }
                if (data.enableTooltip !== null) {
                    this.enableTooltip = data.enableTooltip
                    localStorage.setItem('phystonPromptEnableTooltip', this.enableTooltip ? 'true' : 'false')
                    this.updateTippyState()
                }
                if (data.translateApi !== null) {
                    this.translateApi = data.translateApi
                }

                this.updateTranslateApiConfig()

                this.prompts.forEach(item => {
                    item.$prompt = document.getElementById(item.prompt)
                    item.$textarea = item.$prompt.getElementsByTagName("textarea")[0]
                    item.$steps = document.getElementById(item.steps)
                    // item.history = data[item.historyKey] || []
                    // item.favorite = data[item.favoriteKey] || []
                })
                this.$nextTick(() => {
                    this.prompts.forEach(item => {
                        const $prompt = document.getElementById(item.id)
                        item.$prompt.parentElement.parentElement.parentElement.appendChild($prompt)
                        item.$prompt.parentElement.parentElement.style.display = data.hideDefaultInput ? 'none' : 'flex'
                        // item.$textarea.parentNode.appendChild($prompt)
                    })
                    this.startWatchSave = true
                })

                this.handlePaste()
                // this.$refs.translateSetting.open(this.translateApi)
            })
        },
        updateTippyState() {
            for (const $tippy of this.$tippyList) {
                if (this.enableTooltip) {
                    $tippy.enable()
                } else {
                    $tippy.disable()
                }
            }
        },
        updateTranslateApiConfig() {
            this.gradioAPI.getData('translate_api.' + this.translateApi).then(res => {
                let config = {}
                const apiItem = common.getTranslateApiItem(this.translateApis, this.translateApi)
                if (apiItem) {
                    for (const item of apiItem.config) {
                        if (res) {
                            config[item.key] = res[item.key]
                        } else {
                            config[item.key] = item.default || ''
                        }
                    }
                    config['concurrent'] = apiItem.concurrent || 0
                }
                this.translateApiConfig = config
            })
        },
        onSelectLanguageClick(e) {
            this.$refs.selectLanguage.open(e)
        },
        onTranslateApiClick() {
            this.$refs.translateSetting.open(this.translateApi)
        },
        handlePaste() {
            const $paste = document.getElementById('paste')
            // 拷贝一个新的按钮
            const $pasteNew = $paste.cloneNode(true)
            $pasteNew.id = 'paste-new'
            // 加到原来的按钮后面一个
            $paste.parentNode.insertBefore($pasteNew, $paste.nextSibling)
            // 原来的按钮隐藏
            $paste.style.display = 'none'
            // 监听新按钮点击事件
            $pasteNew.addEventListener('click', () => {
                this.openPastePopup()
            })
            this.pasteTitle = $paste.title
            this.pasteBtn = $paste
        },
        openPastePopup() {
            this.pasteContent = ''
            this.pasteLoading = false
            this.showPastePopup = true
        },
        closePastePopup() {
            this.showPastePopup = false
        },
        onClickPasteSubmit() {
            this.pasteLoading = true
            const ele = get_uiCurrentTabContent()
            let $textarea = null
            let $prompt = null
            for (const item of this.prompts) {
                if (!item.neg && item.tab == ele.id) {
                    $textarea = item.$textarea
                    $prompt = item.$prompt
                    break
                }
            }
            if (!$textarea || !$prompt) {
                this.pasteLoading = false
                return
            }
            $textarea.value = this.pasteContent
            $textarea.dispatchEvent(new Event('input'))
            this.pasteBtn.dispatchEvent(new Event('click'))

            setTimeout(() => {
                let interval = 0
                let intervalI = 0
                interval = setInterval(() => {
                    intervalI++
                    if (intervalI > 100) {
                        this.pasteLoading = false
                        clearInterval(interval)
                        return
                    }
                    const $hide = $prompt.getElementsByClassName('hide')
                    console.log($prompt, $hide)
                    if ($hide.length > 0) {
                        this.pasteLoading = false
                        this.closePastePopup()
                        clearInterval(interval)
                    }
                }, 100)
            }, 1000)
        },
    },
}
</script>

<style lang="less">
@import "toastr/build/toastr.min.css";
@import "tippy.js/dist/tippy.css";

.hover-scale-120 {
  animation: all 0.3s;

  &:hover {
    transform: scale(1.2);
  }
}

.hover-scale-140 {
  animation: all 0.3s;

  &:hover {
    transform: scale(1.4);
  }
}

.physton-paste-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);

  .paste-popup-main {
    width: 700px;
    height: auto;
    padding: 20px;
    margin: 0;
    box-shadow: 0 0 3px 0 #4a54ff;
    border-radius: 6px 6px 4px 4px;
    background-color: rgba(30, 30, 30, .9);
    transition: height .1s ease-in-out, width .1s ease-in-out;
    color: #fff;
    position: relative;

    .paste-popup-close {
      display: block;
      padding: 4px;
      position: absolute;
      right: -14px;
      top: -14px;
      background: #ffffffe6;
      border-radius: 50%;
      box-shadow: 0px 1px 5px 0px #d81e06;
      cursor: pointer;

      &:hover {
        background: #d81e06;
      }
    }

    .paste-popup-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      word-break: keep-all;
      white-space: nowrap;
      overflow: hidden;
    }

    .paste-popup-body {
      .paste-content {
        background: rgba(30, 30, 30, .9);
        border: 1px solid #3c3c3c;
        padding: 4px;
        width: 100%;
        font-size: 14px;
        color: #fff;
        resize: none;
        height: 400px;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: #4A54FF;
        }
      }

      .paste-submit {
        background: center center #4A54FF;
        background-image: linear-gradient(315deg, #6772FF 0, #00F9E5 100%);
        background-size: 104% 104%;
        color: #1d1d1d;
        border-radius: 10px;
        padding: 10px;
        margin-top: 10px;
        text-align: center;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;

        &:hover {
          box-shadow: 0 0 14px #4a54ff;
        }
      }
    }
  }
}
</style>
