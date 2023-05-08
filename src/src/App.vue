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
                            @click:translate-api="onTranslateApiClick"></physton-prompt>
        </block>
        <translate-setting ref="translateSetting" v-model:language-code="languageCode"
                           :translate-apis="translateApis" :languages="languages"
                           v-model:translate-api="translateApi"></translate-setting>
    </div>
</template>

<script>
import PhystonPrompt from "./components/phystonPrompt.vue"
import TranslateSetting from "@/components/translateSetting.vue";
import common from "@/utils/common";

export default {
    name: 'App',
    components: {
        TranslateSetting,
        PhystonPrompt,
    },
    mixins: [],
    data() {
        return {
            prompts: [
                {
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
        onTranslateApiClick() {
            this.$refs.translateSetting.open(this.translateApi)
        }
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
</style>
