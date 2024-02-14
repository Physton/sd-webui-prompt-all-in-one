import common from "@/utils/common";

export default {
    data() {
        return {
            autocompleteResults: null,
            autocompleteResultsParent: null,

            showAppendList: false,
            appendListStyle: {
                top: 0,
                left: 0,
            },
            appendListSelected: null,
            appendListChildSelected: null,
            appendList: [
                {
                    "type": "wrap",
                    "name": "line_break_character",
                    "icon": "wrap",
                    "children": []
                },
                /*{
                    "type": "lora",
                    "name": "Lora",
                    "children": []
                },*/
                /*{
                    "type": "favorite",
                    "name": "favorite",
                    "icon": "favorite",
                    "children": []
                },
                {
                    "type": "history",
                    "name": "history",
                    "icon": "history",
                    "children": []
                }*/
            ],

            favorites: [],
            autoInputPrompt: 'disabled',
            autoInputPromptKey: '',
        }
    },
    computed: {
        appendListChildItemTags() {
            if (this.appendListSelected === null) return []
            if (this.appendListChildSelected === null) return []
            if (this.appendList[this.appendListSelected].type !== 'favorite' && this.appendList[this.appendListSelected].type !== 'history') return []
            return this.appendList[this.appendListSelected].children[this.appendListChildSelected].tags
        }
    },
    mounted() {
        this.initAutoInputPrompt()
        let temp = [
            {
                'name': 'txt2img',
                'type': 'prompt',
                'key': 'txt2img',
                'neg': false,
            },
            {
                'name': 'txt2img',
                'type': 'negative_prompt',
                'key': 'txt2img_neg',
                'neg': true,
            },
            {
                'name': 'img2img',
                'type': 'prompt',
                'key': 'img2img',
                'neg': false,
            },
            {
                'name': 'img2img',
                'type': 'negative_prompt',
                'key': 'img2img_neg',
                'neg': true,
            },
        ]
        /*for (let i = 0; i < temp.length; i++) {
            if (temp[i].key === this.favoriteKey) {
                // 排到第一位
                let item = temp[i]
                temp.splice(i, 1)
                temp.unshift(item)
                break
            }
        }*/
        temp.forEach(item => {
            if (item.neg !== this.neg) return
            this.appendList.push({
                'type': "favorite",
                'name': ["favorite", item.name/*, item.type*/],
                "icon": "favorite",
                "key": item.key,
                'dataKey': 'favorite.' + item.key,
                "children": [],
            })
        })
        /*temp.forEach(item => {
            this.appendList.push({
                'type': "history",
                'name': ["history", item.name, item.type],
                "icon": "history",
                "key": item.key,
                'dataKey': 'history.' + item.key,
                "children": [],
            })
        })*/
    },
    methods: {
        onUnfoldClick() {
            if (this.hidePanel) {
                this.$nextTick(() => {
                    this.onResize()
                })
            }
            this.$emit("update:hidePanel", !this.hidePanel)
        },
        onTranslatesToLocalClick() {
            if (this.tags.length === 0) return // 没有关键词需要翻译
            if (this.loading['all_local']) {
                // 正在翻译中，取消翻译
                this.cancelMultiTranslate = true
                this.loading['all_local'] = false
                return
            }
            this.loading['all_local'] = true
            let tagIndexes = []
            for (const index in this.tags) {
                if (this.tags[index].type && this.tags[index].type !== 'text') continue
                tagIndexes.push(index)
            }
            return this.translates(tagIndexes, true, true).finally(() => {
                this.loading['all_local'] = false
                this.updateTags()
            })
        },
        onTranslatesToEnglishClick() {
            if (this.tags.length === 0) return // 没有关键词需要翻译
            if (this.loading['all_en']) {
                // 正在翻译中，取消翻译
                this.cancelMultiTranslate = true
                this.loading['all_en'] = false
                return
            }
            this.loading['all_en'] = true
            let tagIndexes = []
            for (const index in this.tags) {
                if (this.tags[index].type && this.tags[index].type !== 'text') continue
                tagIndexes.push(index)
            }
            this.translates(tagIndexes, false, true).finally(() => {
                this.loading['all_en'] = false
                this.updateTags()
            })
        },
        onCopyAllTagsClick() {
            this.copy(this.prompt)
        },
        onDeleteAllTagsClick() {
            if (!confirm(this.getLang('delete_all_keywords_confirm'))) return
            this.tags = []
            this.updateTags()
        },
        onClickLoadWebuiPrompt() {
            this.onTextareaChange(true)
        },
        appendListItemName(item) {
            let names = []
            if (typeof item.name === "object") {
                for (let name of item.name) {
                    names.push(this.getLang(name))
                }
            } else {
                names = [this.getLang(item.name)]
            }
            return names.join(' / ')
        },
        onAppendTagFocus(e) {
            if (this.$refs.promptTagAppend.value === '' || this.$refs.promptTagAppend.value.trim() === '') {
                this.appendListStyle = {
                    top: e.target.offsetTop + e.target.offsetHeight + 'px',
                    left: e.target.offsetLeft + 'px',
                }
                this.appendListSelected = null
                this.appendListChildSelected = null
                this.showAppendList = true
                let dataKeys = []
                this.appendList.forEach(item => {
                    if (typeof item['dataKey'] === 'string') {
                        dataKeys.push(item['dataKey'])
                    }
                })
                this.gradioAPI.getDatas(dataKeys).then(res => {
                    this.appendList.forEach(item => {
                        if (typeof item['dataKey'] !== 'string') return
                        item.children = res[item['dataKey']] || []
                        // 反转
                        item.children.reverse()
                    })
                })
                /*this.gradioAPI.getFavorites(this.favoriteKey).then(res => {
                    this.appendList.forEach(item => {
                        if (item.type !== 'favorite') return
                        item.children = res
                    })
                })
                this.gradioAPI.getHistories(this.historyKey).then(res => {
                    this.appendList.forEach(item => {
                        if (item.type !== 'history') return
                        item.children = res
                    })
                })*/
            }
            this._setTextareaFocus()
        },
        onAppendTagBlur(e) {
            setTimeout(() => {
                this.showAppendList = false
            }, 300)
        },
        selectAppendList(down = true) {
            if (this.appendList.length === 0) return
            if (this.appendListSelected === null) {
                this.appendListSelected = 0
            } else {
                if (down) {
                    this.appendListSelected++
                    if (this.appendListSelected >= this.appendList.length) {
                        this.appendListSelected = 0
                    }
                } else {
                    this.appendListSelected--
                    if (this.appendListSelected < 0) {
                        this.appendListSelected = this.appendList.length - 1
                    }
                }
            }
            this.appendListChildSelected = null
        },
        selectAppendListChild(down = true) {
            if (this.appendList.length === 0) return
            if (this.appendListSelected === null) return
            if (this.appendList[this.appendListSelected].children.length === 0) return
            if (this.appendListChildSelected === null) {
                this.appendListChildSelected = 0
            } else {
                if (down) {
                    this.appendListChildSelected++
                    if (this.appendListChildSelected >= this.appendList[this.appendListSelected].children.length) {
                        this.appendListChildSelected = 0
                    }
                } else {
                    this.appendListChildSelected--
                    if (this.appendListChildSelected < 0) {
                        this.appendListChildSelected = this.appendList[this.appendListSelected].children.length - 1
                    }
                }
            }
            this.scrollAppendListChild()
        },
        scrollAppendListChild() {
            if (this.appendListSelected === null) return
            if (this.appendListChildSelected === 0 || this.appendListChildSelected === null) {
                this.$refs.promptAppendListChildren[this.appendListSelected].scrollTop = 0
            } else {
                this.$refs.promptAppendListChild[this.appendListChildSelected].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            }
        },
        onAppendTagKeyDown(e, localValue = null) {
            if (e.keyCode === 38 || e.keyCode === 40) {
            } else if (e.keyCode === 13) {
                if (this.getAutocompleteResults() && ((this.autocompleteResultsParent && this.autocompleteResultsParent.style.display === 'flex') || this.autocompleteResults.style.display === 'none') && this.getAutocompleteResultsSelected()) {
                    let text = this.getAutocompleteResultsSelectedText()
                    setTimeout(() => {
                        localValue = this.$refs.promptTagAppend.value
                        if (text) {
                            localValue = text
                        } else {
                            text = this.getAutocompleteResultsSelectedText()
                            if (text) localValue = text
                        }
                        this.onAppendTagKeyDown(e, localValue)
                    }, 300)
                    return
                }

                let tags = this.$refs.promptTagAppend.value
                this.$refs.promptTagAppend.value = ''
                this.showAppendList = true
                // [night light:magical forest: 5, 15]
                console.log(tags, localValue)
                if (localValue) {
                    // 去除末尾的逗号
                    tags = tags.replace(/\s*,\s*$/, '').trim()
                    if (common.hasBrackets(tags)) {
                        tags = common.replaceBrackets(tags)
                    }
                    this._appendTag(tags, localValue)
                    this.updateTags()
                } else {
                    if (common.hasBrackets(tags)) {
                        // 如果已经被英文括号括起来，那么就不需要再分词了
                        tags = common.replaceBrackets(tags)
                        tags = [tags]
                    } else {
                        tags = common.splitTags(tags, this.autoBreakBeforeWrap, this.autoBreakAfterWrap)
                    }
                    let indexes = []
                    tags.forEach(tag => {
                        let index = -1
                        if (tag === "\n") {
                            index = this._appendTag("\n", "\n", false, -1, 'wrap')
                        } else {
                            index = this._appendTag(tag)
                        }
                        if (index !== -1) indexes.push(index)
                    })
                    this.autoTranslateByIndexes(indexes)
                }
            } else {
                // 不是上下键，也不是回车
                this.removeAutocompleteResultsSelected()
            }
        },
        autoTranslateByIndexes(indexes) {
            this.updatePrompt() // 先更新再翻译
            if (this.autoTranslateToEnglish || this.autoTranslateToLocal) {
                this.$nextTick(() => {
                    let useNetwork = !(this.tagCompleteFile && this.onlyCsvOnAuto)
                    if (this.autoTranslateToEnglish) {
                        // 如果开启了自动翻译到英语，那么就自动翻译
                        this.translates(indexes, false, useNetwork).finally(() => {
                            this.updateTags()
                        })
                    } else if (this.autoTranslateToLocal) {
                        // 如果开启了自动翻译到本地语言，那么就自动翻译
                        this.translates(indexes, true, useNetwork).finally(() => {
                            this.updateTags()
                        })
                    }
                })
            } else {
                this.updateTags()
            }
        },
        onAppendTagKeyUp(e) {
            if (this.$refs.promptTagAppend.value === '' || this.$refs.promptTagAppend.value.trim() === '') {
                this.$refs.promptTagAppend.value = ''
                this.showAppendList = true

                if (e.keyCode === 38 || e.keyCode === 40) {
                    // 如果是上下键
                    if (this.appendListChildSelected === null) {
                        this.selectAppendList(e.keyCode === 40)
                    } else {
                        this.selectAppendListChild(e.keyCode === 40)
                    }
                } else if (e.keyCode === 37 || e.keyCode === 39) {
                    // 如果是左右键
                    if (this.appendListSelected !== null) {
                        if (e.keyCode === 37) {
                            this.appendListChildSelected = null
                            this.scrollAppendListChild()
                        } else {
                            if (this.appendList[this.appendListSelected].children.length === 0) {
                                this.appendListChildSelected = null
                            } else {
                                this.appendListChildSelected = 0
                                this.scrollAppendListChild()
                            }
                        }
                    }
                } else if (e.keyCode === 13) {
                    // 如果是回车键
                    this._appendTagByList()
                    this.scrollAppendListChild()
                    this.appendListSelected = null
                    this.appendListChildSelected = null
                }
            } else {
                this.showAppendList = false
            }
        },
        onAppendGroupClick(index, childIndex, e) {
            if (index === null) return
            this.appendListSelected = index
            if (childIndex === null) {
                // 如果是点击的是父级
                if (this.appendList[this.appendListSelected].children.length > 0) return
            } else {
                this.appendListChildSelected = childIndex
            }
            this._appendTagByList()
        },
        onAppendListChildMouseLeave(index, childIndex, e) {
            this.appendListSelected = null
            this.appendListChildSelected = null
        },
        onAppendListChildMouseEnter(index, childIndex, e) {
            this.appendListSelected = index
            this.appendListChildSelected = childIndex
        },
        _appendTagByList() {
            if (this.appendListSelected === null) return
            const appendItem = this.appendList[this.appendListSelected]
            let appendChildItem = null
            if (appendItem.children.length > 0) {
                if (this.appendListChildSelected !== null) {
                    // 有子项并且选中了子项
                    appendChildItem = appendItem.children[this.appendListChildSelected]
                }
            } else {
                // 没有子项
            }
            let appendTags = []
            switch (appendItem.type) {
                case 'wrap':
                    appendTags.push({
                        value: "\n",
                        localValue: "\n",
                        disabled: false,
                        type: 'wrap'
                    })
                    break
                case 'lora':
                    break
                case 'favorite':
                case 'history':
                    if (appendChildItem) {
                        appendChildItem.tags.forEach(tag => {
                            appendTags.push({
                                value: tag.value,
                                localValue: tag.localValue,
                                disabled: tag.disabled,
                                type: tag.type || 'text'
                            })
                        })
                    }
                    break
            }
            if (appendTags.length <= 0) return
            appendTags.forEach(tag => {
                this._appendTag(tag.value, tag.localValue, tag.disabled, -1, tag.type)
            })
            this.updateTags()
        },
        getAutocompleteResults() {
            if (!this.autocompleteResults) {
                const autocompleteResults = this.$refs.promptTagAppend.parentElement.querySelector('.autocompleteResults')
                if (autocompleteResults) {
                    this.autocompleteResults = autocompleteResults
                    // 增加mousemove事件
                    if (this.autocompleteResults.getAttribute('data-mousemove') !== 'true') {
                        this.autocompleteResults.setAttribute('data-mousemove', 'true')
                        this.autocompleteResults.addEventListener('mousemove', (e) => {
                            this.bindAutocompleteResultsClick()
                        })
                    }
                    const autocompleteParent = this.$refs.promptTagAppend.parentElement.querySelector('.autocompleteParent')
                    if (autocompleteParent) {
                        this.autocompleteResultsParent = autocompleteParent
                    }
                }
            }
            return this.autocompleteResults
        },
        removeAutocompleteResultsSelected() {
            const autocompleteResults = this.getAutocompleteResults()
            if (!autocompleteResults) return false
            autocompleteResults.querySelectorAll('li').forEach(li => {
                li.classList.remove('selected')
            })
            return true
        },
        getAutocompleteResultsSelected() {
            const autocompleteResults = this.getAutocompleteResults()
            if (!autocompleteResults) return null
            const el = autocompleteResults.querySelector('li.selected')
            if (!el) return null
            return el
        },
        getAutocompleteResultsSelectedText(el = null) {
            if (!el) {
                el = this.getAutocompleteResultsSelected()
                if (!el) return null
            }
            const $acListItem = el.querySelector('.acListItem')
            const text = $acListItem.innerText
            const match = text.match(/\[(.+?)\]/)
            if (!match) return null
            return match[1]
        },
        bindAutocompleteResultsClick() {
            this.getAutocompleteResults()
            if (!this.autocompleteResults) return
            // 获取列表
            let lis = this.autocompleteResults.querySelectorAll('li')
            // 给每个li绑定点击事件
            lis.forEach(li => {
                // 判断是否已经绑定过
                if (li.getAttribute('physton-on-clicked') === 'true') return
                li.setAttribute('physton-on-clicked', 'true')
                li.addEventListener('click', () => {
                    this.onAutocompleteResultsClicked(li)
                })
            })
        },
        onAutocompleteResultsClicked(li) {
            const text = this.getAutocompleteResultsSelectedText(li)
            setTimeout(() => {
                let tags = this.$refs.promptTagAppend.value.replace(/,\s*$/, '')
                this.$refs.promptTagAppend.value = ''
                // 去除末尾的逗号
                tags = tags.replace(/\s*,\s*$/, '').trim()
                if (common.hasBrackets(tags)) {
                    tags = common.replaceBrackets(tags)
                }
                this._appendTag(tags, text)
                this.updateTags()
            }, 300)
        },
        onSettingBoxMouseEnter() {
            this.favorites = typeof window.phystonPromptfavorites === 'object' ? window.phystonPromptfavorites : []
        },
        getCurrentTypeFavorites() {
            this.favorites = typeof window.phystonPromptfavorites === 'object' ? window.phystonPromptfavorites : []
            let favorites = []
            this.favorites.forEach(favorite => {
                if (this.neg) {
                    if (favorite.type !== 'negative_prompt') return
                } else {
                    if (favorite.type !== 'prompt') return
                }
                favorites.push(favorite)
            })
            return favorites
        },
        onAutoInputPromptChange() {
            this.gradioAPI.setData(this.autoInputPromptKey, this.autoInputPrompt).then(() => {
                this.$toastr.success(this.getLang('success'))
            }).catch(() => {
                this.$toastr.error(this.getLang('failed'))
            })
        },
        initAutoInputPrompt() {
            this.autoInputPromptKey = 'autoInputPrompt-' + this.name
            this.gradioAPI.getData(this.autoInputPromptKey).then(res => {
                if (res === null) return
                this.autoInputPrompt = res
                if (this.autoInputPrompt === 'last') {
                    this.gradioAPI.getLatestHistory(this.historyKey).then(res => {
                        this.useHistory(res)
                    })
                } else {
                    const getFavorites = () => {
                        if (typeof window.phystonPromptfavorites === 'object' && window.phystonPromptfavorites.length > 0) {
                            for (let item of window.phystonPromptfavorites) {
                                for (let favorite of item.list) {
                                    if (favorite.id === this.autoInputPrompt) {
                                        this.useFavorite(favorite)
                                        return
                                    }
                                }
                            }
                            return
                        }
                        setTimeout(getFavorites, 100)
                    }
                    setTimeout(getFavorites, 100)
                }
            })
        },
    }
}