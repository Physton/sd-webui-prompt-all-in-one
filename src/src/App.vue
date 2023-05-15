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
                            :hide-default-input="item.hideDefaultInput"
                            @update:hide-default-input="onUpdateHideDefaultInput(item.id, $event)"
                            :hide-panel="item.hidePanel"
                            @update:hide-panel="onUpdateHidePanel(item.id, $event)"
                            v-model:enable-tooltip="enableTooltip"
                            v-model:translate-api="translateApi"
                            :translate-api-config="translateApiConfig"
                            @click:translate-api="onTranslateApiClick"
                            @click:select-language="onSelectLanguageClick"></physton-prompt>
        </block>
        <translate-setting ref="translateSetting" v-model:language-code="languageCode"
                           :translate-apis="translateApis" :languages="languages"
                           @forceUpdate:translateApi="updateTranslateApiConfig"
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
                    hideDefaultInputKey: 'txt2ImgHideDefaultInput',
                    hideDefaultInput: false,
                    hidePanelKey: 'txt2ImgHidePanel',
                    hidePanel: false,
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
                    hideDefaultInputKey: 'txt2ImgNegHideDefaultInput',
                    hideDefaultInput: false,
                    hidePanelKey: 'txt2ImgNegHidePanel',
                    hidePanel: false,
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
                    hideDefaultInputKey: 'img2ImgHideDefaultInput',
                    hideDefaultInput: false,
                    hidePanelKey: 'img2ImgHidePanel',
                    hidePanel: false,
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
                    hideDefaultInputKey: 'img2ImgNegHideDefaultInput',
                    hideDefaultInput: false,
                    hidePanelKey: 'img2ImgNegHidePanel',
                    hidePanel: false,
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
            // hideDefaultInput: false,
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
        /*hideDefaultInput: {
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
        },*/
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
            this.$toastr.error("Connection to backend API service failed. Please manually refresh the webpage. If it still doesn't work, please restart the WebUI.<br/>连接到后台接口服务失败，请手动再刷新一次网页。如果还是不行，请重启WebUI。", "sd-webui-prompt-all-in-one", {timeOut: 20000})
            console.log(err)
        })
    },
    methods: {
        getLang(key) {
            return common.getLang(key, this.languageCode, this.languages)
        },
        init() {
            let dataListsKeys = ['languageCode', 'autoTranslateToEnglish', 'autoTranslateToLocal', /*'hideDefaultInput', */'translateApi', 'enableTooltip']
            this.prompts.forEach(item => {
                // dataListsKeys.push(item.historyKey)
                // dataListsKeys.push(item.favoriteKey)
                dataListsKeys.push(item.hideDefaultInputKey)
                dataListsKeys.push(item.hidePanelKey)
            })

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
                /*if (data.hideDefaultInput !== null) {
                    this.hideDefaultInput = data.hideDefaultInput
                }*/
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
                    if (data[item.hideDefaultInputKey] !== null) {
                        item.hideDefaultInput = data[item.hideDefaultInputKey]
                    }
                    if (data[item.hidePanelKey] !== null) {
                        item.hidePanel = data[item.hidePanelKey]
                    }
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
                        item.$prompt.parentElement.parentElement.style.display = item.hideDefaultInput ? 'none' : 'flex'
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
            const $pastes = gradioApp().querySelectorAll("#paste")
            if (!$pastes || $pastes.length <= 0) return
            $pastes.forEach(($paste, index) => {
                // 拷贝一个新的按钮
                const $pasteNew = $paste.cloneNode(true)
                $pasteNew.id = 'paste-new-' + index
                // 加到原来的按钮后面一个
                $paste.parentNode.insertBefore($pasteNew, $paste.nextSibling)
                // 原来的按钮隐藏
                $paste.style.display = 'none'
                // 监听新按钮点击事件
                $pasteNew.addEventListener('click', () => {
                    this.pasteBtn = $paste
                    this.openPastePopup()
                })
                this.pasteTitle = $paste.title
            });
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
            let $textareaNeg = null
            let $prompt = null
            let $promptNeg = null
            let ids = []
            for (const item of this.prompts) {
                if (item.tab == ele.id) {
                    console.log(item)
                    ids.push(item.id)
                    if (item.neg) {
                        $textareaNeg = item.$textarea
                        $promptNeg = item.$prompt
                    } else {
                        $textarea = item.$textarea
                        $prompt = item.$prompt
                    }
                }
            }
            if (!$textarea || !$prompt || !$promptNeg) {
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
                    if ($prompt.getElementsByClassName('hide').length > 0 && $promptNeg.getElementsByClassName('hide').length > 0) {
                        this.pasteLoading = false
                        this.closePastePopup()
                        clearInterval(interval)
                        common.hideCompleteResults($textarea)
                        common.hideCompleteResults($textareaNeg)
                        ids.forEach((id, index) => {
                            setTimeout(() => {
                                this.$refs[id][0].onTextareaChange(true)
                            }, 1000)
                        })
                    }
                }, 100)
            }, 1000)
        },
        onUpdateHideDefaultInput(id, value) {
            const item = this.prompts.find(item => item.id == id)
            if (!item) return
            item.hideDefaultInput = value
            this.gradioAPI.setData(item.hideDefaultInputKey, item.hideDefaultInput)
            item.$prompt.parentElement.parentElement.style.display = item.hideDefaultInput ? 'none' : 'flex'
        },
        onUpdateHidePanel(id, value) {
            const item = this.prompts.find(item => item.id == id)
            if (!item) return
            item.hidePanel = value
            this.gradioAPI.setData(item.hidePanelKey, item.hidePanel)
        },
    },
}
</script>

<style lang="less">
@import "@/main.less";
</style>
