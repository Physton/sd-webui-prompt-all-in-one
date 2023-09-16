import common from "@/utils/common"
import {ref} from "vue"

export default {
    data() {
        return {
            groupTagsActive: '',
            subGroupTagsActive: '',
            groupTagsProcessed: [],
        }
    },
    watch: {
        groupTags: {
            handler() {
                this.genGroup()
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
                this.genGroup()
            },
            deep: true,
            immediate: true,
        },
        extraNetworks: {
            handler() {
                this.genGroup()
            },
            deep: true,
            immediate: true,
        }
    },
    mounted() {
        this.gradioAPI.getData('groupTagsActive-' + this.name).then((data) => {
            if (data !== null && typeof data === 'object') {
                this.groupTagsActive = data.groupTagsActive
                this.subGroupTagsActive = data.subGroupTagsActive
            }
        })
    },
    methods: {
        genGroup() {
            let processed = []
            let favoriteGroup = {
                name: this.getLang('favorite'),
                tabKey: 'favorite',
                type: 'favorite',
                groups: [],
            }
            this.getCurrentTypeFavorites().forEach(item => {
                let subGroup = {
                    color: '',
                    name: this.getLang(item.name),
                    tabKey: 'favorite-' + item.key,
                    type: 'favorite',
                    tags: {},
                    ori: {},
                }
                item.list.forEach(favorite => {
                    subGroup.tags[favorite.prompt] = favorite.name == '' ? favorite.prompt : favorite.name
                    subGroup.ori[favorite.prompt] = favorite
                })
                favoriteGroup.groups.push(subGroup)
            })
            processed.push(favoriteGroup)

            let extraNetworksGroup = {
                name: 'Extra Networks',
                tabKey: 'extraNetworks',
                type: 'extraNetworks',
                groups: [],
            }
            this.extraNetworks.forEach(extraNetwork => {
                // if (extraNetwork.name === 'checkpoints') return
                let subGroup = {
                    color: '',
                    name: extraNetwork.title,
                    tabKey: 'extraNetworks-' + extraNetwork.name,
                    type: 'extraNetworks',
                    subType: extraNetwork.name,
                    tags: {},
                    datas: [],
                }
                extraNetwork.items.forEach(item => {
                    subGroup.datas.push(item)
                })
                extraNetworksGroup.groups.push(subGroup)
                extraNetwork.items.forEach(item => {
                    item.dirnameFormat = item.dirname.replaceAll('\\', '/')
                })
                let dirs = []
                let splitArrays = extraNetwork.items.map(item => item.dirnameFormat.split('/'))
                let minLength = Math.min(...splitArrays.map(item => item.length))
                extraNetwork.items.forEach(item => {
                    item.base_dirname = item.dirnameFormat.split('/').slice(minLength).join('/')
                    dirs.push(item.base_dirname)
                })
                dirs = [...new Set(dirs)]
                dirs = dirs.filter(item => item !== '')
                if (dirs.length > 1) {
                    dirs.forEach(dir => {
                        let subDirGroup = {
                            color: '',
                            name: dir,
                            tabKey: 'extraNetworks-' + extraNetwork.name + '-' + dir,
                            type: 'extraNetworks',
                            subType: extraNetwork.name,
                            tags: {},
                            datas: [],
                        }
                        extraNetwork.items.forEach(item => {
                            if (item.base_dirname === dir) {
                                subDirGroup.datas.push(item)
                            }
                        })
                        extraNetworksGroup.groups.push(subDirGroup)
                    })
                }
                extraNetworksGroup.groups.push({
                    type: 'wrap',
                })
            })
            processed.push(extraNetworksGroup)

            processed = processed.concat(this.groupTags)
            this.groupTagsProcessed = processed
        },
        saveGroupActive() {
            this.gradioAPI.setData('groupTagsActive-' + this.name, {
                groupTagsActive: this.groupTagsActive,
                subGroupTagsActive: this.subGroupTagsActive,
            })
        },
        activeGroupTab(index) {
            this.groupTagsActive = this.groupTagsProcessed[index].tabKey
            this.subGroupTagsActive = this.groupTagsProcessed[index].groups[0].tabKey
            this.saveGroupActive()
            let scrollLeft = this.$refs.groupTabsHeader.children[index].offsetLeft - this.$refs.groupTabsHeader.offsetWidth / 2 + this.$refs.groupTabsHeader.children[index].offsetWidth / 2
            this.$refs.groupTabsHeader.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            })
            this._setGroupTagItemWidth()
        },
        activeSubGroupTab(index, subIndex) {
            this.subGroupTagsActive = this.groupTagsProcessed[index].groups[subIndex].tabKey
            this.saveGroupActive()
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
        onClickGroupTag(local, en, group, subGroup) {
            // 判断是否存在 tags 中
            let indexes = []
            this.tags.forEach((tag, index) => {
                if (tag.originalValue === en) {
                    indexes.push(index)
                }
            })
            if (indexes.length) {
                indexes.reverse().forEach((index) => {
                    this.tags.splice(index, 1)
                })
                this.updateTags()
            } else {
                if (group.type === 'favorite') {
                    let favorite = subGroup.ori[en]
                    this.onClickGroupTagFavorite(favorite)
                } else {
                    this._appendTag(en, local, false, -1, 'text')
                    this.updateTags()
                }
            }
        },
        onClickGroupTagFavorite(favorite) {
            favorite.tags.forEach((tag) => {
                this._appendTag(tag.value, tag.localValue, tag.disabled, -1, tag.type)
            })
            this.updateTags()
        },
        onClickGroupTagExtraNetwork(data, group, subGroup) {
            if (subGroup.subType === 'checkpoints') {
                if (data.loading) return
                data.loading = true
                let setLoading = (num) => {
                    if (num > 100) {
                        data.loading = false
                        // console.log('超时')
                        return
                    }
                    if (opts && opts.sd_model_checkpoint === data.basename) {
                        data.loading = false
                        // console.log('已加载')
                        return
                    }

                    setTimeout(setLoading, 100, num + 1)
                }
                setLoading(0)
                selectCheckpoint(data.basename)
                return
            }
            let indexes = this._groupTagsExtraNetworkTagsIndexes(data)
            if (indexes.length) {
                indexes.reverse().forEach((index) => {
                    console.log(index)
                    this.tags.splice(index, 1)
                })
                this.updateTags()
            } else {
                let index = this._appendTag(eval(data.prompt), '', false, -1, 'text')
                if (this.autoTranslateToLocal) {
                    this.translates([index], true, false).finally(() => {
                        this.updateTags()
                    })
                } else {
                    this.updateTags()
                }
            }
        },
        getGroupTagTooltip(local, en) {
            let html = ''
            if (local && local !== en) {
                html += local + '<br/>'
            }
            html += en
            return html
        },
        getGroupTagStyle(groupName, subGroupName, value) {
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
            // 判断是否存在 tags 中
            for (let tag of this.tags) {
                if (tag.originalValue === value) {
                    style['filter'] = 'grayscale(1)'
                    break
                }
            }
            return style
        },
        _groupTagsExtraNetworkTagsIndexes(data) {
            let name = data.name
            let output_name = data.output_name || undefined
            let indexes = []
            for (let index in this.tags) {
                let tag = this.tags[index]
                if (typeof tag['type'] === 'string' && tag.type === 'wrap') continue
                let find = false
                if (tag.isLora) {
                    find = tag.loraName === name || (output_name && tag.loraName === output_name)
                } else if (tag.isLyco) {
                    find = tag.lycoName === name || (output_name && tag.lycoName === output_name)
                } else if (tag.isEmbedding) {
                    find = tag.embeddingName === name || (output_name && tag.embeddingName === output_name)
                } else {
                    find = tag.originalValue === name || (output_name && tag.originalValue === output_name)
                }
                if (find) {
                    indexes.push(index)
                }
            }
            return indexes
        },
        getGroupTagExtraNetworkStyle(data) {
            let indexes = this._groupTagsExtraNetworkTagsIndexes(data)
            let style = {
                width: this.extraNetworksWidth + 'px',
                height: this.extraNetworksHeight + 'px',
            }
            if (indexes.length) style['filter'] = 'grayscale(1)'
            return style
        },
        getTagsColorKey(groupName, subGroupName) {
            return common.getTagsColorKey(groupName, subGroupName)
        },
        onTagsColorChange(key) {
            this.$emit('update:groupTagsColor', this.groupTagsColor)
        },
        onClickResetTagsColor(key) {
            for (let item of this.groupTagsProcessed) {
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
        onGroupExtraNetworkMouseEnter(e, name) {
            this.$emit('showExtraNetworks', e.target, name, this.onLoraPopupUseKeywords, true, 'groupTags')
        },
        onGroupExtraNetworkMouseMove() {
        },
        onGroupExtraNetworkMouseLeave() {
            this.$emit('hideExtraNetworks')
        },
    }
}
