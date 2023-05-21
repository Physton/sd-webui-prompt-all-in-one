<template>
    <div class="physton-prompt" :name="name">
        <div :class="['prompt-main', hidePanel ? 'fold': '']" @click="onPromptMainClick">
            <div class="prompt-header">
                <div class="prompt-unfold" @click="onUnfoldClick">
                    <icon-svg class="hover-scale-120" name="unfold"/>
                </div>
                <div class="prompt-header-title">{{ neg ? getLang('negative_prompt') : getLang('prompt') }}</div>
                <div class="prompt-header-counter" v-show="counterText">({{ counterText }})</div>
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <div class="extend-btn-group">
                            <div class="extend-btn-item" v-tooltip="'Language: ' + langName"
                                 @click="$emit('click:selectLanguage', $event)">
                                <icon-svg class="hover-scale-120" name="i18n"/>
                            </div>
                            <div class="extend-btn-item">
                                <icon-svg class="hover-scale-120" name="setting" v-tooltip="getLang('setting_desc')"/>
                                <div class="setting-box">
                                    <div v-if="translateApiItem.name && !isEnglish" class="extend-btn-item"
                                         v-tooltip="getLang('translate_api') + ': ' + translateApiItem.name"
                                         @click="$emit('click:translateApi', $event)">
                                        <icon-svg class="hover-scale-120" name="api"/>
                                    </div>
                                    <div class="extend-btn-item"
                                         v-tooltip="getLang('theme_extension')"
                                         @click="$emit('click:selectTheme', $event)">
                                        <icon-svg class="hover-scale-120" name="theme"/>
                                    </div>
                                    <div class="gradio-checkbox hover-scale-120" v-show="!isEnglish">
                                        <label v-tooltip="getLang('auto_translate_to_local_language')">
                                            <input type="checkbox" name="auto_translate_to_local_language" value="1"
                                                   :checked="autoTranslateToLocal"
                                                   @change="$emit('update:autoTranslateToLocal', $event.target.checked)">
                                            <icon-svg name="translate"/>
                                        </label>
                                    </div>
                                    <div class="gradio-checkbox hover-scale-120" v-show="!isEnglish">
                                        <label v-tooltip="getLang('auto_translate_to_english')">
                                            <input type="checkbox" name="auto_translate_to_english" value="1"
                                                   :checked="autoTranslateToEnglish"
                                                   @change="$emit('update:autoTranslateToEnglish', $event.target.checked)">
                                            <icon-svg name="english"/>
                                        </label>
                                    </div>
                                    <div class="gradio-checkbox hover-scale-120">
                                        <label v-tooltip="getLang('is_remove_space')">
                                            <input type="checkbox" name="auto_remove_space" value="1"
                                                   :checked="autoRemoveSpace"
                                                   @change="$emit('update:autoRemoveSpace', $event.target.checked)">
                                            <icon-svg name="remove-space"/>
                                        </label>
                                    </div>
                                    <div class="gradio-checkbox hover-scale-120">
                                        <label v-tooltip="getLang('whether_to_enable_tooltip')">
                                            <input type="checkbox" name="enable_tooltip" value="1"
                                                   :checked="enableTooltip"
                                                   @change="$emit('update:enableTooltip', $event.target.checked)">
                                            <icon-svg name="tooltip"/>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--<div class="prompt-header-break"></div>-->
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <div class="extend-btn-group">
                            <div class="extend-btn-item" ref="historyButton" v-tooltip="getLang('history')"
                                 @click="$emit('click:showHistory', $event)">
                                <icon-svg class="hover-scale-120" name="history"/>
                            </div>
                            <div class="extend-btn-item" ref="favoriteButton"
                                 v-tooltip="getLang('favorite')" @click="$emit('click:showFavorite', $event)">
                                <icon-svg class="hover-scale-120" name="favorite"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="prompt-header-extend" v-show="!isEnglish">
                    <div class="extend-content">
                        <div class="extend-btn-group">
                            <div class="extend-btn-item" v-tooltip="getLang('translate_keywords_to_local_language')"
                                 @click="onTranslatesToLocalClick">
                                <icon-svg v-if="!loading['all_local']" class="hover-scale-120" name="translate"/>
                                <icon-svg v-if="loading['all_local']" class="hover-scale-120" name="loading"/>
                            </div>
                            <div class="extend-btn-item" v-tooltip="getLang('translate_all_keywords_to_english')"
                                 @click="onTranslatesToEnglishClick">
                                <icon-svg v-if="!loading['all_en']" class="hover-scale-120" name="english"/>
                                <icon-svg v-if="loading['all_en']" class="hover-scale-120" name="loading"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <div class="extend-btn-group">
                            <div class="extend-btn-item" v-tooltip="getLang('copy_keywords_to_clipboard')"
                                 @click="onCopyAllTagsClick">
                                <icon-svg class="hover-scale-120" name="copy"/>
                            </div>
                            <div class="extend-btn-item" v-tooltip="getLang('delete_all_keywords')"
                                 @click="onDeleteAllTagsClick">
                                <icon-svg class="hover-scale-120" name="remove"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="prompt-header-extend prompt-append">
                    <div class="extend-content">
                        <div class="gradio-checkbox hover-scale-120">
                            <label v-if="hideDefaultInput" v-tooltip="getLang('show_default_input_box')">
                                <input type="checkbox" name="hide_default_input" value="1"
                                       :checked="!hideDefaultInput"
                                       @change="$emit('update:hideDefaultInput', !$event.target.checked)">
                                <icon-svg name="input"/>
                            </label>
                            <label v-else v-tooltip="getLang('hide_default_input_box')">
                                <input type="checkbox" name="hide_default_input" value="1"
                                       :checked="!hideDefaultInput"
                                       @change="$emit('update:hideDefaultInput', !$event.target.checked)">
                                <icon-svg name="input"/>
                            </label>
                        </div>
                        <input type="text" class="scroll-hide svelte-4xt1ch input-tag-append" ref="promptTagAppend"
                               :placeholder="getLang('please_enter_new_keyword')"
                               v-tooltip="getLang('enter_to_add')"
                               @focus="onAppendTagFocus"
                               @blur="onAppendTagBlur"
                               @keyup="onAppendTagKeyUp"
                               @keydown="onAppendTagKeyDown">

                        <div class="prompt-append-list" ref="promptAppendList" v-show="showAppendList"
                             :style="appendListStyle">
                            <div v-for="(item, index) in appendList" :key="item.type"
                                 :class="['prompt-append-group', appendListSelected === index ? 'selected' : '']">
                                <div class="append-group-name" @click="onAppendGroupClick(index, null, $event)">
                                    <icon-svg class="name-icon" v-if="item.icon === 'wrap'" name="wrap"/>
                                    <icon-svg class="name-icon" v-else-if="item.icon === 'history'" name="history"/>
                                    <icon-svg class="name-icon" v-else-if="item.icon === 'favorite'" name="favorite"/>
                                    {{ appendListItemName(item) }}
                                    <span class="arrow-right" v-show="item.children.length > 0"></span>
                                </div>
                                <div class="append-group-list" ref="promptAppendListChildren"
                                     v-show="item.children.length > 0">
                                    <div v-for="(child, childIndex) in item.children" :key="childIndex"
                                         ref="promptAppendListChild"
                                         :class="['append-item', appendListChildSelected === childIndex ? 'selected' : '']"
                                         @mouseleave="onAppendListChildMouseLeave(index, childIndex, $event)"
                                         @mouseenter="onAppendListChildMouseEnter(index, childIndex, $event)"
                                         @click="onAppendGroupClick(index, childIndex, $event)">
                                        <template v-if="item.type === 'favorite' || item.type === 'history'">
                                            <div class="tags-name" v-if="child.name">{{ child.name }}</div>
                                            <div class="tags-name" v-else>{{ child.prompt }}</div>
                                        </template>
                                    </div>
                                </div>
                                <div class="tags-detail"
                                     v-show="appendListSelected !== null && appendListChildSelected !== null && appendListSelected === index && (item.type === 'favorite' || item.type === 'history')">
                                    <div class="tags-list">
                                        <template v-for="(tag, tagIndex) in appendListChildItemTags" :key="tagIndex">
                                            <div v-if="tag.type && tag.type === 'wrap'" class="item-wrap"></div>
                                            <div v-else class="tags-item">
                                                <div class="item-tag-value">{{ tag.value }}</div>
                                                <div class="item-tag-local-value">{{ tag.localValue }}</div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div :class="['prompt-tags', dropTag ? 'droping': '']" ref="promptTags">
                <div class="prompt-tags-list" ref="promptTagsList">
                    <template v-for="(tag, index) in tags" :key="tag.id" :data-id="tag.id">
                        <div :class="['prompt-tag', tag.disabled ? 'disabled': '']">
                            <div class="prompt-tag-main">
                                <div class="prompt-tag-edit">
                                    <template v-if="tag.type === 'wrap'">
                                        <div class="prompt-tag-value"
                                             :ref="'promptTag-' + tag.id"
                                             v-tooltip="getLang('line_break_character') + '<br/>' + getLang('drop_to_order')"
                                             style="width: 100%">
                                            <icon-svg name="wrap"/>
                                        </div>
                                    </template>
                                    <!--<template v-else-if="tag.type === 'favorite'">
                                    </template>
                                    <template v-else-if="tag.type === 'history'">
                                    </template>-->
                                    <template v-else>
                                        <div v-show="!editing[tag.id]"
                                             :class="getTagClass(tag)"
                                             :ref="'promptTag-' + tag.id"
                                             v-tooltip="getLang('click_to_edit') + '<br/>' + getLang('drop_to_order')"
                                             @click="onTagClick(index)" v-html="renderTag(index)">
                                        </div>
                                        <textarea v-show="editing[tag.id]" type="text"
                                                  class="scroll-hide svelte-4xt1ch input-tag-edit"
                                                  :ref="'promptTagEdit-' + tag.id"
                                                  :placeholder="getLang('enter_to_save')"
                                                  :value="tag.value"
                                                  @blur="onTagInputBlur(index)"
                                                  @keydown="onTagInputKeyDown(index, $event)"
                                                  @change="onTagInputChange(index, $event)"></textarea>
                                        <!--<input v-show="editing[tag.id]" type="text"
                                               class="scroll-hide svelte-4xt1ch input-tag-edit"
                                               :ref="'promptTagEdit-' + tag.id" :placeholder="getLang('enter_to_save')"
                                               :value="tag.value" @blur="onTagInputBlur(index)"
                                               @keydown="onTagInputKeyDown(index, $event)"
                                               @change="onTagInputChange(index, $event)">-->
                                    </template>
                                    <div class="btn-tag-delete" @click="onDeleteTagClick(index)">
                                        <icon-svg name="close"/>
                                    </div>
                                </div>
                                <div class="btn-tag-extend" v-show="(tag.type === 'text' || !tag.type)">
                                    <vue-number-input class="input-number" :model-value="tag.weightNum" center controls
                                                      :min="0" :step="0.1" size="small"
                                                      @update:model-value="onTagWeightNumChange(index, $event)"></vue-number-input>
                                    <button type="button" v-tooltip="getLang('increase_weight_add_parentheses')"
                                            @click="onIncWeightClick(index, +1)">
                                        <icon-svg name="weight-parentheses-inc"/>
                                    </button>
                                    <button type="button" v-tooltip="getLang('increase_weight_subtract_parentheses')"
                                            @click="onIncWeightClick(index, -1)">
                                        <icon-svg name="weight-parentheses-dec"/>
                                    </button>
                                    <button type="button" v-tooltip="getLang('decrease_weight_add_brackets')"
                                            @click="onDecWeightClick(index, +1)">
                                        <icon-svg name="weight-brackets-inc"/>
                                    </button>
                                    <button type="button" v-tooltip="getLang('decrease_weight_subtract_brackets')"
                                            @click="onDecWeightClick(index, -1)">
                                        <icon-svg name="weight-brackets-dec"/>
                                    </button>
                                    <button type="button" v-tooltip="getLang('translate_keyword_to_english')"
                                            v-show="!isEnglish"
                                            @click="onTranslateToEnglishClick(index).then(() => updateTags())">
                                        <icon-svg v-if="!loading[tag.id + '_en']" name="english"/>
                                        <icon-svg v-if="loading[tag.id + '_en']" name="loading"/>
                                    </button>
                                    <button type="button" v-tooltip="getLang('copy_to_clipboard')"
                                            @click="copy(tag.value)">
                                        <icon-svg name="copy"/>
                                    </button>
                                    <button type="button"
                                            v-tooltip="getLang(tag.disabled ? 'enable_keyword': 'disable_keyword')"
                                            @click="onDisabledTagClick(index)">
                                        <icon-svg v-if="!tag.disabled" name="disabled"/>
                                        <icon-svg v-if="tag.disabled" name="enable"/>
                                    </button>
                                </div>
                            </div>
                            <div class="prompt-local-language"
                                 v-show="!isEnglish && (tag.type === 'text' || !tag.type)">
                                <div class="translate-to-local hover-scale-120"
                                     v-tooltip="getLang('translate_keyword_to_local_language')"
                                     @click="onTranslateToLocalClick(index).then(() => updateTags())">
                                    <icon-svg v-if="!loading[tag.id + '_local']" name="translate"/>
                                    <icon-svg v-if="loading[tag.id + '_local']" name="loading"/>
                                </div>
                                <div class="local-language">{{ tag.localValue }}</div>
                            </div>
                        </div>
                        <!--<div class="prompt-wrap" v-show="tag.type === 'wrap'"></div>-->
                    </template>
                </div>
                <!--<div class="prompt-append">
                    <input type="text" class="scroll-hide svelte-4xt1ch input-tag-append" ref="promptTagAppend"
                           v-model="appendTag" :placeholder="getLang('please_enter_new_keyword')"
                           v-tooltip="getLang('enter_to_add')" @keydown="onAppendTagKeyDown">
                </div>-->
            </div>
        </div>
    </div>
