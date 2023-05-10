<template>
    <div class="physton-prompt" :name="name">
        <div class="prompt-main" @click="onPromptMainClick">
            <div class="prompt-header">
                <div class="prompt-header-title">{{ neg ? getLang('negative_prompt') : getLang('prompt') }}</div>
                <div class="prompt-header-counter" v-show="counterText">({{ counterText }})</div>
                <div class="prompt-header-extend">
                    <div class="extend-title">{{ getLang('local_language') }}{{ isEnglish ? '' : '/Language' }}:</div>
                    <div class="extend-content">
                        <select @change="$emit('update:languageCode', $event.target.value)" :value="languageCode">
                            <option v-for="item in languages" :key="item.code" :value="item.code"
                                    :selected="item.code == languageCode"><!--{{ item.code }} - -->{{ item.name }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="prompt-header-extend" v-show="!isEnglish">
                    <div class="extend-title">{{ getLang('translate_api') }}:</div>
                    <div class="extend-content">
                        <div class="current-translate-api" v-if="translateApiItem.name" @click="$emit('click:translateApi')">{{ translateApiItem.name }}</div>
                    </div>
                </div>
                <div class="prompt-header-break"></div>
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <button type="button" class="lg secondary gradio-button tool svelte-1ipelgc hover-scale-120"
                                v-tooltip="getLang('copy_keywords_to_clipboard')" @click="onCopyAllTagsClick">
                            <icon-copy width="18" height="18" color="#000"/>
                        </button>
                    </div>
                </div>
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <button type="button" class="lg secondary gradio-button tool svelte-1ipelgc hover-scale-120"
                                ref="historyButton"
                                v-tooltip="getLang('history')" @click.stop="onShowHistoryClick">
                            <icon-history width="18" height="18"/>
                        </button>
                    </div>
                </div>
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <button type="button" class="lg secondary gradio-button tool svelte-1ipelgc hover-scale-120"
                                ref="favoriteButton"
                                v-tooltip="getLang('favorite')" @click.stop="onShowFavoriteClick">
                            <icon-favorite width="18" height="18"/>
                        </button>
                    </div>
                </div>
                <div class="prompt-header-extend" v-show="!isEnglish">
                    <div class="extend-content">
                        <button type="button" class="lg secondary gradio-button tool svelte-1ipelgc hover-scale-120"
                                v-tooltip="getLang('translate_keywords_to_local_language')"
                                @click="onTranslatesToLocalClick">
                            <icon-translate v-if="!loading['all_local']" width="18" height="18" color="#ad6800"/>
                            <icon-loading v-if="loading['all_local']" width="18" height="18"/>
                        </button>
                    </div>
                </div>
                <div class="prompt-header-extend" v-show="!isEnglish">
                    <div class="extend-content">
                        <button type="button" class="lg secondary gradio-button tool svelte-1ipelgc hover-scale-120"
                                v-tooltip="getLang('translate_all_keywords_to_english')"
                                @click="onTranslatesToEnglishClick">
                            <icon-english v-if="!loading['all_en']" width="18" height="18" color="#ad6800"/>
                            <icon-loading v-if="loading['all_en']" width="18" height="18"/>
                        </button>
                    </div>
                </div>
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <button type="button" class="lg secondary gradio-button tool svelte-1ipelgc hover-scale-120"
                                v-tooltip="getLang('delete_all_keywords')"
                                @click="onDeleteAllTagsClick">
                            <icon-remove width="18" height="18" color="#d81e06"/>
                        </button>
                    </div>
                </div>
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <a href="https://github.com/Physton/sd-webui-prompt-all-in-one" target="_blank" class="lg secondary gradio-button tool svelte-1ipelgc hover-scale-120">
                            <icon-github width="18" height="18" color="#000"/>
                        </a>
                    </div>
                </div>
                <div class="prompt-header-extend" v-show="!isEnglish">
                    <div class="extend-content">
                        <div class="gradio-checkbox hover-scale-120">
                            <label v-tooltip="getLang('auto_translate_to_english')">
                                <input type="checkbox" name="auto_translate_to_english" value="1"
                                       :checked="autoTranslateToEnglish"
                                       @change="$emit('update:autoTranslateToEnglish', $event.target.checked)">
                                <icon-english width="26" height="26" color="#ad6800"/>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="prompt-header-extend" v-show="!isEnglish">
                    <div class="extend-content">
                        <div class="gradio-checkbox hover-scale-120">
                            <label v-tooltip="getLang('auto_translate_to_local_language')">
                                <input type="checkbox" name="auto_translate_to_local_language" value="1"
                                       :checked="autoTranslateToLocal"
                                       @change="$emit('update:autoTranslateToLocal', $event.target.checked)">
                                <icon-translate width="26" height="26" color="#ad6800"/>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <div class="gradio-checkbox hover-scale-120">
                            <label v-if="hideDefaultInput" v-tooltip="getLang('show_default_input_box')">
                                <input type="checkbox" name="hide_default_input" value="1"
                                       :checked="!hideDefaultInput"
                                       @change="$emit('update:hideDefaultInput', !$event.target.checked)">
                                <icon-input width="26" height="26" color="#000"/>
                            </label>
                            <label v-else v-tooltip="getLang('hide_default_input_box')">
                                <input type="checkbox" name="hide_default_input" value="1"
                                       :checked="!hideDefaultInput"
                                       @change="$emit('update:hideDefaultInput', !$event.target.checked)">
                                <icon-input width="26" height="26" color="#000"/>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="prompt-header-extend">
                    <div class="extend-content">
                        <div class="gradio-checkbox hover-scale-120">
                            <label v-tooltip="getLang('whether_to_enable_tooltip')">
                                <input type="checkbox" name="enable_tooltip" value="1"
                                       :checked="enableTooltip"
                                       @change="$emit('update:enableTooltip', $event.target.checked)">
                                <icon-tooltip width="26" height="26" color="#000"/>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div :class="['prompt-tags', dropTag ? 'droping': '']" ref="promptTags">
                <div v-for="(tag, index) in tags" :key="tag.id" :data-id="tag.id"
                     :class="['prompt-tag', tag.disabled ? 'disabled': '']">
                    <div class="prompt-tag-content">
                        <div class="prompt-tag-main">
                            <div class="prompt-tag-edit">
                                <button v-show="!editing[tag.id]" type="button"
                                        class="lg secondary gradio-button tool svelte-1ipelgc prompt-tag-value"
                                        :style="{color: this.tagColor}"
                                        :ref="'promptTag-' + tag.id"
                                        v-tooltip="getLang('click_to_edit') + '<br/>' + getLang('drop_to_order')"
                                        @click="onTagClick(index)" v-html="renderTag(index)"></button>
                                <div v-show="editing[tag.id]">
                                    <input type="text" class="scroll-hide svelte-4xt1ch input-tag-edit"
                                           :ref="'promptTagEdit-' + tag.id" :placeholder="getLang('enter_to_save')"
                                           :value="tag.value" @blur="onTagInputBlur(index)"
                                           @keydown="onTagInputKeyDown(index, $event)"
                                           @change="onTagInputChange(index, $event)">
                                </div>
                                <div class="btn-tag-delete" @click="onDeleteTagClick(index)">
                                    <icon-close width="12" height="12"/>
                                </div>
                            </div>
                            <div class="btn-tag-extend">
                                <input v-if="tag.weightNum > 0" type="number" min="0.1" step="0.1"
                                       :value="tag.weightNum"
                                       @change="onTagWeightNumChange(index, $event)">
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
                                                  color="#ad6800"/>
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
                <input type="text" class="scroll-hide svelte-4xt1ch input-tag-append" ref="promptTagAppend"
                       v-model="appendTag" :placeholder="getLang('please_enter_new_keyword')"
                       v-tooltip="getLang('enter_to_add')" @keydown="onAppendTagKeyDown">
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

export default {
    name: 'PhystonPrompt',
    components: {
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
    emits: ['update:languageCode', 'update:autoTranslateToEnglish', 'update:autoTranslateToLocal', 'update:hideDefaultInput', 'update:enableTooltip', 'update:translateApi', 'click:translateApi'],
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
            autoSizeInput(this.$refs.promptTagAppend)
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
            if (value === this.prompt) return
            let tags = common.splitTags(value)
            let newTags = []
            let delTags = []
            tags.forEach(tag => {
                let find = false
                for (let i = 0; i < this.tags.length; i++) {
                    if (this.tags[i].value === tag) {
                        find = true
                        break
                    }
                }
                if (!find) newTags.push(tag)
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
                indexes.push(this._appendTag(newTags[i]))
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
                console.log(value)
                if (value !== tag.value) {
                    tag.value = value
                    this._setTag(tag)
                }
                let localValue = common.replaceTag(tag.localValue)
                if (localValue !== tag.localValue) {
                    tag.localValue = localValue
                }

                if (tag.weightNum > 0) {
                    tag.weightNum = parseFloat(tag.weightNum).toFixed(1)
                    tag.value = tag.value.replace(common.weightNumRegex, ':' + tag.weightNum)
                    if (tag.localValue !== '') {
                        tag.localValue = tag.localValue.replace(common.weightNumRegex, ':' + tag.weightNum)
                    }
                }
                if (tag.disabled) return
                prompts.push(tag.value)
            })
            // console.log('update tags', prompts)
            return prompts.join(', ').trim() + ', '
        },
        updateTags() {
            console.log('tags change', this.tags)
            this.prompt = this.genPrompt()
            this.textarea.value = this.prompt
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
                let start = '<span class="weight-character">' + '('.repeat(this.tags[index].incWeight) + '</span>'
                let end = '<span class="weight-character">' + ')'.repeat(this.tags[index].incWeight) + '</span>'
                value = start + value + end
            }
            if (this.tags[index].decWeight > 0) {
                value = common.setLayers(value, 0, '[', ']')
                let start = '<span class="weight-character">' + '['.repeat(this.tags[index].decWeight) + '</span>'
                let end = '<span class="weight-character">' + ']'.repeat(this.tags[index].decWeight) + '</span>'
                value = start + value + end
            }
            return value
        },
        _setTag(tag) {
            tag.weightNum = common.getTagWeightNum(tag.value)
            tag.incWeight = common.getTagIncWeight(tag.value)
            tag.decWeight = common.getTagDecWeight(tag.value)
        },
        _appendTag(value, localValue = '', disabled = false) {
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
            const index = this.tags.push(tag)
            this.$nextTick(() => {
                autoSizeInput(this.$refs['promptTagEdit-' + id][0])
            })
            return index - 1
        },
        initSortable() {
            Sortable.create(this.$refs.promptTags, {
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
        onAppendTagKeyDown(e) {
            if (e.keyCode === 13) {
                let tags = this.appendTag
                this.appendTag = ''
                tags = common.splitTags(tags)
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
                    // this.updateTags()
                }
            }
        },
        onTagInputChange(index, e) {
            if (this.tags[index].value === e.target.value) return
            this.tags[index].value = e.target.value
            this._updateTag(this.tags[index])
            this.updateTags()
        },
        onTagWeightNumChange(index, e) {
            if (this.tags[index].weightNum === e.target.value) return
            this.tags[index].weightNum = e.target.value
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
            value = common.setLayers(value, 0, '[', ']')
            let incWeight = this.tags[index].incWeight
            incWeight += num
            if (incWeight < 0) incWeight = 0
            this.tags[index].incWeight = incWeight
            this.tags[index].decWeight = 0
            value = common.setLayers(value, incWeight, '(', ')')
            this.tags[index].value = value
            this.updateTags()
        },
        onDecWeightClick(index, num) {
            let value = this.tags[index].value
            value = common.setLayers(value, 0, '(', ')')
            let decWeight = this.tags[index].decWeight
            decWeight += num
            if (decWeight < 0) decWeight = 0
            this.tags[index].incWeight = 0
            this.tags[index].decWeight = decWeight
            value = common.setLayers(value, decWeight, '[', ']')
            this.tags[index].value = value
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

  .prompt-header {
    margin: 5px 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    //padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px dashed var(--input-border-color);
    flex-wrap: wrap;

    > * {
      margin-right: 10px;
      margin-bottom: 10px;

      &:last-child {
        margin-right: 0;
      }
    }

    .prompt-header-title {
      font-weight: bold;
      font-size: 1rem;
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

      .extend-content {
        select, .current-translate-api {
          padding: 0 10px 0 5px;
          font-size: 0.8rem;
          appearance: auto;
          border: var(--button-border-width) solid var(--button-primary-border-color);
          background: var(--button-primary-background-fill);
          color: var(--button-primary-text-color);
          height: 20px;
          line-height: 20px;

          &:hover {
            background: var(--button-primary-background-fill-hover);
            border-color: var(--button-primary-border-color-hover);
          }
        }

        .current-translate-api {
          cursor: pointer;
          padding: 0 10px;

          &:hover {
            background: var(--button-primary-background-fill-hover);
            border-color: var(--button-primary-border-color-hover);
          }
        }

        .gradio-button {
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

    > * {
      margin-right: 12px;
      margin-bottom: 8px;

      &:last-child {
        margin-right: 0;
      }
    }

    &.droping {
      .btn-tag-extend {
        display: none !important;
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

      &:focus {
        box-shadow: var(--input-shadow-focus);
        border-color: var(--input-border-color-focus);
      }
    }

    .prompt-tag {
      display: inline-flex;
      align-items: center;

      &.disabled {
        opacity: 0.5;
      }

      /*&.sortable-chosen {
    .btn-tag-extend {
        display: none !important;
    }
}*/

      .prompt-tag-content {
      }

      .prompt-tag-main {
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
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          border-radius: 4px;

          .prompt-tag-value {
            padding: 4px !important;
            font-size: 0.9rem !important;
            height: 24px !important;
            min-height: unset !important;
            border-top-right-radius: 0 !important;
            border-bottom-right-radius: 0 !important;

            .weight-character {
              color: #d81e06;
            }
          }

          .input-tag-edit {
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

          > * {
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

    .input-tag-append {
      min-width: 200px;
    }

    .gradio-button {
      max-width: none !important;
      width: auto !important;
      padding: 4px 12px !important;
    }
  }
}
</style>
