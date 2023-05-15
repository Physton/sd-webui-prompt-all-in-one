<template>
    <div class="physton-prompt-select-language" v-if="isOpen" @click="close">
        <div class="language-main" @click.stop>
            <div class="language-close" @click="close">
                <icon-close width="24" height="24" />
            </div>
            <div class="language-list" @click.stop>
                <div v-for="item in languages" :key="item.code"
                     :class="['language-item', item.code == languageCode ? 'selected' : '']" ref="items"
                     @click="onLanguageClick(item)">
                    {{ item.code }} - {{ item.name }}
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import LanguageMixin from "@/mixins/languageMixin";
import IconClose from "@/components/icons/iconClose.vue";

export default {
    name: 'SelectLanguage',
    components: {IconClose},
    mixins: [LanguageMixin],
    props: {},
    data() {
        return {
            isOpen: false,
        }
    },
    computed: {},
    mounted() {
    },
    methods: {
        open() {
            this.isOpen = true
            this.$nextTick(() => {
                this.scrollToSelectedItem()
            })
        },
        close() {
            this.isOpen = false
        },
        onLanguageClick(item) {
            this.$emit('update:languageCode', item.code)
            this.close()
        },
        scrollToSelectedItem() {
            const items = this.$refs.items
            for (let i = 0; i < items.length; i++) {
                if (items[i].classList.contains('selected')) {
                    items[i].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    })
                    break
                }
            }
        }
    },
}
</script>