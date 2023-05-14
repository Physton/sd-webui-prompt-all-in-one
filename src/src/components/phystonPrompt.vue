<template>
    <div class="physton-prompt" :name="name">
        <div :class="['prompt-main', hidePanel ? 'fold': '']" @click="onPromptMainClick">
            <div class="prompt-header">
                <div class="prompt-unfold" @click="onUnfoldClick">
                    <icon-unfold class="hover-scale-120" width="20" height="20"/>
                </div>
                <div class="prompt-header-title">{{ neg ? getLang('negative_prompt') : getLang('prompt') }}</div>
                <div class="prompt-header-counter" v-show="counterText">({{ counterText }})</div>
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <div class="extend-btn-group">
                            <div class="extend-btn-item" v-tooltip="'Language: ' + langName"
                                 @click="$emit('click:selectLanguage', $event)">
                                <icon-i18n class="hover-scale-120" width="18" height="18" color="#d81e06"/>
                            </div>
                            <div class="extend-btn-item">
                                <icon-setting class="hover-scale-120" width="18" height="18" color="#d81e06" v-tooltip="getLang('setting_desc')" />
                                <div class="setting-box">
                                    <div v-if="translateApiItem.name && !isEnglish" class="extend-btn-item"
                                         v-tooltip="getLang('translate_api') + ': ' + translateApiItem.name"
                                         @click="$emit('click:translateApi', $event)">
                                        <icon-api class="hover-scale-120" width="26" height="26" color="#d81e06"/>
                                    </div>
                                    <div class="gradio-checkbox hover-scale-120" v-show="!isEnglish">
                                        <label v-tooltip="getLang('auto_translate_to_local_language')">
                                            <input type="checkbox" name="auto_translate_to_local_language" value="1"
                                                   :checked="autoTranslateToLocal"
                                                   @change="$emit('update:autoTranslateToLocal', $event.target.checked)">
                                            <icon-translate width="26" height="26" color="#ad6800"/>
                                        </label>
                                    </div>
                                    <div class="gradio-checkbox hover-scale-120" v-show="!isEnglish">
                                        <label v-tooltip="getLang('auto_translate_to_english')">
                                            <input type="checkbox" name="auto_translate_to_english" value="1"
                                                   :checked="autoTranslateToEnglish"
                                                   @change="$emit('update:autoTranslateToEnglish', $event.target.checked)">
                                            <icon-english width="26" height="26" color="#ad6800"/>
                                        </label>
                                    </div>
                                    <div class="gradio-checkbox hover-scale-120">
                                        <label v-tooltip="getLang('whether_to_enable_tooltip')">
                                            <input type="checkbox" name="enable_tooltip" value="1"
                                                   :checked="enableTooltip"
                                                   @change="$emit('update:enableTooltip', $event.target.checked)">
                                            <icon-tooltip width="26" height="26" color="#1f2937"/>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <!--<div v-if="translateApiItem.name && !isEnglish" class="extend-btn-item"
                                 v-tooltip="getLang('translate_api') + ': ' + translateApiItem.name"
                                 @click="$emit('click:translateApi', $event)">
                                <icon-api class="hover-scale-120" width="18" height="18" color="#d81e06"/>
                            </div>-->
                        </div>
                    </div>
                </div>
                <!--<div class="prompt-header-break"></div>-->
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <div class="extend-btn-group">
                            <div class="extend-btn-item" ref="historyButton" v-tooltip="getLang('history')"
                                 @click.stop="onShowHistoryClick">
                                <icon-history class="hover-scale-120" width="18" height="18"/>
                            </div>
                            <div class="extend-btn-item" ref="favoriteButton"
                                 v-tooltip="getLang('favorite')" @click.stop="onShowFavoriteClick">
                                <icon-favorite class="hover-scale-120" width="18" height="18"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="prompt-header-extend" v-show="!isEnglish">
                    <div class="extend-content">
                        <div class="extend-btn-group">
                            <div class="extend-btn-item" v-tooltip="getLang('translate_keywords_to_local_language')"
                                 @click="onTranslatesToLocalClick">
                                <icon-translate class="hover-scale-120" v-if="!loading['all_local']" width="18"
                                                height="18" color="#ad6800"/>
                                <icon-loading class="hover-scale-120" v-if="loading['all_local']" width="18"
                                              height="18"/>
                            </div>
                            <div class="extend-btn-item" v-tooltip="getLang('translate_all_keywords_to_english')"
                                 @click="onTranslatesToEnglishClick">
                                <icon-english class="hover-scale-120" v-if="!loading['all_en']" width="18" height="18"
                                              color="#ad6800"/>
                                <icon-loading class="hover-scale-120" v-if="loading['all_en']" width="18" height="18"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <div class="extend-btn-group">
                            <div class="extend-btn-item" v-tooltip="getLang('copy_keywords_to_clipboard')"
                                 @click="onCopyAllTagsClick">
                                <icon-copy class="hover-scale-120" width="18" height="18"
                                           color="var(--body-text-color)"/>
                            </div>
                            <div class="extend-btn-item" v-tooltip="getLang('delete_all_keywords')"
                                 @click="onDeleteAllTagsClick">
                                <icon-remove class="hover-scale-120" width="18" height="18" color="#d81e06"/>
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
                                <icon-input width="26" height="26" color="var(--body-text-color)"/>
                            </label>
                            <label v-else v-tooltip="getLang('hide_default_input_box')">
                                <input type="checkbox" name="hide_default_input" value="1"
                                       :checked="!hideDefaultInput"
                                       @change="$emit('update:hideDefaultInput', !$event.target.checked)">
                                <icon-input width="26" height="26" color="var(--body-text-color)"/>
                            </label>
                        </div>
                        <input type="text" class="scroll-hide svelte-4xt1ch input-tag-append" ref="promptTagAppend"
                               v-model="appendTag" :placeholder="getLang('please_enter_new_keyword')"
                               v-tooltip="getLang('enter_to_add')" @keydown="onAppendTagKeyDown">
                    </div>
                </div>
            </div>
            <div :class="['prompt-tags', dropTag ? 'droping': '']" ref="promptTags">
                <div class="prompt-tags-list" ref="promptTagsList">
                    <div v-for="(tag, index) in tags" :key="tag.id" :data-id="tag.id"
                         :class="['prompt-tag', tag.disabled ? 'disabled': '']">
                        <div class="prompt-tag-main">
                            <div class="prompt-tag-edit">
                                <div v-show="!editing[tag.id]"
                                        class="prompt-tag-value"
                                        :style="{color: tag.isLora ? 'var(--geekblue-8)' : this.tagColor}"
                                        :ref="'promptTag-' + tag.id"
                                        v-tooltip="getLang('click_to_edit') + '<br/>' + getLang('drop_to_order')"
                                        @click="onTagClick(index)" v-html="renderTag(index)">
                                </div>
                                <input v-show="editing[tag.id]" type="text" class="scroll-hide svelte-4xt1ch input-tag-edit"
                                       :ref="'promptTagEdit-' + tag.id" :placeholder="getLang('enter_to_save')"
                                       :value="tag.value" @blur="onTagInputBlur(index)"
                                       @keydown="onTagInputKeyDown(index, $event)"
                                       @change="onTagInputChange(index, $event)">
                                <div class="btn-tag-delete" @click="onDeleteTagClick(index)">
                                    <icon-close width="12" height="12"/>
                                </div>
                            </div>
                            <div class="btn-tag-extend">
                                <vue-number-input class="input-number" :model-value="tag.weightNum" center controls
                                                  :min="0" :step="0.1" size="small"
                                                  @update:model-value="onTagWeightNumChange(index, $event)"></vue-number-input>
                                <button type="button" v-tooltip="getLang('increase_weight_add_parentheses')"
                                        @click="onIncWeightClick(index, +1)">
                                    <icon-weight width="20" height="20" type="parentheses" :increase="true"
                                                 color="#ff6969"/>
                                </button>
                                <button type="button" v-tooltip="getLang('increase_weight_subtract_parentheses')"
                                        @click="onIncWeightClick(index, -1)">
                                    <icon-weight width="20" height="20" type="parentheses" :increase="false"
                                                 color="#ff6969"/>
                                </button>
                                <button type="button" v-tooltip="getLang('decrease_weight_add_brackets')"
                                        @click="onDecWeightClick(index, +1)">
                                    <icon-weight width="20" height="20" type="brackets" :increase="true"
                                                 color="#84ff8f"/>
                                </button>
                                <button type="button" v-tooltip="getLang('decrease_weight_subtract_brackets')"
                                        @click="onDecWeightClick(index, -1)">
                                    <icon-weight width="20" height="20" type="brackets" :increase="false"
                                                 color="#84ff8f"/>
                                </button>
                                <button type="button" v-tooltip="getLang('translate_keyword_to_english')"
                                        v-show="!isEnglish"
                                        @click="onTranslateToEnglishClick(index).then(() => updateTags())">
                                    <icon-english v-if="!loading[tag.id + '_en']" width="20" height="20"
                                                  color="#ff9900"/>
                                    <icon-loading v-if="loading[tag.id + '_en']" width="20" height="20"/>
                                </button>
                                <button type="button" v-tooltip="getLang('copy_to_clipboard')" @click="copy(tag.value)">
                                    <icon-copy width="20" height="20" color="#3c3c3c"/>
                                </button>
                                <button type="button"
                                        v-tooltip="getLang(tag.disabled ? 'enable_keyword': 'disable_keyword')"
                                        @click="onDisabledTagClick(index)">
                                    <icon-disabled v-show="!tag.disabled" width="20" height="20" color="#ff472f"/>
                                    <icon-enable v-show="tag.disabled" width="20" height="20" color="#2fff53"/>
                                </button>
                            </div>
                        </div>
                        <div class="prompt-local-language" v-show="!isEnglish">
                            <div class="translate-to-local hover-scale-120"
                                 v-tooltip="getLang('translate_keyword_to_local_language')"
                                 @click="onTranslateToLocalClick(index).then(() => updateTags())">
                                <icon-translate v-if="!loading[tag.id + '_local']" width="16" height="16"
                                                color="var(--body-text-color)"/>
                                <icon-loading v-if="loading[tag.id + '_local']" width="16" height="16"/>
                            </div>
                            <div class="local-language">{{ tag.localValue }}</div>
                        </div>
                    </div>
                </div>
                <!--<div class="prompt-append">
                    <input type="text" class="scroll-hide svelte-4xt1ch input-tag-append" ref="promptTagAppend"
                           v-model="appendTag" :placeholder="getLang('please_enter_new_keyword')"
                           v-tooltip="getLang('enter_to_add')" @keydown="onAppendTagKeyDown">
                </div>-->
            </div>
        </div>

        <history ref="history" :history-key="historyKey" v-model:language-code="languageCode"
                 :translate-apis="translateApis" :languages="languages" @use="onUseHistory"/>
        <favorite ref="favorite" :favorite-key="favoriteKey" v-model:language-code="languageCode"
                  :translate-apis="translateApis" :languages="languages" @use="onUseFavorite"/>
    </div>
