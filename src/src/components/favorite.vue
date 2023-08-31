<template>
    <Transition name="fade">
        <div class="physton-prompt-favorite" ref="favorite" v-show="isShow" @mouseenter="onMouseEnter"
             @mouseleave="onMouseLeave" @click.stop="">
            <div class="popup-tabs">
                <div v-for="(group) in favorites" :key="group.key"
                     :class="['popup-tab', group.key === favoriteKey ? 'active': '']" @click="onTabClick(group.key)">
                    <div class="tab-name">{{ getLang(group.name) }}</div>
                    <div class="tab-type">{{ getLang(group.type) }}</div>
                    <div class="tab-count">{{ group.list.length }}</div>
                </div>
            </div>
            <div class="popup-detail" ref="favoriteDetail" v-show="currentItem && currentItem.tags">
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
            <div v-for="(group) in favorites" :key="group.key" :class="['popup-tab-content', group.key === favoriteKey ? 'active': '']">
                <div class="content-list" v-show="group.list.length > 0">
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
            favoriteKey: '',
            favorites: [
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
    emits: ['use'],
    mounted() {
        this.favorites.forEach(item => {
            this.getFavorites(item.key)
        })
    },
    methods: {
        formatTime(time) {
            return common.formatTime(time * 1000, false)
        },
        getFavorites(favoriteKey) {
            if (!favoriteKey) return
            let favoriteItem = this.favorites.find(item => item.key === favoriteKey)
            if (!favoriteItem) return
            this.loading = true
            this.gradioAPI.getFavorites(favoriteKey).then(res => {
                if(res && res.length > 0){
                    // 倒序
                    res.reverse()
                    res.forEach(item => {
                        item.is_favorite = true
                    })
                    favoriteItem.list = res
                }
                window.phystonPromptfavorites = this.favorites
                this.emptyMsg = this.getLang('no_favorite')
                this.loading = false
            }).catch(err => {
                this.emptyMsg = this.getLang('get_favorite_error')
                this.loading = false
            })
        },
        show(favoriteKey, e) {
            if (!favoriteKey || !e) return
            this.favoriteKey = favoriteKey
            if (this.isShow) {
                this.isShow = false
                return
            }
            this.mouseEnter = false

            this.loading = true
            this.isShow = true
            this.$refs.favorite.style.top = (e.pageY + 2) + 'px'
            this.$refs.favorite.style.left = (e.pageX + 2) + 'px'

            this.getFavorites(this.favoriteKey)
            this.$nextTick(() => {
                // 如果当前窗口超出屏幕，就自动调整位置
                let rect = this.$refs.favorite.getBoundingClientRect()
                if (rect.right > window.innerWidth) {
                    this.$refs.favorite.style.left = (window.innerWidth - rect.width - 2) + 'px'
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
            this.favoriteKey = key
            this.getFavorites(this.favoriteKey)
        },
        onFavoriteClick(index) {
            let group = this.favorites.find(item => item.key === this.favoriteKey)
            if (!group) return
            let favorite = group.list[index]
            if (!favorite.is_favorite) {
                this.gradioAPI.doFavorite(this.favoriteKey, favorite.id).then(res => {
                    if (res) {
                        favorite.is_favorite = true
                        window.phystonPromptfavorites = this.favorites
                    }
                })
            } else {
                this.gradioAPI.unFavorite(this.favoriteKey, favorite.id).then(res => {
                    if (res) {
                        favorite.is_favorite = false
                        window.phystonPromptfavorites = this.favorites
                    }
                })
            }
        },
        onCopyClick(index) {
            let group = this.favorites.find(item => item.key === this.favoriteKey)
            if (!group) return
            let favorite = group.list[index]
            this.$copyText(favorite.prompt).then(() => {
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
            let group = this.favorites.find(item => item.key === this.favoriteKey)
            if (!group) return
            let favorite = group.list[index]
            const value = e.target.value
            this.gradioAPI.setFavoriteName(this.favoriteKey, favorite.id, value).then(res => {
                if (res) {
                    favorite.name = value
                    window.phystonPromptfavorites = this.favorites
                } else {
                    e.target.value = favorite.name
                }
            }).catch(err => {
                e.target.value = favorite.name
            })
        },
        onItemMouseEnter(index) {
            let group = this.favorites.find(item => item.key === this.favoriteKey)
            if (!group) return
            this.currentItem = group.list[index]

            this.$nextTick(() => {
                // 判断 favoriteDetail 是否超出屏幕
                let rect = this.$refs.favoriteDetail.getBoundingClientRect()
                if (rect.right > window.innerWidth) {
                    this.$refs.favoriteDetail.style.left = (0 - rect.width - 2) + 'px'
                }
            })
        },
        onItemMouseLeave(index) {
            this.currentItem = {}
        },
        onUseClick(index) {
            let group = this.favorites.find(item => item.key === this.favoriteKey)
            if (!group) return
            this.hide()
            this.$emit('use', group.list[index])
        },
    }
}
</script>