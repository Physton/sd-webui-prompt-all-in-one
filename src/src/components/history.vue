<template>
    <Transition name="fade">
        <div class="physton-prompt-history" ref="history" v-show="isShow" @mouseenter="onMouseEnter"
             @mouseleave="onMouseLeave" @click.stop="">
            <div class="popup-tabs">
                <div v-for="(group) in histories" :key="group.key"
                     :class="['popup-tab', group.key === historyKey ? 'active': '']" @click="onTabClick(group.key)">
                    <div class="tab-name">{{ getLang(group.name) }}</div>
                    <div class="tab-type">{{ getLang(group.type) }}</div>
                    <div class="tab-count">{{ group.list.length }}</div>
                </div>
            </div>
            <div class="popup-detail" ref="historyDetail" v-show="currentItem && currentItem.tags">
                <div class="popup-item-tags">
                    <template v-for="(tag, index) in currentItem.tags" :key="index">
                        <div v-if="tag.type && tag.type === 'wrap'" class="item-wrap"></div>
                        <div v-else class="item-tag">
                            <div class="item-tag-value">{{ tag.value }}</div>
                            <div class="item-tag-local-value">{{ tag.localValue }}</div>
                        </div>
                    </template>
                </div>
            </div>
            <div v-for="(group) in histories" :key="group.key" :class="['popup-tab-content', group.key === historyKey ? 'active': '']">
                <div class="content-list" v-show="group.list.length > 0">
                    <div class="clear-btn" @click="onDeleteAllHistoryClick">
                        <icon-svg name="remove"/>
                        {{ getLang('delete_all_history') }}
                    </div>
                    <div class="content-item" v-for="(item, index) in group.list" :key="item.id"
                         @mouseenter="onItemMouseEnter(index)" @mouseleave="onItemMouseLeave(index)">
                        <div class="item-header">
                            <div class="item-header-left">
                                <div class="item-header-index">{{ group.list.length - index }}</div>
                                <div class="item-header-time">{{ formatTime(item.time) }}</div>
                                <div class="item-header-name">
                                    <input class="header-name-input" :value="item.name"
                                           @keydown="onNameKeyDown(index, $event)"
                                           @change="onNameChange(index, $event)" :placeholder="getLang('unset_name')">
                                </div>
                            </div>
                            <div class="item-header-right">
                                <div class="header-btn-favorite hover-scale-140" @click="onDeleteClick(index)">
                                    <icon-svg name="remove"/>
                                </div>
                                <div class="header-btn-favorite hover-scale-140" @click="onFavoriteClick(index)"
                                     v-show="item.is_favorite" v-tooltip="getLang('remove_from_favorite')">
                                    <icon-svg name="favorite-yes"/>
                                </div>
                                <div class="header-btn-favorite hover-scale-140" @click="onFavoriteClick(index)"
                                     v-show="!item.is_favorite" v-tooltip="getLang('add_to_favorite')">
                                    <icon-svg name="favorite-no"/>
                                </div>
                                <div class="header-btn-copy hover-scale-140" @click="onCopyClick(index)"
                                     v-tooltip="getLang('copy_to_clipboard')">
                                    <icon-svg name="copy"/>
                                </div>
                                <div class="header-btn-use hover-scale-140" @click="onUseClick(index)"
                                     v-tooltip="getLang('use')">
                                    <icon-svg name="use"/>
                                </div>
                            </div>
                        </div>
                        <div class="item-prompt">{{ item.prompt }}</div>
                    </div>
                </div>
                <div class="content-empty" v-show="group.list.length === 0">
                    <icon-svg name="loading" v-if="loading"/>
                    <span v-else>{{ emptyMsg }}</span>
                </div>
            </div>
        </div>
    </Transition>
</template>
<script>
import common from "@/utils/common";

import LanguageMixin from "@/mixins/languageMixin";
import IconSvg from "@/components/iconSvg.vue";