</template>

<script>
import autoSizeInput from 'autosize-input'
import Sortable from 'sortablejs';
import common from "@/utils/common";

import IconClose from "@/components/icons/iconClose.vue";
import IconTranslate from "@/components/icons/iconTranslate.vue";
import IconCopy from "@/components/icons/iconCopy.vue";
import IconDisabled from "@/components/icons/iconDisabled.vue";
import IconEnable from "@/components/icons/iconEnable.vue";
import IconWeight from "@/components/icons/iconWeight.vue";
import IconEnglish from "@/components/icons/iconEnglish.vue";
import IconHistory from "@/components/icons/iconHistory.vue";
import IconFavorite from "@/components/icons/iconFavorite.vue";
import IconLoading from "@/components/icons/iconLoading.vue";
import History from "@/components/history.vue";
import Favorite from "@/components/favorite.vue";
import LanguageMixin from "@/mixins/languageMixin";
import IconInput from "@/components/icons/iconInput.vue";
import IconRemove from "@/components/icons/iconRemove.vue";
import IconTooltip from "@/components/icons/iconTooltip.vue";
import IconGithub from "@/components/icons/iconGithub.vue";
import IconI18n from "@/components/icons/iconI18n.vue";
import IconApi from "@/components/icons/iconApi.vue";
import VueNumberInput from '@chenfengyuan/vue-number-input';
import IconUnfold from "@/components/icons/iconUnflod.vue";
import IconSetting from "@/components/icons/iconSetting.vue";

