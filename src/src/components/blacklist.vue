<template>
    <div class="physton-prompt-blacklist" v-if="isOpen" @click="">
        <div class="blacklist-main" @click.stop>
            <div class="blacklist-body" @click.stop>
                <div class="blacklist-desc">{{ getLang('blacklist_desc') }}</div>
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
                <div class="setting-btns">
                    <div class="blacklist-save hover-scale-120" @click="onSaveClick">{{ getLang('save') }}</div>
                    <div class="blacklist-close hover-scale-120" @click="onCloseClick">{{ getLang('close') }}</div>
                </div>
            </div>
        </div>
    </div>
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
            },
            textarea: {
                prompt: '',
                negative_prompt: '',
                lora: '',
                lycoris: '',
                embedding: '',
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
            }
            this.textarea = {
                prompt: '',
                negative_prompt: '',
                lora: '',
                lycoris: '',
                embedding: '',
            }
            this.gradioAPI.getData('blacklist').then(res => {
                if (res) {
                    this.data.prompt = res.prompt || []
                    this.data.negative_prompt = res.negative_prompt || []
                    this.data.lora = res.lora || []
                    this.data.lycoris = res.lycoris || []
                    this.data.embedding = res.embedding || []
                }
                this.textarea.prompt = this.data.prompt.join('\n')
                this.textarea.negative_prompt = this.data.negative_prompt.join('\n')
                this.textarea.lora = this.data.lora.join('\n')
                this.textarea.lycoris = this.data.lycoris.join('\n')
                this.textarea.embedding = this.data.embedding.join('\n')
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
            this.gradioAPI.setData('blacklist', this.data)
            this.close()
            this.$emit('update:blacklist', this.data)
        },
    },
}
</script>
