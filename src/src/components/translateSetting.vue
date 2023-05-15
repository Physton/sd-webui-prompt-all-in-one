<template>
    <div class="physton-prompt-translate-setting" v-if="isOpen">
        <div class="translate-setting-main">
            <div class="setting-line">
                <div class="line-title">{{ getLang('translate_api') }}</div>
                <div class="line-content">
                    <select v-model="apiKey">
                        <optgroup v-for="typeGroup in supportApi" :key="typeGroup.type"
                                  :label="getLang(typeGroup.type)">
                            <option v-for="item in typeGroup.children" :key="item.key" :value="item.key">
                                {{ item.name }}
                            </option>
                        </optgroup>
                    </select>
                </div>
            </div>
            <div class="setting-line" v-if="apiItem && apiItem.type == 'translators'">
                <div class="line-title"></div>
                <div class="line-content">
                    <span style="color: var(--red5)">*{{ getLang('not_api_key_desc') }}</span>
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
                    <input v-if="config.type == 'input'" v-model="config.value">
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
                        <icon-loading v-if="loading" width="40" height="40" aria-required="true"/>
                        <block v-else>Test!</block>
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
            <div class="setting-btns">
                <div class="translate-save hover-scale-120" @click="onSaveClick">{{ getLang('save') }}</div>
                <div class="translate-close hover-scale-120" @click="onCloseClick">{{ getLang('close') }}</div>
            </div>
        </div>
    </div>
</template>
<script>
import LanguageMixin from "@/mixins/languageMixin";
import IconCopy from "@/components/icons/iconCopy.vue";
import IconLoading from "@/components/icons/iconLoading.vue";
import common from "@/utils/common";

export default {
    name: 'TranslateSetting',
    components: {IconLoading, IconCopy},
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
    emits: ['update:translateApi', 'forceUpdate:translateApi'],
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
        onSaveClick() {
            this.isOpen = false
            let configs = {}
            for (const item of this.configs) {
                configs[item.key] = item.value
            }
            this.$emit('update:translateApi', this.apiKey)
            this.gradioAPI.setData('translate_api.' + this.apiKey, configs).then(res => {
                if (this.apiKey === this.translateApi) this.$emit('forceUpdate:translateApi')
            })
        },
        onCloseClick() {
            this.isOpen = false
        }
    },
}
</script>