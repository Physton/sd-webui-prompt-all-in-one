<template>
    <div class="physton-prompt-translate-setting" v-if="isOpen">
        <div class="translate-setting-main">
            <div class="translate-setting-content">
                <div class="setting-line">
                    <div class="line-title">{{ getLang('translate_api') }}</div>
                    <div class="line-content">
                        <select v-model="apiKey">
                            <optgroup v-for="typeGroup in supportApi" :key="typeGroup.type"
                                      :label="getLang(typeGroup.type)">
                                <option v-for="item in typeGroup.children" :key="item.key" :value="item.key">
                                    {{ item.name }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--&nbsp;QPS: {{ item.concurrent || 1 }}
                                </option>
                            </optgroup>
                        </select>
                    </div>
                </div>
                <div class="setting-line" v-if="apiItem && apiItem.type == 'translators'">
                    <div class="line-title"></div>
                    <div class="line-content">
                        <span class="common-red">*{{ getLang('not_api_key_desc') }}</span>
                    </div>
                </div>
                <div class="setting-line" v-if="apiItem.help">
                    <div class="line-title"></div>
                    <div class="line-content">
                        <div v-for="item in apiItem.help" class="help-list">
                            <div class="help-item">[?] <a :href="item.url" target="_blank">{{ item.title }}</a></div>
                        </div>
                    </div>
                </div>
                <div class="setting-line" v-for="config in configs">
                    <div class="line-title">{{ config.title }}</div>
                    <div class="line-content">
                        <input type="text" v-if="config.type == 'input'" v-model="config.value">
                        <select v-if="config.type == 'select'" v-model="config.value">
                            <option v-for="option in config.options" :value="option">{{ option }}</option>
                        </select>
                    </div>
                </div>
                <div class="setting-line">
                    <div class="line-title">{{ getLang('translate_test') }}</div>
                    <div class="line-content">
                        <textarea class="test-input" v-model="testText"></textarea>
                    </div>
                </div>
                <div class="setting-line">
                    <div class="line-title"></div>
                    <div class="line-content">
                        <div class="hover-scale-120 test-btn" @click="onTestClick">
                            <icon-svg v-if="loading" name="loading"/>
                            <template v-else>{{getLang('test')}}</template>
                        </div>
                    </div>
                </div>
                <div class="setting-line">
                    <div class="line-title"></div>
                    <div class="line-content">
                        <div class="translate-error" v-if="!translateSuccess && errorMessage">{{ errorMessage }}</div>
                        <textarea class="test-input" v-if="translatedText" v-model="translatedText"></textarea>
                    </div>
                </div>
                <div class="setting-line">
                    <div class="line-title">TagComplete</div>
                    <div class="line-content">
                        <div v-html="getLang('tagcomplete_translate_desc')"></div>
                        <div class="common-red" v-html="getLang('tagcomplete_translate_desc2')"></div>
                        <div class="line-row">
                            <select v-model="tagCompleteFileKey" @change="tagCompleteResults = []">
                                <option v-for="item in tagCompleteFiles" :value="item.key">{{ item.name }}</option>
                            </select>
                            <div class="refresh-btn hover-scale-120" v-tooltip="getLang('refresh')" @click="refreshCSVs">
                                <icon-svg v-if="tagCompleteFilesLoading" name="loading"/>
                                <icon-svg v-else name="refresh" />
                            </div>
                        </div>
                        <label class="onlyCsvOnAuto" :style="{display: tagCompleteFileKey ? 'flex': 'none'}">
                            <input class="hover-scale-120" type="checkbox" value="1" v-model="onlyCsvOnAutoValue">
                            <span>{{ getLang('only_csv_on_auto') }}</span>
                        </label>
                    </div>
                </div>
                 <div class="setting-line" v-show="tagCompleteFileKey">
                    <div class="line-title"></div>
                    <div class="line-content">
                        <div class="hover-scale-120 test-btn" @click="onTagCompleteTestClick">{{ getLang('test') }}</div>
                        <div ref="tagCompleteResults" v-show="tagCompleteResults.length > 0">
                            <p v-for="text in tagCompleteResults" :key="text">{{ text }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="setting-btns">
                <div class="translate-save hover-scale-120" @click="onSaveClick">{{ getLang('save') }}</div>
                <div class="translate-close hover-scale-120" @click="onCloseClick">{{ getLang('close') }}</div>
            </div>
        </div>
    </div>
</template>
<script>
import LanguageMixin from "@/mixins/languageMixin";
import common from "@/utils/common";
import IconSvg from "@/components/iconSvg.vue";

export default {
    name: 'TranslateSetting',
    components: {IconSvg},
    mixins: [LanguageMixin],
    props: {},
    data() {
        return {
            testText: `Hi, this extension is developed by Physton. Welcome to use it!
If you have any suggestions or opinions, please feel free to raise an issue or PR on Github.
If you find this extension helpful, please give me a star on Github!

Developed by: Physton
Github: Physton/sd-webui-prompt-all-in-one`,
            translateSuccess: false,
            errorMessage: '',
            translatedText: '',
            loading: false,
            isOpen: false,
            configs: [],
            apiKey: '',
            tagCompleteFiles: [],
            tagCompleteFilesLoading: false,
            tagCompleteFileKey: '',
            tagCompleteResults: [],
            onlyCsvOnAutoValue: false,
        }
    },
    computed: {
        apiItem() {
            return common.getTranslateApiItem(this.translateApis, this.apiKey)
        },
        supportApi() {
            if (!this.translateApis || this.translateApis.length <= 0) return []
            let api = JSON.parse(JSON.stringify(this.translateApis))
            api.forEach(group => {
                group.children = group.children.filter(item => item.support[this.languageCode])
            })
            return api
        },
    },
    mounted() {
        this.translateSuccess = false
        this.errorMessage = ''
        this.translatedText = ''
        this.loading = false
    },
    emits: ['update:translateApi', 'forceUpdate:translateApi', 'update:tagCompleteFile', 'update:onlyCsvOnAuto'],
    watch: {
        apiKey: {
            handler: function (val, oldVal) {
                this.translateSuccess = false
                this.errorMessage = ''
                this.translatedText = ''
                this.loading = false
                this.configs = []
                this.gradioAPI.getData('translate_api.' + this.apiKey).then(res => {
                    const apiItem = this.apiItem
                    if (apiItem && apiItem.config) {
                        for (const item of this.apiItem.config) {
                            if (res) {
                                item.value = res[item.key] || item.default
                            } else {
                                item.value = item.default || ''
                            }
                            this.configs.push(item)
                        }
                        console.log(this.configs)
                    }
                })
            },
        },
        immediate: true
    },
    methods: {
        open(apiKey) {
            this.apiKey = apiKey
            this.isOpen = true
            this.errorMessage = ''
            this.translatedText = ''
            this.loading = false
            this.tagCompleteFileKey = this.tagCompleteFile
            this.onlyCsvOnAutoValue = this.onlyCsvOnAuto
            this.refreshCSVs()
        },
        refreshCSVs() {
            if (this.tagCompleteFilesLoading) return
            this.tagCompleteFilesLoading = true
            this.tagCompleteFiles = []
            this.gradioAPI.getCSVs().then(res => {
                this.tagCompleteFilesLoading = false
                if (!res || res.length <= 0) return
                this.tagCompleteFiles.push({
                    key: '',
                    name: this.getLang('not_enable'),
                })
                for (const item of res) {
                    this.tagCompleteFiles.push({
                        key: item.key,
                        name: item.key,
                    })
                }
            }).catch(err => {
                this.tagCompleteFilesLoading = false
            })
        },
        onTestClick() {
            if (this.loading) return
            this.translateSuccess = false
            this.errorMessage = ''
            this.translatedText = ''
            this.loading = true
            let configs = {}
            for (const item of this.configs) {
                configs[item.key] = item.value
            }
            this.translate(this.testText, 'en_US', this.languageCode, this.apiKey, configs).then(res => {
                if (!res.success) {
                    this.errorMessage = res.message
                } else {
                    this.translatedText = res.translated_text
                    this.translateSuccess = true
                }
                this.loading = false
            }).catch(err => {
                this.errorMessage = err.message
                this.loading = false
            })
        },
        translate(text, from_lang, to_lang, translateApi = null, translateApiConfig = null) {
            return new Promise(async (resolve, reject) => {
                translateApi = translateApi || this.translateApi
                translateApiConfig = translateApiConfig || this.translateApiConfig || {}

                if (translateApi === 'openai') {
                    text = JSON.stringify({text})
                }
                this.gradioAPI.translate(text, from_lang, to_lang, translateApi, translateApiConfig).then(res => {
                    if (res.success) {
                        if (translateApi === 'openai') {
                            let translated_text = res.translated_text
                            // 找到第一个[，截取到最后一个]，然后再转成json
                            const start = translated_text.indexOf('{')
                            const end = translated_text.lastIndexOf('}')
                            translated_text = translated_text.substring(start, end + 1)
                            try {
                                translated_text = JSON.parse(translated_text).text
                                res.translated_text = translated_text
                            } catch (e) {
                                reject(e)
                                return
                            }
                        }
                        resolve(res)
                    } else {
                        reject(res)
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },
        onSaveClick() {
            this.isOpen = false
            let configs = {}
            for (const item of this.configs) {
                configs[item.key] = item.value
            }
            this.$emit('update:translateApi', this.apiKey)
            this.$emit('update:tagCompleteFile', this.tagCompleteFileKey)
            this.$emit('update:onlyCsvOnAuto', this.onlyCsvOnAutoValue)
            this.gradioAPI.setData('translate_api.' + this.apiKey, configs).then(res => {
                if (this.apiKey === this.translateApi) this.$emit('forceUpdate:translateApi')
            })
        },
        onCloseClick() {
            this.isOpen = false
        },
        onTagCompleteTestClick() {
            this.tagCompleteResults = []
            const texts = ['1girl', 'Robot dog']
            texts.forEach(text => {
                let lang = this.getLang('translate_result')
                this.translateToLocalByCSV(text, this.tagCompleteFileKey, true).then(res => {
                    this.tagCompleteResults.push(lang.replace('{0}', text).replace('{1}', res))
                    /*this.$refs.tagCompleteResults.scrollIntoView({
                        behavior: 'smooth',
                        block: 'buttom'
                    })*/
                }).catch(err => {
                    this.$toastr.error(err)
                })
            })
        },
    },
}
</script>