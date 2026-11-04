<template>
    <Transition name="fadeDown">
        <div class="physton-prompt-format" v-if="isOpen" @click="close">
        <div class="format-main" @click.stop>
            <div class="format-close" @click="close">
                <icon-svg name="close"/>
            </div>
            <div class="format-list" @click.stop>
                <!-- checkbox 結構由 definitions.ts 的 checkUi 生成：v-for 維持定義表順序，子選項依父選項啟用與否過濾並縮排 -->
                <div class="format-item" v-for="option in formatOptions" :key="option.key"
                     :style="option.parentKey ? 'padding-left: 20px;' : null">
                    <input class="format-checkbox" type="checkbox"
                           :checked="option.value"
                           @change="$emit(option.emitEvent, $event.target.checked)">
                    <div class="format-desc" v-html="getLang(option.labelLangKey)"></div>
                </div>
            </div>
        </div>
    </div>
    </Transition>
</template>
<script>
import LanguageMixin from "@/mixins/languageMixin";
import IconSvg from "@/components/iconSvg.vue";
import { filterPromptOptionCheckVisible, getPromptOptionChecks, getPromptOptionEmits, getPromptOptionProps, withPromptOptionCheckValues } from "@/utils/promptOptions"

export default {
    name: 'PromptFormat',
    components: {IconSvg},
    mixins: [LanguageMixin],
    props: {
        /** prompts 系列選項 props：由 src/src/utils/promptOptions 生成 */
        ...getPromptOptionProps(),
    },
    data() {
        return {
            isOpen: false,
        }
    },
    emits: [
        /** v-model 事件名（update:key）：依 emittedBy 生成——本元件的 14 個 checkbox 實際會 emit */
        ...getPromptOptionEmits('promptFormat'),
    ],
    computed: {
        /**
         * checkbox 面板結構：靜態結構與執行期狀態分段生成。
         *
         * 1. getPromptOptionChecks          — 靜態結構
         * 2. withPromptOptionCheckValues    — 掛上目前值 value（傳入 this，computed 內讀取 props 以收集響應式依賴）
         * 3. filterPromptOptionCheckVisible — 子選項僅在父選項目前啟用時保留（等同原本的 v-if）
         */
        formatOptions() {
            const checks = getPromptOptionChecks('promptFormat')
            const checksWithValues = withPromptOptionCheckValues(checks, this)
            return filterPromptOptionCheckVisible(checksWithValues, this)
        },
    },
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