export default {
    name: 'PhystonPrompt',
    components: {
        IconSetting,
        IconUnfold,
        VueNumberInput,
        IconApi,
        IconI18n,
        IconGithub,
        IconTooltip,
        IconRemove,
        IconInput,
        Favorite,
        History,
        IconLoading,
        IconFavorite,
        IconHistory, IconEnglish, IconWeight, IconEnable, IconDisabled, IconCopy, IconTranslate, IconClose,
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
    emits: ['update:languageCode', 'update:autoTranslateToEnglish', 'update:autoTranslateToLocal', 'update:hideDefaultInput', 'update:hidePanel', 'update:enableTooltip', 'update:translateApi', 'click:translateApi', 'click:selectLanguage'],
    data() {
        return {
            prompt: '',
            counterText: '',
            tags: [],
            appendTag: '',
            lastId: 0,
            dropTag: false,
            loading: {},
            editing: {},
            tagColor: '',
            autocompleteResults: null,
        }
    },
    computed: {
        isEnglish() {
            return this.languageCode === 'en_US'
        },
        translateApiItem() {
            return common.getTranslateApiItem(this.translateApis, this.translateApi)
        }
    },
    mounted() {
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
    },
    watch: {},
    methods: {
        init() {
            if (this.neg) {
                this.tagColor = 'var(--magenta-9)'
            } else {
                this.tagColor = 'var(--green-9)'
            }
            this.tags = []
            this.onTextareaChange()
            this.textarea.removeEventListener('change', this.onTextareaChange)
            this.textarea.addEventListener('change', this.onTextareaChange)
            /*setTimeout(() => {
                this.onShowHistoryClick()
            }, 1000)*/
        },
        async onTextareaChange(event) {
            const autocompleteResults = this.textarea.parentElement.getElementsByClassName('autocompleteResults')
            if (autocompleteResults.length > 0 && autocompleteResults[0].style.display !== 'none') {
                return
            }
            let value = this.textarea.value.trim()
            if (value === this.prompt.trim()) return
            let tags = common.splitTags(value)
            let newTags = []
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
                indexes.push(this._appendTag(newTags[i], '', false, newTagsIndex[i]))
            }
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
        genPrompt() {
            let prompts = []
            this.tags.forEach(tag => {
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
                prompts.push(tag.value)
            })
            if (prompts.length <= 0) return ''
            // console.log('update tags', prompts)
            return prompts.join(',') + ','
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
            this.$refs.history.push(this.tags, this.prompt)
            this.textarea.dispatchEvent(new Event('input'))
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
            }else if (this.tags[index].decWeight > 0) {
                value = common.setLayers(value, 0, '[', ']')
                value = '<div class="character">' + value + '</div>'
                let start = '<div class="weight-character">' + '['.repeat(this.tags[index].decWeight) + '</div>'
                let end = '<div class="weight-character">' + ']'.repeat(this.tags[index].decWeight) + '</div>'
                value = start + value + end
            }else{
                value = '<div class="character">' + value + '</div>'
            }
            return value
        },
        _setTag(tag) {
            tag.weightNum = common.getTagWeightNum(tag.value)
            tag.weightNum = tag.weightNum <= 0 ? 1 : tag.weightNum
            tag.incWeight = common.getTagIncWeight(tag.value)
            tag.decWeight = common.getTagDecWeight(tag.value)
            const bracket = common.hasBrackets(tag.value)
            tag.isLora = bracket[0] === '<' && bracket[1] === '>'
        },
        _appendTag(value, localValue = '', disabled = false, index = -1) {
            const id = this.lastId++
            let tag = {
                id,
                value,
                localValue,
                disabled,
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
                autoSizeInput(this.$refs['promptTagEdit-' + id][0])
            })
            return index - 1
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
                let tags = this.appendTag.replace(/,\s*$/, '')
                this.appendTag = ''
                if (common.hasBrackets(tags)) {
                    tags = common.replaceBrackets(tags)
                }
                this._appendTag(tags, text)
                this.updateTags()
            }, 300)
        },
        onAppendTagKeyDown(e, localValue = null) {
            if (e.keyCode === 38 || e.keyCode === 40) {
            } else if (e.keyCode === 13) {
                if (this.getAutocompleteResults() && this.autocompleteResults.style.display === 'block' && this.getAutocompleteResultsSelected()) {
                    setTimeout(() => {
                        localValue = e.target.value
                        const text = this.getAutocompleteResultsSelectedText()
                        if (text) {
                            localValue = text
                        }
                        this.onAppendTagKeyDown(e, localValue)
                    }, 300)
                    return
                }

                let tags = this.appendTag
                this.appendTag = ''
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
                        indexes.push(this._appendTag(tag))
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
            if (this.tags.length === 0) return
            if (this.loading['all_local']) return
            this.loading['all_local'] = true
            let tagIndexes = []
            for (const index in this.tags) {
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
                let textsIndexes = []
                for (const index of tagIndexes) {
                    texts.push(this.tags[index].value)
                    textsIndexes.push(index)
                    this.loading[this.tags[index].id + '_local'] = true
                }
                this.translateMulti(texts, 'en_US', this.languageCode, (res, index) => {
                    const tagIndex = textsIndexes[index]
                    this.loading[this.tags[tagIndex].id + '_local'] = false
                    if (!res.success) {
                        this.$toastr.error(res.message)
                        return
                    }
                    this.tags[tagIndex].localValue = res.translated_text
                }, () => {
                    resolve()
                })
            })
        },
        onTranslatesToEnglishClick() {
            if (this.tags.length === 0) return
            if (this.loading['all_en']) return
            this.loading['all_en'] = true
            let tagIndexes = []
            for (const index in this.tags) {
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
                let textsIndexes = []
                for (const index of tagIndexes) {
                    texts.push(this.tags[index].value)
                    textsIndexes.push(index)
                    this.loading[this.tags[index].id + '_en'] = true
                }
                this.translateMulti(texts, this.languageCode, 'en_US', (res, index) => {
                    const tagIndex = textsIndexes[index]
                    this.loading[this.tags[tagIndex].id + '_en'] = false
                    if (!res.success) {
                        this.$toastr.error(res.message)
                        return
                    }
                    this.tags[tagIndex].localValue = this.tags[tagIndex].value
                    this.tags[tagIndex].value = res.translated_text
                }, () => {
                    resolve()
                })
            })
        },
        onShowHistoryClick(e) {
            this.$refs.favorite.hide(0)
            this.$refs.history.show(this.$refs.historyButton)
        },
        onShowFavoriteClick(e) {
            this.$refs.history.hide(0)
            this.$refs.favorite.show(this.$refs.favoriteButton)
        },
        onUseHistory(history) {
            this.tags = history.tags
            this.updateTags()
        },
        onUseFavorite(favorite) {
            this.tags = favorite.tags
            this.updateTags()
        },
        onPromptMainClick() {
            this.onTextareaChange(true)
            this.$refs.history.hide(0)
            this.$refs.favorite.hide(0)
        },
        onUnfoldClick() {
            this.$emit("update:hidePanel", !this.hidePanel)
        }
    },
}
</script>
<style lang="less">
.physton-prompt {
    border: 1px solid var(--input-border-color);
    padding: 0 10px;
    margin: 5px 0;

    div {
        line-height: 1;
    }

    svg {
        display: inline-block;
    }

    .icon-svg {
        display: inline-block;
        line-height: 1;
    }

    .prompt-main {
        &.fold {
            max-height: 36px;
            overflow: hidden;

            .prompt-unfold {
                transform: rotate(180deg);
            }
        }
    }

    .prompt-header {
        margin: 5px 0;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding-bottom: 10px;
        margin-bottom: 10px;
        border-bottom: 1px dashed var(--input-border-color);
        flex-wrap: nowrap;

        > * {
            margin-right: 10px;

            &:last-child {
                margin-right: 0;
            }
        }

        .prompt-unfold {
            cursor: pointer;
            margin-right: 2px;
            animation: all .3s
        }

        .prompt-header-title {
            font-weight: bold;
            font-size: 1rem;
            white-space: nowrap;
        }

        .prompt-header-counter {
            font-size: .9rem;
        }

        .prompt-header-break {
            flex-basis: 100%;
            height: 0;
            margin-bottom: 0;
        }

        .prompt-header-extend {
            margin-right: 10px;
            display: flex;
            justify-content: flex-start;
            align-items: center;

            &:last-child {
                margin-right: 0;
            }

            .extend-title {
                font-size: 0.8rem;
                margin-right: 5px;
            }

            &.prompt-append {
                position: relative;
                flex: 1;

                .extend-content {
                    width: 100%;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                }
            }

            .extend-content {
                select, .select-btn {
                    padding: 0 10px 0 5px;
                    font-size: 0.8rem;
                    appearance: auto;
                    border: var(--button-border-width) solid var(--body-text-color);
                    background: var(--body-background-fill);
                    color: var(--body-text-color);
                    height: 20px;
                    line-height: 20px;

                    &:hover {
                        border-color: var(--button-primary-border-color);
                    }
                }

                .select-btn {
                    cursor: pointer;
                    padding: 0 10px;

                    &:hover {
                        background: var(--button-primary-background-fill-hover);
                        border-color: var(--button-primary-border-color-hover);
                    }
                }

                .autocompleteResults {
                    top: 26px !important;
                }

                .input-tag-append {
                    display: inline-block;
                    height: 26px !important;
                    padding: 4px !important;
                    //border: 1px solid var(--input-border-color);
                    border: 1px solid #02b7fd;
                    appearance: none;
                    background-color: transparent;
                    font-size: 0.9rem !important;
                    line-height: 0.9rem !important;
                    font-family: inherit;
                    font-weight: inherit;
                    border-radius: 4px !important;
                    min-width: 200px;
                    width: 80%;
                    text-align: left;

                    &:focus {
                        box-shadow: var(--input-shadow-focus) !important;
                        //border: 1px solid #02b7fd !important;
                        //border-color: var(--input-border-color-focus);
                    }
                }

                .extend-btn-group {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: var(--button-secondary-text-color);
                    background: var(--button-secondary-background-fill);
                    border: 1px solid var(--button-secondary-border-color);
                    padding: 0;
                    border-radius: 4px;

                    .extend-btn-item {
                        cursor: pointer;
                        border-left: 1px solid var(--button-secondary-border-color);
                        height: 26px;
                        width: 30px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        position: relative;

                        &:first-child {
                            border-left: 0;
                            margin-left: 0;
                        }

                        &:hover{
                            .setting-box {
                                display: flex;
                            }
                        }

                        .setting-box {
                            display: none;
                            position: absolute;
                            background: #e6f4ff;
                            //top: -36px;
                            //left: 0;
                            top: -5px;
                            left: 28px;
                            justify-content: flex-start;
                            align-items: center;
                            width: max-content;
                            height: 36px;
                            padding: 0 10px;
                            box-shadow: 0 0 3px 0 #4a54ff;
                            border-radius: 6px 6px 4px 4px;
                            z-index: 10;

                            > * {
                                margin-left: 10px;

                                &:first-child {
                                    margin-left: 0;
                                }
                            }

                            /*&::before {
                                content: "";
                                position: absolute;
                                bottom: -10px;
                                left: 10px;
                                border-width: 10px 10px 0;
                                border-style: solid;
                                border-color: #fff transparent transparent; !* 三角箭头的颜色 *!
                            }*/
                        }
                    }
                }

                .gradio-button, a {
                    height: 26px !important;
                    min-height: 26px !important;
                    max-height: 26px !important;
                }

                .gradio-checkbox {
                    cursor: pointer;
                }

                input[type="checkbox"] {
                    --ring-color: transparent;
                    position: relative;
                    box-shadow: var(--input-shadow);
                    border: 1px solid var(--checkbox-border-color);
                    border-radius: var(--checkbox-border-radius);
                    background-color: var(--checkbox-background-color);
                    line-height: var(--line-sm);
                    width: 16px;
                    height: 16px;

                    &:checked {
                        border-color: var(--checkbox-border-color-selected);
                        background-image: var(--checkbox-check);
                        background-color: var(--checkbox-background-color-selected)
                    }
                }
            }
        }
    }

    .prompt-tags {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-items: flex-start;

        &.droping {
            .btn-tag-extend {
                display: none !important;
            }
        }

        .prompt-tags-list {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: flex-start;
            width: 100%;

            .prompt-tag{
                margin-bottom: 8px;
                margin-right: 10px;
                display: block;
                align-items: center;
                max-width: 100%;

                &:last-child {
                    margin-right: 12px;
                }

                &.disabled {
                    opacity: 0.5;
                }

                .prompt-tag-main {
                    width: 100%;
                    display: flex;
                    justify-content: flex-start;
                    align-items: flex-start;
                    position: relative;

                    &:hover {
                        .prompt-tag-edit, .btn-tag-extend {
                            box-shadow: 0 0 3px 0 #4a54ff;
                        }

                        .btn-tag-extend {
                            display: flex;
                        }
                    }

                    .prompt-tag-edit {
                        width: 100%;
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        position: relative;
                        border-radius: 4px;

                        .prompt-tag-value {
                            width: calc(100% - 16px);
                            padding: 4px;
                            font-size: 0.9rem;
                            height: 24px;
                            border-radius: 4px;
                            border-top-right-radius: 0;
                            border-bottom-right-radius: 0;
                            display: flex;
                            align-items: center;
                            justify-content: flex-start;
                            color: var(--button-secondary-text-color);
                            background: var(--button-secondary-background-fill);
                            border: var(--button-border-width) solid var(--button-secondary-border-color);
                            &:hover{
                                border-color: var(--button-secondary-border-color-hover);
                                background: var(--button-secondary-background-fill-hover);
                                color: var(--button-secondary-text-color-hover);
                            }

                            .character {
                                text-overflow: ellipsis;
                                overflow: hidden;
                                white-space: nowrap;
                                line-height: 1rem;
                            }

                            .weight-character {
                                color: #d81e06;
                            }
                        }

                        .input-tag-edit {
                            max-width: calc(100% - 16px);
                            border-radius: 4px !important;
                            border-top-right-radius: 0 !important;
                            border-bottom-right-radius: 0 !important;
                        }

                        .btn-tag-delete {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            cursor: pointer;
                            border: var(--button-border-width) solid var(--button-secondary-border-color);
                            background: var(--button-secondary-background-fill);
                            padding: 0;
                            width: 16px;
                            height: 24px;
                            border-radius: 0;
                            border-top-right-radius: 4px;
                            border-bottom-right-radius: 4px;

                            &:hover {
                                background: #d81e06;

                                svg {
                                    fill: #fff !important;
                                }
                            }
                        }
                    }

                    .btn-tag-extend {
                        display: none;
                        justify-content: flex-start;
                        align-items: center;
                        position: absolute;
                        top: -32px;
                        left: 0;
                        z-index: 100;
                        padding: 0;
                        box-shadow: 0 0 3px 0 #4a54ff;
                        background: center center #4A54FF;
                        background-image: linear-gradient(315deg, #6772FF 0, #00F9E5 100%);
                        background-size: 104% 104%;
                        border-radius: 4px;
                        overflow: hidden;

                        > button {
                            height: 32px;
                            width: 32px;
                            border: 0;
                            border-radius: 0;
                            padding: 5px;
                            min-width: auto;
                            font-size: 0.9rem;
                            min-height: auto;
                            background: transparent;
                            color: #fff;
                            border-right: 1px solid rgba(255, 255, 255, 0.2);

                            &:last-child {
                                border-right: 0;
                            }

                            &:hover {
                                background: rgba(255, 255, 255, 0.2);
                            }
                        }

                        > input {
                            width: 54px;
                            border: 0;
                        }

                        .input-number {
                            width: 90px;
                            border: 0;
                            padding: 0;

                            .vue-number-input__button {
                                width: 1.5rem;
                                background: rgba(255, 255, 255, .9);
                            }

                            .vue-number-input__input {
                                height: 32px;
                                border: 0;
                                padding: 0;
                            }
                        }

                        input[type=number]::-webkit-inner-spin-button,
                        input[type=number]::-webkit-outer-spin-button {
                            opacity: 1;
                        }
                    }
                }

                .prompt-local-language {
                    margin-top: 2px;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;

                    .translate-to-local {
                        cursor: pointer;
                    }

                    .local-language {
                        font-size: .8rem;
                        color: var(--body-text-color-subdued);
                        margin-left: 2px;
                    }
                }
            }
        }

        input[type="text"], input[type="number"] {
            display: inline-block;
            overflow-y: scroll;
            height: 24px;
            padding: 4px;
            border: 1px solid #02b7fd;
            appearance: none;
            background-color: transparent;
            font-size: 0.9rem;
            line-height: 0.9rem;
            font-family: inherit;
            font-weight: inherit;
            border-radius: 4px;

            &:focus {
                box-shadow: var(--input-shadow-focus);
                border-color: var(--input-border-color-focus);
            }
        }

        .gradio-button {
            max-width: none !important;
            width: auto !important;
            padding: 4px 12px !important;
        }
    }
}
</style>
