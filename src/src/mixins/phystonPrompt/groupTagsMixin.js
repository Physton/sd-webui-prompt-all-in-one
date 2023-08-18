import common from "@/utils/common"
import {ref} from "vue"

export default {
    data() {
        return {
            groupTagsActive: '',
            subGroupTagsActive: '',
        }
    },
    watch: {
        groupTags: {
            handler() {
                if (!this.groupTagsActive || !this.subGroupTagsActive) {
                    this.groupTagsActive = 'favorite'
                    this.subGroupTagsActive = 'favorite-' + this.favoriteKey
                    /*for (let item of this.groupTags) {
                        this.groupTagsActive = item.tabKey
                        for (let group of item.groups) {
                            if (group.type && group.typ == 'wrap') continue
                            this.subGroupTagsActive = group.tabKey
                            break
                        }
                        break
                    }*/
                }
                this._setGroupTagItemWidth()
            },
            deep: true,
            immediate: true,
        },
        favorites: {
            handler() {

            },
            deep: true,
            immediate: true,
        }
    },
    methods: {
        activeGroupTab(index) {
            if (index === 'favorite') {
                this.groupTagsActive = 'favorite'
                this.subGroupTagsActive = 'favorite-' + this.favoriteKey
                index = 0
            } else {
                this.groupTagsActive = this.groupTags[index].tabKey
                this.subGroupTagsActive = this.groupTags[index].groups[0].tabKey
                index += 1
            }
            let scrollLeft = this.$refs.groupTabsHeader.children[index].offsetLeft - this.$refs.groupTabsHeader.offsetWidth / 2 + this.$refs.groupTabsHeader.children[index].offsetWidth / 2
            this.$refs.groupTabsHeader.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            })
            this._setGroupTagItemWidth()
        },
        activeSubGroupTab(index, subIndex) {
            if (index === 'favorite') {
                this.subGroupTagsActive = 'favorite-' + subIndex
            } else {
                this.subGroupTagsActive = this.groupTags[index].groups[subIndex].tabKey
            }
            this._setGroupTagItemWidth()
        },
        _setGroupTagItemWidth() {
            // this.$refs.groupTagItem
            this.$nextTick(() => {
                if (!this.$refs.groupTagItem) return
                this.$refs.groupTagItem.forEach((item, index) => {
                    item.style.width = 'auto'
                })
                let maxWidth = 0
                this.$refs.groupTagItem.forEach((item, index) => {
                    maxWidth = Math.max(maxWidth, item.offsetWidth)
                })
                if (maxWidth > 0) {
                    this.$refs.groupTagItem.forEach((item, index) => {
                        item.style.width = maxWidth + 'px'
                    })
                }
            })
        },
        onClickHideGroupTags() {
            this.$emit('update:hideGroupTags', !this.hideGroupTags)
        },
        onClickGroupTag(local, en) {
            this._appendTag(en, local, false, -1, 'text')
            this.updateTags()
        },
        onClickGroupTagFavorite(favorite) {
            favorite.tags.forEach((tag) => {
                this._appendTag(tag.value, tag.localValue, tag.disabled, -1, tag.type)
            })
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
