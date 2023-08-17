import common from "@/utils/common"
import {ref} from "vue"

export default {
    data() {
        return {
            groupTagsActive: 0,
            subGroupTagsActive: 0,
        }
    },
    watch: {
        groupTags: {
            handler() {
                this._setGroupTagItemWidth()
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        activeGroupTab(index) {
            this.groupTagsActive = index
            this.subGroupTagsActive = 0
            let scrollLeft = this.$refs.groupTabsHeader.children[index].offsetLeft - this.$refs.groupTabsHeader.offsetWidth / 2 + this.$refs.groupTabsHeader.children[index].offsetWidth / 2
            this.$refs.groupTabsHeader.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            })
            this._setGroupTagItemWidth()
        },
        activeSubGroupTab(index) {
            this.subGroupTagsActive = index
            this._setGroupTagItemWidth()
        },
        _setGroupTagItemWidth() {
            // this.$refs.groupTagItem
            this.$nextTick(() => {
                this.$refs.groupTagItem.forEach((item, index) => {
                    item.style.width = 'auto'
                })
                let maxWidth = 0
                this.$refs.groupTagItem.forEach((item, index) => {
                    maxWidth = Math.max(maxWidth, item.offsetWidth)
                })
                this.$refs.groupTagItem.forEach((item, index) => {
                    item.style.width = maxWidth + 'px'
                })
            })
        },
        onClickHideGroupTags() {
            this.$emit('update:hideGroupTags', !this.hideGroupTags)
        },
        onClickGroupTag(local, en) {
            this._appendTag(en, local, false, -1, 'text')
            this.updateTags()
        },
        getGroupTagTooltip(local, en) {
            let html = ''
            if (local && local !== en) {
                html += local + '<br/>'
            }
            html += en
            return html
        },
        getGroupTagStyle(groupName, subGroupName) {
            let style = {}
            let colorKey = common.getTagsColorKey(groupName, subGroupName)
            let color = ''
            if (this.groupTagsColor[colorKey]) {
                color = this.groupTagsColor[colorKey]
                if (common.isColorTransparent(color)) {
                    // 如果是纯透明，则设为空
                    color = ''
                }
            }
            if (color) {
                style = {background: color}
            }
            return style
        },
        getTagsColorKey(groupName, subGroupName) {
            return common.getTagsColorKey(groupName, subGroupName)
        },
        onTagsColorChange(key) {
            this.$emit('update:groupTagsColor', this.groupTagsColor)
        },
        onClickResetTagsColor(key) {
            for (let item of this.groupTags) {
                for (let group of item.groups) {
                    if (group.type && group.typ == 'wrap') continue
                    let key2 = common.getTagsColorKey(item.name, group.name)
                    if (key === key2) {
                        this.groupTagsColor[key] = ref(common.fitterInputColor(group.color))
                    }
                }
            }
            this.onTagsColorChange(key)
        },
        onClickClearTagsColor(key) {
            this.groupTagsColor[key] = ref('rgba(0,0,0,0)')
            this.onTagsColorChange(key)
        },
        getTagColorStyle(tag) {
            if (tag.isLora || tag.isLyco || tag.isEmbedding) return {}
            if (!this.groupTagsColorKeyCache[tag.value]) return {}
            let key = this.groupTagsColorKeyCache[tag.value]
            if (!this.groupTagsColor[key]) return {}
            let color = this.groupTagsColor[key]
            if (common.isColorTransparent(color)) return {}
            return {background: color}
        },
    }
}
