<template>
    <Transition name="fadeDown">
        <div class="physton-chatgpt-prompt" v-if="isOpen" @click="close">
        <div class="chatgpt-main" @click.stop>
            <div class="chatgpt-close" @click="close">
                <icon-svg name="close"/>
            </div>
            <div class="chatgpt-body" @click.stop>
                <div :class="['body-panel', hidePanels['api'] ? 'fold': '']">
                    <div class="panel-header">
                        <div class="panel-unfold" @click="onUnfoldClick('api')">
                            <icon-svg class="hover-scale-120" name="unfold"/>
                        </div>
                        <div class="panel-title">{{ getLang('api_config') }}</div>
                    </div>
                    <div class="panel-content">
                        <div class="body-line" v-for="config in configs">
                            <div class="line-title">{{ config.title }}</div>
                            <div class="line-content">
                                <input type="text" v-if="config.type == 'input'" v-model="config.value">
                                <select v-if="config.type == 'select'" v-model="config.value">
                                    <option v-for="option in config.options" :value="option">{{ option }}</option>
                                </select>
                                <div v-if="config.desc" v-html="config.desc"></div>
                            </div>
                        </div>
                        <div class="body-line">
                            <div class="line-title"></div>
                            <div class="line-content text-right">
                                <div class="common-btn hover-scale-120" @click="onSaveConfigClick">
                                    <icon-svg v-if="saveConfigIng" name="loading"/>
                                    <template v-else>{{ getLang('save') }}</template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div :class="['body-panel', hidePanels['send'] ? 'fold': '']">
                    <div class="panel-header">
                        <div class="panel-unfold" @click="onUnfoldClick('send')">
                            <icon-svg class="hover-scale-120" name="unfold"/>
                        </div>
                        <div class="panel-title">{{ getLang('image_desc') }}</div>
                    </div>
                    <div class="panel-content">
                        <div class="body-line">
                            <div class="line-title">{{ getLang('preset') }}
                                <div class="line-subtitle">{{ getLang('ai_one') }}</div>
                            </div>
                            <div class="line-content">
                                <textarea :value="chatPreset" @change="onPresetChange" style="height: 100px"></textarea>
                            </div>
                        </div>
                        <div class="body-line">
                            <div class="line-title"></div>
                            <div class="line-content text-right">
                                <a href="javascript:" @click="onRestoreClick">{{ getLang('restore_to_default') }}</a>
                            </div>
                        </div>
                        <div class="body-line">
                            <div class="line-title">{{ getLang('image_desc') }}
                                <div class="line-subtitle">{{ getLang('ai_two') }}</div>
                            </div>
                            <div class="line-content">
                                <textarea style="height: 100px" ref="imageDesc" v-model="imageDesc"
                                          :placeholder="getLang('input_image_desc')"></textarea>
                            </div>
                        </div>
                        <div class="body-line">
                            <div class="line-title"></div>
                            <div class="line-content text-right">
                                <div class="common-btn hover-scale-120" @click="onGenClick">
                                    <icon-svg v-if="genIng" name="loading"/>
                                    <template v-else>{{ getLang('generate') }}</template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div :class="['body-panel', hidePanels['result'] ? 'fold': '']">
                    <div class="panel-header">
                        <div class="panel-unfold" @click="onUnfoldClick('result')">
                            <icon-svg class="hover-scale-120" name="unfold"/>
                        </div>
                        <div class="panel-title">{{ getLang('generate_result') }}</div>
                    </div>
                    <div class="panel-content">
                        <div class="body-line">
                            <div class="line-title">{{ getLang('generate_result') }}</div>
                            <div class="line-content">
                                <textarea style="height: 100px" v-model="promptResult"></textarea>
                            </div>
                        </div>
                        <div class="body-line" v-if="promptResult">
                            <div class="line-title"></div>
                            <div class="line-content text-right">
                                <div class="common-btn hover-scale-120" @click="onUseClick">{{ getLang('use') }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </Transition>
</template>
<script>
import LanguageMixin from "@/mixins/languageMixin";
import IconSvg from "@/components/iconSvg.vue";
import common from "@/utils/common";

export default {
    name: 'ChatgptPrompt',
    components: {IconSvg},
    mixins: [LanguageMixin],
    props: {},
    data() {
        return {
            isOpen: false,
            api: {},
            configs: [],
            chatPreset: '',
            hidePanels: {
                api: true,
            },
            imageDesc: '',
            promptResult: '',
            saveConfigIng: false,
            genIng: false,
        }
    },
    emits: ['use'],
    computed: {},
    mounted() {
    },
    methods: {
        open() {
            this.isOpen = true
            this.saveConfigIng = false
            this.genIng = false

            this.gradioAPI.getDatas(['chatgpt_prompts_preset', 'chatgpt_key', 'translate_api.openai']).then(res => {
                console.log(res)
                if (res.chatgpt_prompts_preset !== null) {
                    this.chatPreset = res.chatgpt_prompts_preset
                } else {
                    this.chatPreset = this.getLang('chatgpt_prompts_preset')
                }

                this.configs = []
                let configs = {}
                let api = common.getTranslateApiItem(this.translateApis, 'openai')
                api = JSON.parse(JSON.stringify(api))
                if (res.chatgpt_key && typeof res.chatgpt_key === 'object') {
                    for (const item of api.config) {
                        configs[item.key] = res.chatgpt_key[item.key] || item.default || ''
                    }
                } else {
                    /*if (res['translate_api.openai'] && res['translate_api.openai'].api_key) {
                        for (const item of api.config) {
                            configs[item.key] = res['translate_api.openai'][item.key] || item.default || ''
                        }
                    } else {*/
                    for (const item of api.config) {
                        configs[item.key] = item.default || ''
                    }
                    /*}*/
                    // this.gradioAPI.setData('chatgpt_key', configs)
                }
                if (!configs['api_key']) {
                    this.hidePanels['api'] = false
                }
                for (const item of api.config) {
                    item.value = configs[item.key]
                    this.configs.push(item)
                }
            })
        },
        close() {
            this.isOpen = false
        },
        onUnfoldClick(panelName) {
            this.hidePanels[panelName] = !this.hidePanels[panelName]
        },
        onSaveConfigClick() {
            if (this.saveConfigIng) return
            this.saveConfigIng = true
            let configs = {}
            this.configs.forEach(item => {
                configs[item.key] = item.value
            })
            this.gradioAPI.setData('chatgpt_key', configs).then(res => {
                this.$toastr.success(this.getLang('success'))
                this.saveConfigIng = false
            }).catch(err => {
                this.$toastr.error(err.message || err)
                this.saveConfigIng = false
            })
        },
        onPresetChange(e) {
            this.chatPreset = e.target.value
            this._saveChatPreset()
        },
        onRestoreClick() {
            this.chatPreset = this.getLang('chatgpt_prompts_preset')
            this._saveChatPreset()
        },
        _saveChatPreset() {
            this.gradioAPI.setData('chatgpt_prompts_preset', this.chatPreset)
        },
        onGenClick() {
            if (this.genIng) return
            if (!this.imageDesc) return this.$refs.imageDesc.focus()
            this.imageDesc = this.imageDesc.trim()
            if (!this.imageDesc) return this.$refs.imageDesc.focus()
            this.genIng = true
            let messages = [
                {'role': 'user', 'content': this.chatPreset},
                {'role': 'user', 'content': this.imageDesc},
            ]
            let configs = {}
            this.configs.forEach(item => {
                configs[item.key] = item.value
            })
            this.gradioAPI.genOpenAI(messages, configs).then(res => {
                if (res.success) {
                    this.promptResult = res.result
                } else {
                    this.$toastr.error(res.message || 'error')
                }
                this.genIng = false
            }).catch(err => {
                this.$toastr.error(err.message || err)
                this.genIng = false
            })
        },
        onUseClick() {
            this.$emit('use', this.promptResult)
            this.close()
        },
    },
}
</script>