export default {
    components: {IconSvg},
    props: {},
    mixins: [LanguageMixin],
    data() {
        return {
            historyKey: '',
            histories: [
                {
                    'name': 'txt2img',
                    'type': 'prompt',
                    'key': 'txt2img',
                    'list': [],
                },
                {
                    'name': 'txt2img',
                    'type': 'negative_prompt',
                    'key': 'txt2img_neg',
                    'list': [],
                },
                {
                    'name': 'img2img',
                    'type': 'prompt',
                    'key': 'img2img',
                    'list': [],
                },
                {
                    'name': 'img2img',
                    'type': 'negative_prompt',
                    'key': 'img2img_neg',
                    'list': [],
                },
            ],
            isShow: false,
            loading: false,
            emptyMsg: '',
            mouseEnter: false,
            currentItem: {}
        }
    },
    emits: ['use', 'refreshFavorites'],
    mounted() {
    },
    methods: {
        formatTime(time) {
            return common.formatTime(time * 1000, false)
        },
        getHistories(historyKey) {
            if (!historyKey) return
            let historyItem = this.histories.find(item => item.key === historyKey)
            if (!historyItem) return
            this.loading = true
            this.gradioAPI.getHistories(historyKey).then(res => {
                if (res && res.length > 0) {
                    // 倒序
                    res.reverse()
                    historyItem.list = res
                }
                this.emptyMsg = this.getLang('no_history')
                this.loading = false
            }).catch(err => {
                this.emptyMsg = this.getLang('get_history_error')
                this.loading = false
            })
        },
        show(historyKey, e) {
            if (!historyKey || !e) return
            this.historyKey = historyKey
            if (this.isShow) {
                this.isShow = false
                return
            }
            this.mouseEnter = false

            this.loading = true
            this.isShow = true
            this.$refs.history.style.top = (e.pageY + 2) + 'px'
            this.$refs.history.style.left = (e.pageX + 2) + 'px'

            this.getHistories(this.historyKey)
            this.$nextTick(() => {
                // 如果当前窗口超出屏幕，就自动调整位置
                let rect = this.$refs.history.getBoundingClientRect()
                if (rect.right > window.innerWidth) {
                    this.$refs.history.style.left = (window.innerWidth - rect.width - 2) + 'px'
                }
            })

            // 如果n秒后鼠标还没进来，就隐藏
            setTimeout(() => {
                if (this.mouseEnter) return
                this.hide()
            }, 3000)
        },
        hide() {
            this.mouseEnter = false
            this.isShow = false
        },
        onMouseEnter() {
            this.mouseEnter = true
        },
        onMouseLeave(e) {
            if (!e.relatedTarget) return // 微软输入法BUG
            this.hide()
        },
        onTabClick(key) {
            this.historyKey = key
            this.getHistories(this.historyKey)
        },
        onDeleteClick(index) {
            let group = this.histories.find(item => item.key === this.historyKey)
            if (!group) return
            let history = group.list[index]
            this.gradioAPI.deleteHistory(this.historyKey, history.id).then(res => {
                if (res) {
                    group.list.splice(index, 1)
                }
            })
        },
        onFavoriteClick(index) {
            let group = this.histories.find(item => item.key === this.historyKey)
            if (!group) return
            let history = group.list[index]
            if (!history.is_favorite) {
                this.gradioAPI.doFavorite(this.historyKey, history.id).then(res => {
                    if (res) {
                        history.is_favorite = true
                        this.$emit('refreshFavorites', this.historyKey)
                    }
                })
            } else {
                this.gradioAPI.unFavorite(this.historyKey, history.id).then(res => {
                    if (res) {
                        history.is_favorite = false
                        this.$emit('refreshFavorites', this.historyKey)
                    }
                })
            }
        },
        onCopyClick(index) {
            let group = this.histories.find(item => item.key === this.historyKey)
            if (!group) return
            let history = group.list[index]
            this.$copyText(history.prompt).then(() => {
                this.$toastr.success("success!")
            }).catch(() => {
                this.$toastr.error("error!")
            })
        },
        onNameKeyDown(index, e) {
            if (e.keyCode === 13) {
                // 离开焦点
                e.target.blur()
            }
        },
        onNameChange(index, e) {
            let group = this.histories.find(item => item.key === this.historyKey)
            if (!group) return
            let history = group.list[index]
            const value = e.target.value
            this.gradioAPI.setHistoryName(this.historyKey, history.id, value).then(res => {
                if (res) {
                    history.name = value
                    this.$emit('refreshFavorites', this.historyKey)
                } else {
                    e.target.value = history.name
                }
            }).catch(err => {
                e.target.value = history.name
            })
        },
        onItemMouseEnter(index) {
            let group = this.histories.find(item => item.key === this.historyKey)
            if (!group) return
            this.currentItem = group.list[index]

            this.$nextTick(() => {
                // 判断 historyDetail 是否超出屏幕
                let rect = this.$refs.historyDetail.getBoundingClientRect()
                if (rect.right > window.innerWidth) {
                    this.$refs.historyDetail.style.left = (0 - rect.width - 2) + 'px'
                }
            })
        },
        onItemMouseLeave(index) {
            this.currentItem = {}
        },
        onUseClick(index) {
            let group = this.histories.find(item => item.key === this.historyKey)
            if (!group) return
            this.hide()
            this.$emit('use', group.list[index])
        },
        onDeleteAllHistoryClick() {
            let group = this.histories.find(item => item.key === this.historyKey)
            if (!group) return
            if (!confirm(this.getLang('delete_all_history_confirm'))) return
            this.gradioAPI.deleteHistories(this.historyKey).then(res => {
                group.list = []
            }).catch(err => {
            })
        },
    }
}
</script>