</template>

<script>
import autoSizeInput from 'autosize-input'
import Sortable from 'sortablejs'
import common from "@/utils/common"

import LanguageMixin from "@/mixins/languageMixin"
import VueNumberInput from '@chenfengyuan/vue-number-input'
import IconSvg from "@/components/iconSvg.vue"

export default {
    name: 'PhystonPrompt',
    components: {
        VueNumberInput,
        IconSvg
    },
    mixins: [LanguageMixin],
    props: {
        name: {
            type: String,
            required: true,
        },
        neg: {
            type: Boolean,
            default: false,
        },
        textarea: {
            type: Object,
            required: true,
        },
        steps: {
            type: Object,
            required: true,
        },
        autoTranslateToEnglish: {
            type: Boolean,
            default: false,
        },
        autoTranslateToLocal: {
            type: Boolean,
            default: false,
        },
        autoRemoveSpace: {
            type: Boolean,
            default: false,
        },
        hideDefaultInput: {
            type: Boolean,
            default: false,
        },
        hidePanel: {
            type: Boolean,
            default: false,
        },
        enableTooltip: {
            type: Boolean,
            default: true,
        },
        historyKey: {
            type: String,
            default: '',
        },
        favoriteKey: {
            type: String,
            default: '',
        },
    },
    emits: ['update:languageCode', 'update:autoTranslateToEnglish', 'update:autoTranslateToLocal', 'update:autoRemoveSpace', 'update:hideDefaultInput', 'update:hidePanel', 'update:enableTooltip', 'update:translateApi', 'click:translateApi', 'click:selectTheme', 'click:selectLanguage', 'click:showHistory', 'click:showFavorite'],
    data() {
        return {
            prompt: '',
            counterText: '0/75',
            tags: [],
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
            dropTag: false,
            loading: {},
            editing: {},
            autocompleteResults: null,
        }
    },
    computed: {
        isEnglish() {
            return this.languageCode === 'en_US'
        },
        translateApiItem() {
            return common.getTranslateApiItem(this.translateApis, this.translateApi)
        },
        appendListChildItemTags() {
            if (this.appendListSelected === null) return []
            if (this.appendListChildSelected === null) return []
            if (this.appendList[this.appendListSelected].type !== 'favorite' && this.appendList[this.appendListSelected].type !== 'history') return []
            return this.appendList[this.appendListSelected].children[this.appendListChildSelected].tags
        }
    },
    mounted() {
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
        this.$nextTick(() => {
            this.initSortable()
            // autoSizeInput(this.$refs.promptTagAppend)
            let times = [1000, 3000, 5000, 10000]
            let isBind = false
            times.forEach((time) => {
                if (isBind) return
                setTimeout(() => {
                    if (isBind) return
                    if (typeof addAutocompleteToArea !== 'function') return
                    if (typeof TAC_CFG !== 'object') return
                    if (!TAC_CFG) return
                    if (!TAC_CFG['activeIn']) return
                    isBind = true
                    addAutocompleteToArea(this.$refs.promptTagAppend)
                }, time)
            })
            this.init()
        })
        window.addEventListener('resize', this.onResize)
    },
    watch: {},
    methods: {
        init() {
            this.tags = []
            this.onTextareaChange()
            this.textarea.removeEventListener('change', this.onTextareaChange)
            this.textarea.addEventListener('change', this.onTextareaChange)
        },
        async onTextareaChange(event) {
            const autocompleteResults = this.textarea.parentElement.getElementsByClassName('autocompleteResults')
            if (autocompleteResults.length > 0 && autocompleteResults[0].style.display !== 'none') {
                return
            }
            let value = this.textarea.value.trim()
            if (value === this.prompt.trim()) return
            let tags = common.splitTags(value)
            let indexes = []
            let oldTags = this.tags
            this.tags = []
            tags.forEach(tag => {
                if (tag === "\n") {
                    this._appendTag("\n", "\n", false, -1, 'wrap')
                } else {
                    let find = false
                    for (let item of oldTags) {
                        if (item.value === tag) {
                            find = item
                            break
                        }
                    }
                    const localValue = find ? find.localValue : ''
                    const disabled = find ? find.disabled : false
                    const index = this._appendTag(tag, localValue, disabled, -1, 'text')
                    if (!find || find.localValue === '') indexes.push(index)
                }
            })
            if (event && this.autoTranslateToLocal) {
                // 如果开启了自动翻译到本地语言，那么就自动翻译
                /*for (const index of indexes) {
                    try {
                        await this.onTranslateToLocalClick(index)
                    } catch (error) {
                    }
                }*/
                this.updateTags()
            } else {
                this.updateTags()
            }
            return
            /*let newTags = []
            let newTagsIndex = []
            let delTags = []
            tags.forEach((tag, index) => {
                let find = false
                for (let i = 0; i < this.tags.length; i++) {
                    if (this.tags[i].value === tag) {
                        find = true
                        break
                    }
                }
                if (!find) {
                    newTags.push(tag)
                    newTagsIndex.push(index)
                }
            })
            this.tags.forEach((tag, index) => {
                let find = false
                for (let i = 0; i < tags.length; i++) {
                    if (tags[i] === tag.value) {
                        find = true
                        break
                    }
                }
                if (!find) delTags.push(index)
            })
            if (delTags.length <= 0 && newTags.length <= 0) return
            // console.log(newTags, delTags);
            for (let i = delTags.length - 1; i >= 0; i--) {
                this.tags.splice(delTags[i], 1)
            }
            let indexes = []
            for (let i = 0; i < newTags.length; i++) {
                // indexes.push(this._appendTag(newTags[i]))
                if (newTags[i] === "\n") {
                    indexes.push(this._appendTag("\n", "\n", false, newTagsIndex[i], 'wrap'))
                } else {
                    indexes.push(this._appendTag(newTags[i], '', false, newTagsIndex[i], 'text'))
                }
            }
            if (event && this.autoTranslateToLocal) {
                // 如果开启了自动翻译到本地语言，那么就自动翻译
                /!*for (const index of indexes) {
                    try {
                        await this.onTranslateToLocalClick(index)
                    } catch (error) {
                    }
                }*!/
                this.updateTags()
            } else {
                this.updateTags()
            }*/
        },
        _setTextareaFocus() {
            if (typeof get_uiCurrentTabContent !== 'function') return
            if (typeof activePromptTextarea !== 'object') return
            const currentTab = get_uiCurrentTabContent()
            if (!currentTab) return
            let tabName = currentTab.id.replace('tab_', '')
            if (!tabName) return
            activePromptTextarea[tabName] = this.textarea
        },
        copy(text) {
            this.$copyText(text).then(() => {
                this.$toastr.success("success!")
            }).catch(() => {
                this.$toastr.error("error!")
            })
        },
        onCopyAllTagsClick() {
            this.copy(this.prompt)
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
        genPrompt() {
            let prompts = []
            this.tags.forEach((tag, index) => {
                let prompt = ''
                if (typeof tag['type'] === 'string' && tag.type === 'wrap') {
                    prompt = "\n"
                } else {
                    let value = common.replaceTag(tag.value)
                    if (value !== tag.value) {
                        tag.value = value
                        this._setTag(tag)
                    }
                    let localValue = common.replaceTag(tag.localValue)
                    if (localValue !== tag.localValue) {
                        tag.localValue = localValue
                    }

                    if (tag.weightNum > 0) {
                        tag.weightNum = Number(parseFloat(tag.weightNum).toFixed(2))
                        tag.value = tag.value.replace(common.weightNumRegex, '$1:' + tag.weightNum)
                        if (tag.localValue !== '') {
                            tag.localValue = tag.localValue.replace(common.weightNumRegex, '$1:' + tag.weightNum)
                        }
                    }
                    if (tag.disabled) return

                    let splitSymbol = ',' + (this.autoRemoveSpace ? '' : ' ')

                    let nextTag = null
                    let nextIsWarp = false
                    // 获取下一个按钮
                    if (index + 1 < this.tags.length) {
                        nextTag = this.tags[index + 1]
                        if (typeof nextTag['type'] === 'string' && nextTag.type === 'wrap') {
                            nextIsWarp = true
                        }
                    }

                    if (nextIsWarp) {
                        // 如果下一个是换行

                        // sd-webui-regional-prompter
                        const regionals = [' BREAK', ' ADDCOL', ' ADDROW', ' ADDCOMM', ' ADDBASE']
                        for (const regional of regionals) {
                            if (tag.value.endsWith(regional)) {
                                // 如果是sd-webui-regional-prompter，那么就不需要加逗号
                                splitSymbol = ''
                            }
                        }
                    }

                    prompt = tag.value + splitSymbol
                }

                if (prompt) prompts.push(prompt)
            })
            if (prompts.length <= 0) return ''
            // console.log('update tags', prompts)
            return prompts.join('')
        },
        updateTags() {
            console.log('tags change', this.tags)
            this.prompt = this.genPrompt()
            this.textarea.value = this.prompt
            common.hideCompleteResults(this.textarea)
            const steps = this.steps.querySelector('input[type="number"]').value
            this.gradioAPI.tokenCounter(this.textarea.value, steps).then(res => {
                const {token_count, max_length} = res
                this.counterText = `${token_count}/${max_length}`
            })
            this.textarea.dispatchEvent(new Event('input'))
            if (this.tags.length) {
                this.gradioAPI.getLatestHistory(this.historyKey).then(res => {
                    if (res && res.prompt === this.prompt) {
                        // 如果有上一条记录，并且prompt相同，则更新
                        this.gradioAPI.setHistory(this.historyKey, res.id, this.tags, this.prompt, res.name).then(res => {
                        }).catch(err => {
                        })
                    } else {
                        this.gradioAPI.pushHistory(this.historyKey, this.tags, this.prompt).then(res => {
                        }).catch(err => {
                        })
                    }
                }).catch(err => {
                })
            }
        },
        getTagClass(tag) {
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
            return classes
        },
        renderTag(index) {
            let value = this.tags[index].value
            value = common.escapeHtml(value)
            if (this.tags[index].incWeight > 0) {
                value = common.setLayers(value, 0, '(', ')')
                value = '<div class="character">' + value + '</div>'
                let start = '<div class="weight-character">' + '('.repeat(this.tags[index].incWeight) + '</div>'
                let end = '<div class="weight-character">' + ')'.repeat(this.tags[index].incWeight) + '</div>'
                value = start + value + end
            } else if (this.tags[index].decWeight > 0) {
                value = common.setLayers(value, 0, '[', ']')
                value = '<div class="character">' + value + '</div>'
                let start = '<div class="weight-character">' + '['.repeat(this.tags[index].decWeight) + '</div>'
                let end = '<div class="weight-character">' + ']'.repeat(this.tags[index].decWeight) + '</div>'
                value = start + value + end
            } else {
                value = '<div class="character">' + value + '</div>'
            }
            return value
        },
        onResize() {
            this.tags.forEach(tag => {
                this._setTagHeight(tag)
            })
        },
        _setTag(tag) {
            tag.isLora = false
            tag.loraExists = false
            tag.isLyco = false
            tag.lycoExists = false
            tag.isEmbedding = false
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

                // 判断是否lora
                const match = tag.value.match(common.loraRegex)
                if (match) {
                    tag.isLora = true
                    const loraName = common.loraExists(match[1])
                    if (loraName !== false) tag.loraExists = true
                }

                if (!tag.isLora) {
                    // 判断是否lyco
                    const match = tag.value.match(common.lycoRegex)
                    if (match) {
                        tag.isLyco = true
                        const lycoName = common.lycoExists(match[1])
                        if (lycoName !== false) tag.lycoExists = true
                    }
                }

                if (!tag.isLora && !tag.isLyco) {
                    // 判断是否embedding
                    const embeddingName = common.embeddingExists(tag.value)
                    if (embeddingName !== false) {
                        tag.isEmbedding = true
                        tag.value = embeddingName
                    }
                }
            }
            this.$nextTick(() => {
                this._setTagHeight(tag)
            })
        },
        _setTagHeight(tag) {
            let $tag = this.$refs['promptTag-' + tag.id][0]
            let height = $tag.offsetHeight
            $tag.parentNode.style.height = height + 'px'
            if (this.$refs['promptTagEdit-' + tag.id]) {
                this.$refs['promptTagEdit-' + tag.id][0].style.height = height + 'px'
            }
        },
        _appendTag(value, localValue = '', disabled = false, index = -1, type = 'text') {
            // 唯一数：当前时间戳+随机数
            const id = Date.now() + (Math.random() * 1000000).toFixed(0)
            let tag = {
                id,
                value,
                localValue,
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
        initSortable() {
            Sortable.create(this.$refs.promptTagsList, {
                animation: 150,
                handle: '.prompt-tag-value',
                onEnd: ({oldIndex, newIndex}) => {
                    const tags = [...this.tags]
                    tags.splice(newIndex, 0, tags.splice(oldIndex, 1)[0])
                    console.log(tags);
                    this.tags = tags
                    this.updateTags()
                    this.$forceUpdate()
                },
                onChoose: (env) => {
                    console.log(env);
                    this.editing = {}
                    this.dropTag = this.tags[env.oldIndex]
                },
                onUnchoose: (env) => {
                    this.dropTag = null
                },
            })
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
                if (common.hasBrackets(tags)) {
                    tags = common.replaceBrackets(tags)
                }
                this._appendTag(tags, text)
                this.updateTags()
            }, 300)
        },
        onAppendTagFocus(e) {
            if (e.target.value === '' || e.target.value.trim() === '') {
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
                if (this.getAutocompleteResults() && this.autocompleteResults.style.display === 'block' && this.getAutocompleteResultsSelected()) {
                    let text = this.getAutocompleteResultsSelectedText()
                    setTimeout(() => {
                        localValue = e.target.value
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

                let tags = e.target.value
                e.target.value = ''
                this.showAppendList = true
                // [night light:magical forest: 5, 15]
                if (localValue) {
                    // 去除末尾的逗号
                    tags = tags.replace(/,\s*$/, '')
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
                        tags = common.splitTags(tags)
                    }
                    let indexes = []
                    tags.forEach(tag => {
                        if (tag === "\n") {
                            indexes.push(this._appendTag("\n", "\n", false, -1, 'wrap'))
                        } else {
                            indexes.push(this._appendTag(tag))
                        }
                    })
                    if (this.autoTranslateToEnglish || this.autoTranslateToLocal) {
                        this.$nextTick(() => {
                            if (this.autoTranslateToEnglish) {
                                // 如果开启了自动翻译到英语，那么就自动翻译
                                this.translatesToEnglish(indexes).finally(() => {
                                    this.updateTags()
                                })
                            } else if (this.autoTranslateToLocal) {
                                // 如果开启了自动翻译到本地语言，那么就自动翻译
                                this.translatesToLocal(indexes).finally(() => {
                                    this.updateTags()
                                })
                            }
                        })
                    } else {
                        this.updateTags()
                    }
                }
            } else {
                // 不是上下键，也不是回车
                this.removeAutocompleteResultsSelected()
            }
        },
        onAppendTagKeyUp(e) {
            if (e.target.value === '' || e.target.value.trim() === '') {
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
            console.log(index, childIndex)
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
        onTagClick(index) {
            this.editing = {}
            this.editing[this.tags[index].id] = true
            this.$forceUpdate()
            this.$nextTick(() => {
                const input = this.$refs['promptTagEdit-' + this.tags[index].id][0]
                input.focus()
                input.dispatchEvent(new Event('input'))
                // input.select()
            })
        },
        onTagInputBlur(index) {
            this.editing[this.tags[index].id] = false
        },
        onTagInputKeyDown(index, e) {
            if (e.keyCode === 13) {
                this.editing[this.tags[index].id] = false
                if (this.tags[index].value !== e.target.value) {
                    this.tags[index].value = e.target.value
                    this._setTag(this.tags[index])
                    this.updateTags()
                }
            }
        },
        onTagInputChange(index, e) {
            if (this.tags[index].value === e.target.value) return
            this.tags[index].value = e.target.value
            this._setTag(this.tags[index])
            this.updateTags()
        },
        onTagWeightNumChange(index, e) {
            e = typeof e === "number" || typeof a === "string" ? e : e.target.value
            if (this.tags[index].weightNum == e) return
            let weightNum = e
            let value = this.tags[index].value
            let localValue = this.tags[index].localValue
            if (weightNum > 0) {
                if (weightNum === 1) {
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
                if (value !== this.tags[index].value) {
                    this.tags[index].value = value
                    if (localValue !== '') this.tags[index].localValue = localValue
                    this._setTag(this.tags[index])
                }
            } else {
                // 如果原来的括号是<>，那么最小权重数只能是0.1
                const bracket = common.hasBrackets(value)
                if (bracket[0] === '<' && bracket[1] === '>') {
                    weightNum = 0.1
                } else {
                    // 移除权重数
                    this.tags[index].value = value.replace(common.weightNumRegex, '$1')
                    if (localValue !== '') this.tags[index].localValue = this.tags[index].localValue.replace(common.weightNumRegex, '$1')
                }
            }
            this.tags[index].weightNum = weightNum
            this.updateTags()
        },
        onDeleteTagClick(index) {
            this.tags.splice(index, 1)
            this.updateTags()
        },
        onDeleteAllTagsClick() {
            if (!confirm(this.getLang('delete_all_keywords_confirm'))) return
            this.tags = []
            this.updateTags()
        },
        onDisabledTagClick(index) {
            this.tags[index].disabled = !this.tags[index].disabled
            this.updateTags()
        },
        onIncWeightClick(index, num) {
            let value = this.tags[index].value
            let localValue = this.tags[index].localValue
            value = common.setLayers(value, 0, '[', ']')
            if (localValue !== '') localValue = common.setLayers(localValue, 0, '[', ']')
            let incWeight = this.tags[index].incWeight
            incWeight += num
            if (incWeight < 0) incWeight = 0
            this.tags[index].incWeight = incWeight
            this.tags[index].decWeight = 0
            value = common.setLayers(value, incWeight, '(', ')')
            if (localValue !== '') localValue = common.setLayers(localValue, incWeight, '(', ')')
            this.tags[index].value = value
            if (localValue !== '') this.tags[index].localValue = localValue
            this.updateTags()
        },
        onDecWeightClick(index, num) {
            let value = this.tags[index].value
            let localValue = this.tags[index].localValue
            value = common.setLayers(value, 0, '(', ')')
            if (localValue !== '') localValue = common.setLayers(localValue, 0, '(', ')')
            let decWeight = this.tags[index].decWeight
            decWeight += num
            if (decWeight < 0) decWeight = 0
            this.tags[index].incWeight = 0
            this.tags[index].decWeight = decWeight
            value = common.setLayers(value, decWeight, '[', ']')
            if (localValue !== '') localValue = common.setLayers(localValue, decWeight, '[', ']')
            this.tags[index].value = value
            if (localValue !== '') this.tags[index].localValue = localValue
            this.updateTags()
        },
        onTranslateToLocalClick(index) {
            return new Promise((resolve, reject) => {
                if (this.languageCode === 'en_US') {
                    reject('en_US')
                    return
                }
                if (this.loading[this.tags[index].id + '_local']) {
                    reject('loading')
                    return
                }
                this.loading[this.tags[index].id + '_local'] = true
                this.translate(this.tags[index].value, 'en_US', this.languageCode).then(res => {
                    this.loading[this.tags[index].id + '_local'] = false
                    if (!res.success) {
                        this.$toastr.error(res.message)
                        reject(res.message)
                        return
                    }
                    this.tags[index].localValue = res.translated_text
                    resolve(res.translated_text)
                }).catch(err => {
                    console.log(err)
                    this.$toastr.error(err.message)
                    this.loading[this.tags[index].id + '_local'] = false
                    reject(err)
                })
            })
        },
        onTranslateToEnglishClick(index) {
            return new Promise((resolve, reject) => {
                if (this.languageCode === 'en_US') {
                    reject('en_US')
                    return
                }
                if (this.loading[this.tags[index].id + '_en']) {
                    reject('loading')
                    return
                }
                this.loading[this.tags[index].id + '_en'] = true
                this.translate(this.tags[index].value, this.languageCode, 'en_US').then(res => {
                    this.loading[this.tags[index].id + '_en'] = false
                    if (!res.success) {
                        this.$toastr.error(res.message)
                        reject(res.message)
                        return
                    }
                    this.tags[index].localValue = this.tags[index].value
                    this.tags[index].value = res.translated_text
                    resolve(res.translated_text)
                }).catch(err => {
                    console.log(err)
                    this.$toastr.error(err.message)
                    this.loading[this.tags[index].id + '_en'] = false
                    reject(err)
                }).finally(() => {

                })
            })
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
            this.translatesToLocal(tagIndexes).finally(() => {
                this.loading['all_local'] = false
                this.updateTags()
            })
        },
        translatesToLocal(tagIndexes) {
            return new Promise((resolve, reject) => {
                if (this.languageCode === 'en_US') {
                    resolve()
                    return
                }
                let texts = []
                let textsIds = []
                for (const index of tagIndexes) {
                    texts.push(this.tags[index].value)
                    textsIds.push(this.tags[index].id)
                    this.loading[this.tags[index].id + '_local'] = true
                }
                this.translateMulti(texts, 'en_US', this.languageCode, (res, index) => {
                    const id = textsIds[index]
                    this.loading[id + '_local'] = false
                    let tag = this.tags.find(tag => tag.id === id)
                    if (!tag) return
                    if (!res.success) {
                        this.$toastr.error(res.message)
                        return
                    }
                    tag.localValue = res.translated_text
                }, () => {
                    resolve()
                })
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
            this.translatesToEnglish(tagIndexes).finally(() => {
                this.loading['all_en'] = false
                this.updateTags()
            })
        },
        translatesToEnglish(tagIndexes) {
            return new Promise((resolve, reject) => {
                if (this.languageCode === 'en_US') {
                    resolve()
                    return
                }
                let texts = []
                let textsIds = []
                for (const index of tagIndexes) {
                    texts.push(this.tags[index].value)
                    textsIds.push(this.tags[index].id)
                    this.loading[this.tags[index].id + '_en'] = true
                }
                this.translateMulti(texts, this.languageCode, 'en_US', (res, index) => {
                    const id = textsIds[index]
                    this.loading[id + '_en'] = false
                    let tag = this.tags.find(tag => tag.id === id)
                    if (!tag) return
                    if (!res.success) {
                        this.$toastr.error(res.message)
                        return
                    }
                    tag.localValue = tag.value
                    tag.value = res.translated_text
                }, () => {
                    resolve()
                })
            })
        },
        useHistory(history) {
            this.tags = []
            history.tags.forEach(item => {
                this._appendTag(item.value, item.localValue, item.disabled, -1, item.type || 'text')
            })
            this.updateTags()
        },
        useFavorite(favorite) {
            this.useHistory(favorite)
        },
        onPromptMainClick() {
            this.onTextareaChange(true)
            this._setTextareaFocus()
        },
        onUnfoldClick() {
            if (this.hidePanel) {
                this.$nextTick(() => {
                    this.onResize()
                })
            }
            this.$emit("update:hidePanel", !this.hidePanel)
        }
    },
}
</script>
