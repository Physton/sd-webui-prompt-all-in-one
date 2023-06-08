import common from "@/utils/common";
import autoSizeInput from "autosize-input";

export default {
    data() {
        return {
            tagClickTimeId: 0,
        }
    },
    mounted() {
        common.gradioApp().addEventListener('mousemove', () => {
            this.$refs.highlightPrompt.hide()
        })
    },
    methods: {
        _setTag(tag) {
            if (typeof tag['type'] === 'string' && tag.type === 'wrap') {
                tag.weightNum = 1
                tag.incWeight = 0
                tag.decWeight = 0
            } else {
                tag.weightNum = common.getTagWeightNum(tag.value)
                tag.weightNum = tag.weightNum <= 0 ? 1 : tag.weightNum
                tag.incWeight = common.getTagIncWeight(tag.value)
                tag.decWeight = common.getTagDecWeight(tag.value)
                // const bracket = common.hasBrackets(tag.value)
            }
            this._setTagClass(tag)
            this.$nextTick(() => {
                this._setTagHeight(tag)
            })
        },
        _setTagHeight(tag) {
            setTimeout(() => {
                let $tag = this.$refs['promptTagValue-' + tag.id][0]
                let height = $tag.offsetHeight
                $tag.parentNode.style.height = height + 'px'
                if (this.$refs['promptTagEdit-' + tag.id]) {
                    this.$refs['promptTagEdit-' + tag.id][0].style.height = height + 'px'
                }
                if (this.$refs['promptTagDelete-' + tag.id]) {
                    this.$refs['promptTagDelete-' + tag.id][0].style.height = height + 'px'
                }
            }, 300)
        },
        _setTagClass(tag) {
            tag.isLora = false
            tag.loraExists = false
            tag.isLyco = false
            tag.lycoExists = false
            tag.isEmbedding = false

            if (typeof tag['type'] === 'string' && tag.type === 'wrap') {
            } else {
                // 判断是否lora
                const match = tag.value.match(common.loraRegex)
                if (match) {
                    tag.isLora = true
                    const loraName = this.loraExists(match[1])
                    if (loraName !== false) {
                        tag.loraExists = true
                        tag.loraName = loraName
                    }
                }

                if (!tag.isLora) {
                    // 判断是否lyco
                    const match = tag.value.match(common.lycoRegex)
                    if (match) {
                        tag.isLyco = true
                        const lycoName = this.lycoExists(match[1])
                        if (lycoName !== false) {
                            tag.lycoExists = true
                            tag.lycoName = lycoName
                        }
                    }
                }

                if (!tag.isLora && !tag.isLyco) {
                    // 判断是否embedding
                    const embeddingName = this.embeddingExists(tag.value)
                    if (embeddingName !== false) {
                        tag.isEmbedding = true
                        tag.value = embeddingName
                    }
                }
            }

            let classes = ['prompt-tag-value']
            if (tag.isLora) {
                classes.push('lora-tag')
                if (!tag.loraExists) {
                    classes.push('lora-not-exists')
                }
            } else if (tag.isLyco) {
                classes.push('lyco-tag')
                if (!tag.lycoExists) {
                    classes.push('lyco-not-exists')
                }
            } else if (tag.isEmbedding) {
                classes.push('embedding-tag')
            } else if (this.neg) {
                classes.push('neg-tag')
            }

            tag.classes = classes
            return classes
        },
        _setTagById(id, value = null, localValue = null) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return false
            if (value !== null) tag.value = value
            if (localValue !== null) tag.localValue = localValue
            return tag
        },
        _appendTag(value, localValue = '', disabled = false, index = -1, type = 'text') {
            // 唯一数：当前时间戳+随机数
            const id = Date.now() + (Math.random() * 1000000).toFixed(0)
            let tag = {
                id,
                value: value === null || value === undefined || value === false ? '' : value,
                localValue: localValue === null || localValue === undefined || localValue === false ? '' : localValue,
                disabled,
                type
            }
            this._setTag(tag)
            // value           = common.setLayers(value, 0, '(', ')')
            // value           = common.setLayers(value, 0, '[', ']')
            if (index >= 0) {
                // 插入到指定位置
                this.tags.splice(index, 0, tag)
            } else {
                index = this.tags.push(tag)
            }
            this.$nextTick(() => {
                if (this.$refs['promptTagEdit-' + id]) autoSizeInput(this.$refs['promptTagEdit-' + id][0])
            })
            return index - 1
        },
        renderTag(id) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return ''
            let value = tag.value
            value = common.escapeHtml(value)
            if (tag.incWeight > 0) {
                value = common.setLayers(value, 0, '(', ')')
                value = '<div class="character">' + value + '</div>'
                let start = '<div class="weight-character">' + '('.repeat(tag.incWeight) + '</div>'
                let end = '<div class="weight-character">' + ')'.repeat(tag.incWeight) + '</div>'
                value = start + value + end
            } else if (tag.decWeight > 0) {
                value = common.setLayers(value, 0, '[', ']')
                value = '<div class="character">' + value + '</div>'
                let start = '<div class="weight-character">' + '['.repeat(tag.decWeight) + '</div>'
                let end = '<div class="weight-character">' + ']'.repeat(tag.decWeight) + '</div>'
                value = start + value + end
            } else {
                value = '<div class="character">' + value + '</div>'
            }
            return value
        },
        isFavorite(id) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return false
            if (typeof window.phystonPromptfavorites === 'object') {
                for (const group of window.phystonPromptfavorites) {
                    if (group.key !== this.favoriteKey) continue
                    for (const favorite of group.list) {
                        if (favorite.tags.length !== 1) continue
                        if (favorite.tags[0].value === tag.value) return favorite.id
                    }
                }
            }
            return false
        },
        onTagMouseEnter(id) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return false
            tag.isFavorite = this.isFavorite(tag.id)

            this.$refs.highlightPrompt.show(tag)
        },
        onTagClick(id) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return false
            if (this.tagClickTimeId) clearTimeout(this.tagClickTimeId)
            this.tagClickTimeId = setTimeout(() => {
                this.editing = {}
                this.editing[tag.id] = true
                this.$forceUpdate()
                this.$nextTick(() => {
                    const input = this.$refs['promptTagEdit-' + tag.id][0]
                    input.focus()
                    input.dispatchEvent(new Event('input'))
                    // input.select()
                })
                clearTimeout(this.tagClickTimeId)
            }, 250)
        },
        onTagDblclick(id) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return false
            clearTimeout(this.tagClickTimeId)
            this.onDisabledTagClick(tag.id)
        },
        onTagInputBlur(id) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return false
            this.editing[tag.id] = false
        },
        onTagInputKeyDown(id, e) {
            if (e.keyCode === 13) {
                let tag = this.tags.find(tag => tag.id === id)
                if (!tag) return false
                this.editing[tag.id] = false
                if (tag.value !== e.target.value) {
                    tag.value = e.target.value
                    this._setTag(tag)
                    this.updateTags()
                }
            }
        },
        onTagInputChange(id, e) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return false
            if (tag.value === e.target.value) return
            tag.value = e.target.value
            this._setTag(tag)
            this.updateTags()
        },
        onTagWeightNumChange(id, e) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return false
            e = typeof e === "number" || typeof a === "string" ? e : e.target.value
            if (tag.weightNum == e) return
            let weightNum = e
            let value = tag.value
            let localValue = tag.localValue
            if (weightNum > 0) {
                if (weightNum === 1 && !this.autoKeepWeightOne) {
                    // 如果权重数是1，那么就去掉权重数
                    const bracket = common.hasBrackets(value)
                    if (bracket[0] === '(' && bracket[1] === ')') {
                        // 移除括号
                        value = common.setLayers(value, 0, bracket[0], bracket[1])
                        if (localValue !== '') localValue = common.setLayers(localValue, 0, bracket[0], bracket[1])
                    } else {
                        // 不移除括号
                    }
                    // 移除权重数
                    value = value.replace(common.weightNumRegex, '$1')
                    if (localValue !== '') localValue = localValue.replace(common.weightNumRegex, '$1')
                } else {
                    // 如果原来没有权重数，那么就加上权重数
                    if (!common.weightNumRegex.test(value)) {
                        // 如果原来有括号，就要加到括号内
                        let bracket = common.hasBrackets(value)
                        if (bracket) {
                            value = common.setLayers(value, 1, bracket[0], bracket[1], ':' + weightNum)
                            if (localValue !== '') localValue = common.setLayers(localValue, 1, bracket[0], bracket[1], ':' + weightNum)
                        } else {
                            value = value + ':' + weightNum
                            if (localValue !== '') localValue = localValue + ':' + weightNum
                        }
                    }
                    // 如果原来没有括号() [] {} <>，那么就加上括号
                    if (!common.hasBrackets(value)) {
                        value = common.setLayers(value, 1, '(', ')')
                        if (localValue !== '') localValue = common.setLayers(localValue, 1, '(', ')')
                    }
                }
                if (value !== tag.value) {
                    tag.value = value
                    if (localValue !== '') tag.localValue = localValue
                    this._setTag(tag)
                }
            } else {
                // 如果原来的括号是<>，那么最小权重数只能是0.1
                const bracket = common.hasBrackets(value)
                if (bracket[0] === '<' && bracket[1] === '>') {
                    weightNum = 0.1
                } else {
                    if (this.autoKeepWeightZero) {
                        // 保留权重数
                        tag.value = value.replace(common.weightNumRegex, '$1:0')
                        if (localValue !== '') tag.localValue = tag.localValue.replace(common.weightNumRegex, '$1:0')
                    } else {
                        // 移除权重数
                        tag.value = value.replace(common.weightNumRegex, '$1')
                        if (localValue !== '') tag.localValue = tag.localValue.replace(common.weightNumRegex, '$1')
                    }
                }
            }
            tag.weightNum = weightNum
            this.updateTags()
        },
        onDeleteTagClick(id) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return false
            let index = this.tags.indexOf(tag)
            this.tags.splice(index, 1)
            this.updateTags()
        },
        onFavoriteTagClick(id) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return false
            let favoriteId = this.isFavorite(tag.id)
            if (!favoriteId) {
                // 收藏
                this.gradioAPI.pushFavorite(this.favoriteKey, [tag], tag.value, tag.localValue === '' ? tag.value : tag.localValue).then(res => {
                    if (res) {
                        tag.isFavorite = true
                        this.$emit('refreshFavorites', this.favoriteKey)
                    }
                })
            } else {
                // 取消收藏
                this.gradioAPI.unFavorite(this.favoriteKey, favoriteId).then(res => {
                    if (res) {
                        tag.isFavorite = false
                        this.$emit('refreshFavorites', this.favoriteKey)
                    }
                })
            }
        },
        onDisabledTagClick(id) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return
            tag.disabled = !tag.disabled
            this.updateTags()
        },
        onIncWeightClick(id, num) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return
            let value = tag.value
            let localValue = tag.localValue
            value = common.setLayers(value, 0, '[', ']')
            if (localValue !== '') localValue = common.setLayers(localValue, 0, '[', ']')
            let incWeight = tag.incWeight
            incWeight += num
            if (incWeight < 0) incWeight = 0
            tag.incWeight = incWeight
            tag.decWeight = 0
            value = common.setLayers(value, incWeight, '(', ')')
            if (localValue !== '') localValue = common.setLayers(localValue, incWeight, '(', ')')
            tag.value = value
            if (localValue !== '') tag.localValue = localValue
            this.updateTags()
        },
        onDecWeightClick(id, num) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return
            let value = tag.value
            let localValue = tag.localValue
            value = common.setLayers(value, 0, '(', ')')
            if (localValue !== '') localValue = common.setLayers(localValue, 0, '(', ')')
            let decWeight = tag.decWeight
            decWeight += num
            if (decWeight < 0) decWeight = 0
            tag.incWeight = 0
            tag.decWeight = decWeight
            value = common.setLayers(value, decWeight, '[', ']')
            if (localValue !== '') localValue = common.setLayers(localValue, decWeight, '[', ']')
            tag.value = value
            if (localValue !== '') tag.localValue = localValue
            this.updateTags()
        },
        onWrapTagClick(id) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return
            let index = this.tags.indexOf(tag)
            let wrapIndex = this._appendTag("\n", "\n", false, -1, 'wrap')
            let wrapTag = this.tags[wrapIndex]
            // 移动到当前标签的下面
            this.tags.splice(wrapIndex, 1);
            // 然后将 'c' 插入到 'e' 后面
            this.tags.splice(index + 1, 0, wrapTag);
            this.updateTags()
        },
        onTranslateToLocalClick(id) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return
            let index = this.tags.indexOf(tag)
            if (this.loading[tag.id + '_local']) return
            this.translates([index], true, true).finally(() => {
                this.updateTags()
            })
        },
        onTranslateToEnglishClick(id) {
            let tag = this.tags.find(tag => tag.id === id)
            if (!tag) return
            let index = this.tags.indexOf(tag)
            if (this.loading[tag.id + '_en']) return
            this.translates([index], false, true).finally(() => {
                this.updateTags()
            })
        },
    }
}