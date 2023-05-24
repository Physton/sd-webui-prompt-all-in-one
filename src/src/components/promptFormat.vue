<template>
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
            </div>
        </div>
    </div>
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
    },
    data() {
        return {
            isOpen: false,
        }
    },
    emits: ['update:autoRemoveSpace', 'update:autoRemoveLastComma', 'update:autoKeepWeightZero'],
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