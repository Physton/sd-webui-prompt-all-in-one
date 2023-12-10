<template>
    <Transition name="fadeDown">
        <div class="physton-prompt-format" v-if="isOpen" @click="close">
        <div class="format-main" @click.stop>
            <div class="format-close" @click="close">
                <icon-svg name="close"/>
            </div>
            <div class="format-list" @click.stop>
                <div class="format-item">
                    <input class="format-checkbox" type="checkbox"
                           :checked="autoRemoveSpace"
                           @change="$emit('update:autoRemoveSpace', $event.target.checked)">
                    <div class="format-desc" v-html="getLang('is_remove_space')"></div>
                </div>
                <div class="format-item">
                    <input class="format-checkbox" type="checkbox"
                           :checked="autoRemoveLastComma"
                           @change="$emit('update:autoRemoveLastComma', $event.target.checked)">
                    <div class="format-desc" v-html="getLang('is_remove_last_comma')"></div>
                </div>
                <div class="format-item">
                    <input class="format-checkbox" type="checkbox"
                           :checked="autoKeepWeightZero"
                           @change="$emit('update:autoKeepWeightZero', $event.target.checked)">
                    <div class="format-desc" v-html="getLang('is_keep_weight_zero')"></div>
                </div>
                <div class="format-item">
                    <input class="format-checkbox" type="checkbox"
                           :checked="autoBreakBeforeWrap"
                           @change="$emit('update:autoBreakBeforeWrap', $event.target.checked)">
                    <div class="format-desc" v-html="getLang('is_break_before_wrap')"></div>
                </div>
                <div class="format-item">
                    <input class="format-checkbox" type="checkbox"
                           :checked="autoBreakAfterWrap"
                           @change="$emit('update:autoBreakAfterWrap', $event.target.checked)">
                    <div class="format-desc" v-html="getLang('is_break_after_wrap')"></div>
                </div>
                <div class="format-item">
                    <input class="format-checkbox" type="checkbox"
                           :checked="autoRemoveLoraBeforeComma"
                           @change="$emit('update:autoRemoveLoraBeforeComma', $event.target.checked)">
                    <div class="format-desc" v-html="getLang('is_remove_lora_before_comma')"></div>
                </div>
                <div class="format-item">
                    <input class="format-checkbox" type="checkbox"
                           :checked="autoRemoveLoraAfterComma"
                           @change="$emit('update:autoRemoveLoraAfterComma', $event.target.checked)">
                    <div class="format-desc" v-html="getLang('is_remove_lora_after_comma')"></div>
                </div>
                <div class="format-item">
                    <input class="format-checkbox" type="checkbox"
                           :checked="useNovelAiWeightSymbol"
                           @change="$emit('update:useNovelAiWeightSymbol', $event.target.checked)">
                    <div class="format-desc" v-html="getLang('is_use_novel_ai_weight_symbol')"></div>
                </div>
                <div class="format-item">
                    <input class="format-checkbox" type="checkbox"
                           :checked="autoRemoveBeforeLineComma"
                           @change="$emit('update:autoRemoveBeforeLineComma', $event.target.checked)">
                    <div class="format-desc" v-html="getLang('is_remove_before_line_comma')"></div>
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
    name: 'PromptFormat',
    components: {IconSvg},
    mixins: [LanguageMixin],
    props: {
        autoRemoveSpace: {
            type: Boolean,
            default: false,
        },
        autoRemoveLastComma: {
            type: Boolean,
            default: false,
        },
        autoKeepWeightZero: {
            type: Boolean,
            default: false,
        },
        autoKeepWeightOne: {
            type: Boolean,
            default: false,
        },
        autoBreakBeforeWrap: {
            type: Boolean,
            default: false,
        },
        autoBreakAfterWrap: {
            type: Boolean,
            default: false,
        },
        autoRemoveLoraBeforeComma: {
            type: Boolean,
            default: false,
        },
        autoRemoveLoraAfterComma: {
            type: Boolean,
            default: false,
        },
        useNovelAiWeightSymbol: {
            type: Boolean,
            default: false,
        },
        autoRemoveBeforeLineComma: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isOpen: false,
        }
    },
    emits: ['update:autoRemoveSpace', 'update:autoRemoveLastComma', 'update:autoKeepWeightZero', 'update:autoKeepWeightOne', 'update:autoBreakBeforeWrap', 'update:autoBreakAfterWrap', 'update:autoRemoveLoraBeforeComma', 'update:autoRemoveLoraAfterComma', 'update:useNovelAiWeightSymbol', 'update:autoRemoveBeforeLineComma'],
    computed: {},
    mounted() {
    },
    methods: {
        open() {
            this.isOpen = true
        },
        close() {
            this.isOpen = false
        },
    },
}
</script>