<template>
    <Transition name="fadeDown">
        <div class="physton-prompt-blacklist" v-if="isOpen" @click="">
            <div class="blacklist-main" @click.stop>
                <div class="blacklist-body" @click.stop>
                    <div class="blacklist-desc">1. {{ getLang('blacklist_desc') }}</div>
                    <div class="blacklist-group">
                        <div class="group-title">{{ getLang('prompt_blacklist_list') }}:</div>
                        <textarea class="group-content" :placeholder="getLang('one_keyword_per_line')" v-model="textarea.prompt"></textarea>
                    </div>
                    <div class="blacklist-group">
                        <div class="group-title">{{ getLang('negative_prompt_blacklist_list') }}:</div>
                        <textarea class="group-content" :placeholder="getLang('one_keyword_per_line')" v-model="textarea.negative_prompt"></textarea>
                    </div>
                    <div class="blacklist-wrap"></div>
                    <div class="blacklist-group">
                        <div class="group-title">{{ getLang('lora_blacklist_list') }}:</div>
                        <textarea class="group-content" :placeholder="getLang('one_keyword_per_line')" v-model="textarea.lora"></textarea>
                    </div>
                    <div class="blacklist-group">
                        <div class="group-title">{{ getLang('lycoris_blacklist_list') }}:</div>
                        <textarea class="group-content" :placeholder="getLang('one_keyword_per_line')" v-model="textarea.lycoris"></textarea>
                    </div>
                    <div class="blacklist-group">
                        <div class="group-title">{{ getLang('embedding_blacklist_list') }}:</div>
                        <textarea class="group-content" :placeholder="getLang('one_keyword_per_line')" v-model="textarea.embedding"></textarea>
                    </div>
                    <div class="blacklist-wrap"></div>
                    <div class="blacklist-group">
                        <div class="group-title">
                            <label>
                                <input type="checkbox" v-model="cancelBlacklistConfirm">
                                {{ getLang('cancel_confirm_add_blacklist') }}
                            </label>
                        </div>
                    </div>
                    <div class="blacklist-wrap"></div>
                    <div class="blacklist-desc">2. {{ getLang('translate_blacklist_desc') }}</div>
                    <div class="blacklist-group">
                        <div class="group-title">{{ getLang('disable_translate_prompt_blacklist_list') }}:</div>
                        <textarea class="group-content" :placeholder="getLang('one_keyword_per_line')" v-model="textarea.translate"></textarea>
                    </div>
                    <div class="blacklist-wrap"></div>
                    <div class="setting-btns">
                        <div class="blacklist-save hover-scale-120" @click="onSaveClick">{{ getLang('save') }}</div>
                        <div class="blacklist-close hover-scale-120" @click="onCloseClick">{{ getLang('close') }}</div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>
<script>
import LanguageMixin from "@/mixins/languageMixin";
import IconSvg from "@/components/iconSvg.vue";

export default {
    name: 'Blacklist',
    components: {IconSvg},
    mixins: [LanguageMixin],
    props: {
    },
    data() {
        return {
            isOpen: false,
            data: {
                prompt: [],
                negative_prompt: [],
                lora: [],
                lycoris: [],
                embedding: [],
                translate: [],
            },
            cancelBlacklistConfirm: false,
            textarea: {
                prompt: '',
                negative_prompt: '',
                lora: '',
                lycoris: '',
                embedding: '',
                translate: '',
            },
        }
    },
    emits: ['update:blacklist'],
    computed: {},
    mounted() {
    },
    methods: {
        open() {
            this.isOpen = true
            this.data = {
                prompt: [],
                negative_prompt: [],
                lora: [],
                lycoris: [],
                embedding: [],
                translate: [],
            }
            this.textarea = {
                prompt: '',
                negative_prompt: '',
                lora: '',
                lycoris: '',
                embedding: '',
                translate: '',
            }
            this.gradioAPI.getDatas(['blacklist', 'cancelBlacklistConfirm']).then(res => {
                if (res.blacklist) {
                    this.data.prompt = res.blacklist.prompt || []
                    this.data.negative_prompt = res.blacklist.negative_prompt || []
                    this.data.lora = res.blacklist.lora || []
                    this.data.lycoris = res.blacklist.lycoris || []
                    this.data.embedding = res.blacklist.embedding || []
                    this.data.translate = res.blacklist.translate || []
                }
                if (res.cancelBlacklistConfirm) {
                    this.cancelBlacklistConfirm = res.cancelBlacklistConfirm
                }
                this.textarea.prompt = this.data.prompt.join('\n')
                this.textarea.negative_prompt = this.data.negative_prompt.join('\n')
                this.textarea.lora = this.data.lora.join('\n')
                this.textarea.lycoris = this.data.lycoris.join('\n')
                this.textarea.embedding = this.data.embedding.join('\n')
                this.textarea.translate = this.data.translate.join('\n')
            })
        },
        close() {
            this.isOpen = false
        },
        onCloseClick() {
            this.close()
        },
        onSaveClick() {
            this.data.prompt = this.textarea.prompt.split(/\s*\n\s*/).filter(item => item?.trim().length)
            this.data.negative_prompt = this.textarea.negative_prompt.split(/\s*\n\s*/).filter(item => item?.trim().length)
            this.data.lora = this.textarea.lora.split(/\s*\n\s*/).filter(item => item?.trim().length)
            this.data.lycoris = this.textarea.lycoris.split(/\s*\n\s*/).filter(item => item?.trim().length)
            this.data.embedding = this.textarea.embedding.split(/\s*\n\s*/).filter(item => item?.trim().length)
            this.data.translate = this.textarea.translate.split(/\s*\n\s*/).filter(item => item?.trim().length)
            this.gradioAPI.setData('blacklist', this.data)
            this.gradioAPI.setData('cancelBlacklistConfirm', this.cancelBlacklistConfirm)
            this.close()
            this.$emit('update:blacklist', this.data, this.cancelBlacklistConfirm)
        },
    },
}
</script>
