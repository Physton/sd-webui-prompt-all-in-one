import common from "@/utils/common"
import {ref} from "vue"

export default {
    data() {
        return {
            groupTagsActive: 0,
            subGroupTagsActive: 0,
            groupTagsColorKeyCache: {},
        }
    },
    watch: {
        groupTags: {
            handler() {
                for (let item of this.groupTags) {
                    for (let group of item.groups) {
                        let key = this.getTagsColorKey(item.name, group.name)
                        if (!this.groupTagsColor[key]) {
                            this.groupTagsColor[key] = ref(common.fitterInputColor(group.color))
                        }
                        for (let en in group.tags) {
                            this.groupTagsColorKeyCache[en] = key
                        }
                    }
                }
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
        },
        activeSubGroupTab(index) {
            this.subGroupTagsActive = index
        },
        onClickHideGroupTags() {
            this.$emit('update:hideGroupTags', !this.hideGroupTags)
        },
        onClickGroupTag(local, en) {
            this._appendTag(en, local, false, -1, 'text')
        },
        getGroupTagTooltip(local, en) {
            let html = ''
            if (local && local !== en) {
                html += local + '<br/>'
            }
            html += en
            return html
        },
        renderGroupTag(local, en, groupName = '', subGroupName = '') {
            let html = ''
            let style = ''
            let colorKey = this.getTagsColorKey(groupName, subGroupName)
            let color = ''
            if (this.groupTagsColor[colorKey]) {
                color = this.groupTagsColor[colorKey]
                if (common.isColorTransparent(color)) {
                    // 如果是纯透明，则设为空
                    color = ''
                }
            }
            if (color) {
                style = 'style="background: ' + color + '"'
            }
            if (local && local !== en) {
                html += '<div class="tag-local" ' + style + '>' + local + '</div>'
                html += '<div class="tag-en">' + en + '</div>'
            } else {
                html += '<div class="tag-local" ' + style + '>' + en + '</div>'
            }
            return html
        },
        getTagsColorKey(groupName, subGroupName) {
            return groupName + '||' + subGroupName
        },
        onTagsColorChange(key) {
            this.$emit('update:groupTagsColor', this.groupTagsColor)
        },
        onClickResetTagsColor(key) {
            for (let item of this.groupTags) {
                for (let group of item.groups) {
                    let key2 = this.getTagsColorKey(item.name, group.name)
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
