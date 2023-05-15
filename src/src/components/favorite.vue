<template>
    <div class="physton-prompt-favorite" ref="favorite" :style="style" @mouseenter="onMouseEnter"
         @mouseleave="onMouseLeave">
        <div class="favorite-content">
            <div class="favorite-detail" v-show="currentItem && currentItem.tags">
                <div class="favorite-item-tags">
                    <div class="favorite-item-tag" v-for="(tag, index) in currentItem.tags" :key="index">
                        <div class="item-tag-value">{{ tag.value }}</div>
                        <div class="item-tag-local-value">{{ tag.localValue }}</div>
                    </div>
                </div>
            </div>
            <div class="favorite-list" v-show="favorites.length > 0" :style="{height: defaultHeight + 'px'}">
                <div class="favorite-item" v-for="(item, index) in favorites" :key="item.id"
                     @mouseenter="onItemMouseEnter(index)" @mouseleave="onItemMouseLeave(index)">
                    <div class="favorite-item-header">
                        <div class="item-header-left">
                            <div class="item-header-index">{{ favorites.length - index }}</div>
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
                                <icon-favorite-state :is-favorite="true" width="20" height="20"/>
                            </div>
                            <div class="header-btn-favorite hover-scale-140" @click="onFavoriteClick(index)"
                                 v-show="!item.is_favorite" v-tooltip="getLang('add_to_favorite')">
                                <icon-favorite-state :is-favorite="false" width="20" height="20"/>
                            </div>
                            <div class="header-btn-copy hover-scale-140" @click="onCopyClick(index)"
                                 v-tooltip="getLang('copy_to_clipboard')">
                                <icon-copy width="20" height="20" color="#fff"/>
                            </div>
                            <div class="header-btn-use hover-scale-140" @click="onUseClick(index)"
                                 v-tooltip="getLang('use')">
                                <icon-use width="20" height="20" color="#fff"/>
                            </div>
                        </div>
                    </div>
                    <div class="favorite-item-prompt">{{ item.prompt }}</div>
                </div>
            </div>
        </div>
        <div class="favorite-empty" v-show="favorites.length === 0">
            <icon-loading width="64" height="64" v-if="loading"/>
            <span v-else>{{ emptyMsg }}</span>
        </div>
    </div>
</template>
<script>
import IconFavoriteState from "@/components/icons/iconFavoriteState.vue";
import common from "@/utils/common";
import IconLoading from "@/components/icons/iconLoading.vue";
import IconCopy from "@/components/icons/iconCopy.vue";

import LanguageMixin from "@/mixins/languageMixin";
import IconUse from "@/components/icons/iconUse.vue";

export default {
    components: {IconUse, IconCopy, IconLoading, IconFavoriteState},
    props: {
        favoriteKey: {
            type: String,
            default: '',
            required: true,
        }
    },
    mixins: [LanguageMixin],
    data() {
        return {
            favorites: [],
            isShow: false,
            top: 0,
            left: 0,
            loading: false,
            emptyMsg: '',
            defaultWidth: 500,
            defaultHeight: 500,
            style: {
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                overflow: 'hidden',
            },
            mouseEnter: false,
            currentItem: {}
        }
    },
    mounted() {
    },
    methods: {
        formatTime(time) {
            let now = new Date(time * 1000);
            let year = now.getFullYear();
            let month = now.getMonth() + 1;
            if (month < 10) month = "0" + month;
            let day = now.getDate();
            if (day < 10) day = "0" + day;
            let hour = now.getHours();
            if (hour < 10) hour = "0" + hour;
            let minute = now.getMinutes();
            if (minute < 10) minute = "0" + minute;
            let second = now.getSeconds();
            if (second < 10) second = "0" + second;
            return `${month}/${day} ${hour}:${minute}:${second}`
        },
        show($button) {
            if (!$button) return
            if (this.isShow) {
                this._hide(0)
                return
            }
            this.mouseEnter = false
            this.favorites = []

            let eWidth = $button.offsetWidth
            let eHeight = $button.offsetHeight
            let top = $button.offsetTop
            let left = $button.offsetLeft + eWidth + 2
            if (top + this.defaultHeight > window.innerHeight) top = window.innerHeight - this.defaultHeight
            if (left + this.defaultWidth > window.innerWidth) left = window.innerWidth - this.defaultWidth
            if (top < 0) top = 0
            if (left < 0) left = 0
            this.top = top
            this.left = left

            this._show()
            this.gradioAPI.getFavorites(this.favoriteKey).then(res => {
                // 倒序
                res.reverse()
                res.forEach(item => {
                    item.is_favorite = true
                })
                this.favorites = res
                this.emptyMsg = this.getLang('no_favorite')
                this.loading = false
            }).catch(err => {
                this.emptyMsg = this.getLang('get_favorite_error')
                this.loading = false
            })

            // 如果n秒后鼠标还没进来，就隐藏
            setTimeout(() => {
                if (this.mouseEnter) return
                this._hide(0)
            }, 3000)
        },
        _show() {
            this.isShow = true
            this.style.top = this.top + 'px'
            this.style.left = this.left + 'px'
            this.style.width = this.defaultWidth + 'px'
            this.style.height = this.defaultHeight + 'px'
            this.style.overflow = 'visible'
        },
        _hide(timeout = 1000) {
            this.isShow = false
            setTimeout(() => {
                if (this.isShow) return
                this.style.overflow = 'hidden'
                this.style.width = 0
                this.style.height = 0
                setTimeout(() => {
                    if (this.isShow) return
                    this.style.top = '-9999px'
                    this.style.left = '-9999px'
                }, 200)
            }, timeout)
        },
        hide(timeout = 1000) {
            this._hide(timeout)
        },
        onMouseEnter() {
            this.mouseEnter = true
            this._show()
        },
        onMouseLeave() {
            this.mouseEnter = false
            this._hide()
        },
        onFavoriteClick(index) {
            let favorite = this.favorites[index]
            if (!favorite.is_favorite) {
                this.gradioAPI.doFavorite(this.favoriteKey, favorite.id).then(res => {
                    if (res) {
                        this.favorites[index].is_favorite = true
                    }
                })
            } else {
                this.gradioAPI.unFavorite(this.favoriteKey, favorite.id).then(res => {
                    if (res) {
                        this.favorites[index].is_favorite = false
                    }
                })
            }
        },
        onCopyClick(index) {
            this.$copyText(this.favorites[index].prompt).then(() => {
                this.$toastr.success("success!")
            }).catch(() => {
                this.$toastr.error("error!")
            })
        },
        onNameKeyDown(index, e) {
            if (e.keyCode === 13) {
                // 离开焦点
                e.target.blur()
                // this.favorites[index].name = e.target.value
            }
        },
        onNameChange(index, e) {
            const value = e.target.value
            this.gradioAPI.setFavoriteName(this.favoriteKey, this.favorites[index].id, value).then(res => {
                if (res) {
                    this.favorites[index].name = value
                } else {
                    e.target.value = this.favorites[index].name
                }
            }).catch(err => {
                e.target.value = this.favorites[index].name
            })
        },
        onItemMouseEnter(index) {
            this.currentItem = this.favorites[index]
        },
        onItemMouseLeave(index) {
            this.currentItem = {}
        },
        onUseClick(index) {
            this._hide(0)
            this.$emit('use', this.favorites[index])
        },
    }
}
</script>