export default {
    data() {
        return {
            // 鼠标框选功能
            dropStartX: 0,
            dropStartY: 0,
            dropEndX: 0,
            dropEndY: 0,
            dropOffsetX: 0,
            dropOffsetY: 0,
            dropIsSelecting: false,
            dropIsStart: false,
            dropIsEnd: false,
            dropArea: {
                top: 0,
                left: 0,
                width: 0,
                height: 0,
            },
            dropTags: [],
            dropTimeId: 0,
        }
    },
    methods: {
        _dropOver() {
            this.dropIsSelecting = false
            this.dropIsStart = false
            this.dropIsEnd = false
            this.dropTags = []
            for (let i = 0; i < this.$refs.promptTagsList.children.length; i++) {
                let tag = this.$refs.promptTagsList.children[i]
                if (tag.style.display === 'none') {
                    // 删除display:none属性
                    tag.style.display = ''
                }
                tag.classList.remove('drop-selected')
            }
        },
        onDropMouseDown(e) {
            if (this.droping) return
            this._dropOver()
            this.dropOffsetX = e.clientX - e.layerX
            this.dropOffsetY = e.clientY - e.layerY
            this.dropStartX = e.clientX - this.dropOffsetX
            this.dropStartY = e.clientY - this.dropOffsetY
            this.dropEndX = e.clientX - this.dropOffsetX
            this.dropEndY = e.clientY - this.dropOffsetY
            this.dropIsStart = true
        },
        onDropMouseMove(e) {
            if (this.dropIsStart) {
                this.dropIsSelecting = true
                this.dropEndX = e.clientX - this.dropOffsetX
                this.dropEndY = e.clientY - this.dropOffsetY
                let left = Math.min(this.dropStartX, this.dropEndX)
                let top = Math.min(this.dropStartY, this.dropEndY)
                let width = Math.abs(this.dropStartX - this.dropEndX)
                let height = Math.abs(this.dropStartY - this.dropEndY)
                // 设置不超过 this.$refs.promptTags 范围
                left = Math.max(left, 0)
                top = Math.max(top, 0)
                width = Math.min(width, this.$refs.promptTags.clientWidth - left)
                height = Math.min(height, this.$refs.promptTags.clientHeight - top)

                this.dropArea.top = top
                this.dropArea.left = left
                this.dropArea.width = width
                this.dropArea.height = height

                if (this.dropTimeId) clearTimeout(this.dropTimeId)
                this.dropTimeId = setTimeout(this.dropSelectItems, 10)
            }
            this.$emit('hideExtraNetworks')
        },
        dropSelectItems() {
            if (this.dropTimeId) clearTimeout(this.dropTimeId)
            let selectIds = []
            for (let i = 0; i < this.$refs.promptTagsList.children.length; i++) {
                let tag = this.$refs.promptTagsList.children[i]
                if (!tag.classList.contains('prompt-tag')) continue
                let tagLeft = tag.offsetLeft
                let tagTop = tag.offsetTop
                let tagWidth = tag.clientWidth
                let tagHeight = tag.clientHeight
                let tagRight = tagLeft + tagWidth
                let tagBottom = tagTop + tagHeight
                let isSelect = !(tagRight < this.dropArea.left || tagBottom < this.dropArea.top || tagLeft > this.dropArea.left + this.dropArea.width || tagTop > this.dropArea.top + this.dropArea.height)
                if (isSelect) {
                    selectIds.push(tag.getAttribute('data-id'))
                    tag.classList.add('drop-selected')
                } else {
                    tag.classList.remove('drop-selected')
                }
                this.dropTags = selectIds
            }
        },
        onDropMouseUp(e) {
            this.dropIsSelecting = false
            this.dropIsStart = false
            this.dropIsEnd = true
            this.$refs.dropSelectBtns.style.left = this.$refs.dropSelectBox.style.left
            this.$refs.dropSelectBtns.style.top = this.$refs.dropSelectBox.style.top
        },
        _getDropTags() {
            let tags = []
            this.dropTags.forEach(id => {
                let tag = this.tags.find(tag => tag.id === id)
                if (!tag) return
                tags.push(tag)
            })
            return tags
        },
        _getDropIndexes() {
            let indexes = []
            this.dropTags.forEach(id => {
                let index = this.tags.findIndex(tag => tag.id === id)
                if (index === -1) return
                indexes.push(index)
            })
            return indexes
        },
        _getDropTagsEle() {
            let elements = []
            this.dropTags.forEach(id => {
                let tag = this.$refs.promptTagsList.querySelector(`.prompt-tag[data-id="${id}"]`)
                if (!tag) return
                elements.push(tag)
            })
            return elements
        },
        onDropCopy() {
            let tags = this._getDropTags()
            this._dropOver()
            let prompt = this.genPrompt(tags, true)
            this.copy(prompt)
        },
        onDropFavorite() {
            let tags = this._getDropTags()
            this._dropOver()
            let prompt = this.genPrompt(tags, true)
            this.gradioAPI.pushFavorite(this.favoriteKey, tags, prompt, '').then(res => {
                if (res) {
                    this.$toastr.success(this.getLang('success'))
                    this.$emit('refreshFavorites', this.favoriteKey)
                } else {
                    this.$toastr.error(this.getLang('failed'))
                }
            }).catch(error => {
                this.$toastr.error(this.getLang('failed'))
            })
        },
        onDropDisable() {
            let tags = this._getDropTags()
            this._dropOver()
            tags.forEach(tag => {
                tag.disabled = true
            })
            this.updateTags()
        },
        onDropEnable() {
            let tags = this._getDropTags()
            this._dropOver()
            tags.forEach(tag => {
                tag.disabled = false
            })
            this.updateTags()
        },
        onDropDelete() {
            let indexes = this._getDropIndexes()
            this._dropOver()
            indexes.sort((a, b) => b - a)
            indexes.forEach(index => {
                this.tags.splice(index, 1)
            })
            this.updateTags()
        },
    }
}