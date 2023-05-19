<template>
    <div class="physton-prompt-extension-css" v-if="isOpen" @click="close">
        <div class="extension-main" @click.stop>
            <div class="extension-close" @click="close">
                <icon-svg name="close"/>
            </div>
            <div class="extension-list" @click.stop>
                <div v-for="(item, index) in list" :key="item.dir" class="extension-item" ref="items">
                    <input class="extension-checkbox" type="checkbox" name="extension-item" :checked="item.selected"
                           @change="onChangeSelect(item.id)">
                    <div class="extension-dir">[{{ item.dir }}]</div>
                    <div class="extension-name">{{ getName(item) }}</div>
                    <div class="extension-author" v-if="item.manifest.author">By: {{ item.manifest.author }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import LanguageMixin from "@/mixins/languageMixin";
import IconSvg from "@/components/iconSvg.vue";
import common from "@/utils/common";

export default {
    name: 'ExtensionCss',
    components: {IconSvg},
    mixins: [LanguageMixin],
    props: {},
    data() {
        return {
            isOpen: false,
            list: [],
        }
    },
    computed: {},
    mounted() {
    },
    methods: {
        init() {
            this.refresh(true)
        },
        refresh(init = false) {
            this.gradioAPI.getExtensionCssList().then(res => {
                let list = []
                for (let i = 0; i < res.length; i++) {
                    res[i].manifest = JSON.parse(res[i].manifest)
                    if (!res[i].manifest) continue
                    if (typeof res[i].manifest !== 'object') continue
                    if (!res[i].manifest.name) continue
                    res[i].selected = res[i].selected || false
                    res[i].id = 'physton-prompt-extension-' + res[i].dir
                    list.push(res[i])
                }
                this.list = list
                if (init) {
                    this.list.forEach(item => {
                        if (item.selected) {
                            common.loadCSS(item.style, item.id, true, false)
                        }
                    })
                }
            })
        },
        getName(item) {
            if (!item) return ''
            let name = item.manifest.name
            if (item.manifest.i18n && item.manifest.i18n[this.languageCode]) {
                name = item.manifest.i18n[this.languageCode]
            }
            return name
        },
        onChangeSelect(id) {
            let item = this.list.find(item => item.id === id)
            if (!item) return
            item.selected = !item.selected
            if (item.selected) {
                common.loadCSS(item.style, item.id, true, false)
            } else {
                common.removeCSS(item.id)
            }
            this.gradioAPI.setData(item.dataName, item.selected)
        },
        open() {
            this.isOpen = true
            this.refresh(false)
        },
        close() {
            this.isOpen = false
        }
    },
}
</script>