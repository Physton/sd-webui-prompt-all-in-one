<template>
    <div class="physton-highlight-prompt" ref="highlightPrompt" @click="hide"></div>
</template>
<script>
import common from "@/utils/common";

export default {
    name: 'HighlightPrompt',
    props: {
        textarea: {
            type: Object,
            required: true,
        },
        hideDefaultInput: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            scrollTop: 0,
            showTimeId: 0,
            hideTimeId: 0,
            lastHighLightTag: null,
        }
    },
    watch: {
    },
    mounted() {
    },
    methods: {
        show(tag) {
            if (this.lastHighLightTag && this.lastHighLightTag.value === tag.value) return
            this.lastHighLightTag = tag
            if (this.showTimeId) clearTimeout(this.showTimeId)
            this.showTimeId = setTimeout(() => {
                this._show(tag)
                this.showTimeId = 0
            }, 10)
        },
        _show(tag) {
            if (this.hideDefaultInput) return this._hide()
            if (typeof tag['type'] === 'string' && tag.type === 'wrap') return this._hide()

            let text = tag.value
            let textareaValue = this.textarea.value
            if (text === '' || text.trim() === '') return this._hide()
            if (textareaValue === '' || textareaValue.trim() === '') return this._hide()

            text = common.escapeHtml(text)
            textareaValue = common.escapeHtml(this.textarea.value)

            const start = textareaValue.indexOf(text)
            if (start === -1) return this._hide()

            // 移动位置
            this.textarea.parentNode.insertBefore(this.$refs.highlightPrompt, this.textarea.nextSibling)

            // 复制样式
            const style = window.getComputedStyle(this.textarea)
            for (const prop of style) {
                this.$refs.highlightPrompt.style[prop] = style[prop]
            }
            // this.$refs.highlightPrompt.style.position = 'absolute'
            // this.$refs.highlightPrompt.style.zIndex = '1'
            // this.$refs.highlightPrompt.style.top = '0px'
            // this.$refs.highlightPrompt.style.left = '0px'
            this.$refs.highlightPrompt.style.display = 'block'
            this.textarea.style.display = 'none'

            let newValue = ''
            let tempValue = textareaValue
            while (true) {
                // 循环查找所有匹配项
                const start = tempValue.indexOf(text)
                if (start === -1) {
                    // 没有匹配项了
                    newValue += tempValue
                    break
                }
                const end = start + text.length
                newValue += tempValue.substring(0, start)
                newValue += '<span class="physton-highlight-prompt">'
                newValue += tempValue.substring(start, end)
                newValue += '</span>'
                tempValue = tempValue.substring(end)
            }

            this.$refs.highlightPrompt.innerHTML = newValue
            this.$refs.highlightPrompt.scrollTop = this.scrollTop
        },
        hide() {
            this.lastHighLightTag = null
            if (this.showTimeId) clearTimeout(this.showTimeId)
            if (this.hideTimeId) clearTimeout(this.hideTimeId)
            this.hideTimeId = setTimeout(() => {
                this._hide()
                this.hideTimeId = 0
            }, 10)
        },
        _hide() {
            this.textarea.style.display = 'block'
            this.$refs.highlightPrompt.style.display = 'none'
            this.scrollTop = this.textarea.scrollTop
        },
    }
}
</script>