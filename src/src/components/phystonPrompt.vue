<template>
    <div class="physton-prompt" :name="name">
        <div :class="['prompt-main', hidePanel ? 'fold': '']" @click="onPromptMainClick">
            <div class="prompt-header">
                <div class="prompt-unfold" @click="onUnfoldClick" v-tooltip="getLang(hidePanel ? 'show_panel' : 'hide_panel')">
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
                            <div :class="['extend-btn-item', isLatestVersion ? '' : 'red-dot']">
                                <icon-svg class="hover-scale-120" name="setting" v-tooltip="getLang('setting_desc')"/>
                                <div class="setting-box" v-animate="'fadeIn'" @mouseenter="onSettingBoxMouseEnter">
                                    <div v-if="translateApiItem.name && !isEnglish" class="extend-btn-item"
                                         v-tooltip="getLang('translate_api') + ': ' + translateApiItem.name"
                                         @click="$emit('click:translateApi', $event)">
                                        <icon-svg class="hover-scale-120" name="api"/>
                                    </div>
                                    <div class="extend-btn-item"
                                         v-tooltip="getLang('prompt_format')"
                                         @click="$emit('click:promptFormat', $event)">
                                        <icon-svg class="hover-scale-120" name="format"/>
                                    </div>
                                    <div class="extend-btn-item"
                                         v-tooltip="getLang('keywords_blacklist')"
                                         @click="$emit('click:blacklist', $event)">
                                        <icon-svg class="hover-scale-120" name="blacklist"/>
                                    </div>
                                    <div class="extend-btn-item"
                                         v-tooltip="getLang('hotkey_setting')"
                                         @click="$emit('click:hotkey', $event)">
                                        <icon-svg class="hover-scale-120" name="hotkey"/>
                                    </div>
                                    <div class="extend-btn-item"
                                         v-tooltip="getLang('theme_extension')"
                                         @click="$emit('click:selectTheme', $event)">
                                        <icon-svg class="hover-scale-120" name="theme"/>
                                    </div>
                                    <div class="extend-btn-item"
                                         v-tooltip="getLang(theme === 'dark' ? 'switch_to_light_theme': 'switch_to_dark_theme')"
                                         @click="$emit('click:switchTheme', $event)">
                                        <icon-svg class="hover-scale-120" :name="theme === 'dark' ? 'sun': 'moon'"/>
                                    </div>
                                    <div :class="['extend-btn-item', isLatestVersion ? '' : 'red-dot']"
                                         v-tooltip="getLang('about_desc')"
                                         @click="$emit('click:showAbout', $event)">
                                        <icon-svg class="hover-scale-120" name="about"/>
                                    </div>
                                    <template v-if="!isEnglish">
                                        <template v-if="canOneTranslate">
                                            <div class="gradio-checkbox hover-scale-120">
                                                <label v-tooltip="getLang('auto_translate')">
                                                    <input type="checkbox" name="auto_translate"
                                                           value="1"
                                                           :checked="autoTranslate"
                                                           @change="$emit('update:autoTranslate', $event.target.checked)">
                                                    <icon-svg name="translate"/>
                                                </label>
                                            </div>
                                        </template>
                                        <template v-else>
                                            <div class="gradio-checkbox hover-scale-120">
                                                <label v-tooltip="getLang('auto_translate_to_local_language')">
                                                    <input type="checkbox" name="auto_translate_to_local_language"
                                                           value="1"
                                                           :checked="autoTranslateToLocal"
                                                           @change="$emit('update:autoTranslateToLocal', $event.target.checked)">
                                                    <icon-svg name="translate"/>
                                                </label>
                                            </div>
                                            <div class="gradio-checkbox hover-scale-120">
                                                <label v-tooltip="getLang('auto_translate_to_english')">
                                                    <input type="checkbox" name="auto_translate_to_english" value="1"
                                                           :checked="autoTranslateToEnglish"
                                                           @change="$emit('update:autoTranslateToEnglish', $event.target.checked)">
                                                    <icon-svg name="english"/>
                                                </label>
                                            </div>
                                        </template>
                                    </template>
                                    <!--<div class="gradio-checkbox hover-scale-120">
                                        <label v-tooltip="getLang('is_remove_space')">
                                            <input type="checkbox" name="auto_remove_space" value="1"
                                                   :checked="autoRemoveSpace"
                                                   @change="$emit('update:autoRemoveSpace', $event.target.checked)">
                                            <icon-svg name="remove-space"/>
                                        </label>
                                    </div>-->
                                    <div class="gradio-checkbox hover-scale-120">
                                        <label v-tooltip="getLang('whether_to_enable_tooltip')">
                                            <input type="checkbox" name="enable_tooltip" value="1"
                                                   :checked="enableTooltip"
                                                   @change="$emit('update:enableTooltip', $event.target.checked)">
                                            <icon-svg name="tooltip"/>
                                        </label>
                                    </div>
                                    <div class="gradio-checkbox">
                                        <label v-tooltip="getLang('auto_input_prompt')">
                                            <select v-model="autoInputPrompt" @change="onAutoInputPromptChange">
                                                <option value="disabled">{{ getLang('auto_input_prompt') }}:
                                                    {{ getLang('disabled') }}
                                                </option>
                                                <option value="last">{{ getLang('last_input_prompt') }}</option>
                                                <optgroup v-for="(item) in getCurrentTypeFavorites()" :key="item.key"
                                                          :label="getLang('favorite') + ' / ' + getLang(item.name)">
                                                    <option v-for="(favorite) in item.list" :value="favorite.id">
                                                        {{ favorite.name || favorite.prompt.substring(0, 40) }}
                                                    </option>
                                                </optgroup>
                                            </select>
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
                <template v-if="!isEnglish">
                    <div class="prompt-header-extend">
                        <div class="extend-content">
                            <div class="extend-btn-group">
                                <template v-if="canOneTranslate">
                                    <div class="extend-btn-item"
                                         v-tooltip="getLang('one_translate_all_keywords')"
                                         @click="onTranslatesToLocalClick">
                                        <icon-svg v-if="!loading['all_local']" class="hover-scale-120"
                                                  name="translate"/>
                                        <icon-svg v-if="loading['all_local']" class="hover-scale-120" name="loading"/>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="extend-btn-item"
                                         v-tooltip="getLang('translate_keywords_to_local_language')"
                                         @click="onTranslatesToLocalClick">
                                        <icon-svg v-if="!loading['all_local']" class="hover-scale-120"
                                                  name="translate"/>
                                        <icon-svg v-if="loading['all_local']" class="hover-scale-120" name="loading"/>
                                    </div>
                                    <div class="extend-btn-item"
                                         v-tooltip="getLang('translate_all_keywords_to_english')"
                                         @click="onTranslatesToEnglishClick">
                                        <icon-svg v-if="!loading['all_en']" class="hover-scale-120" name="english"/>
                                        <icon-svg v-if="loading['all_en']" class="hover-scale-120" name="loading"/>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </template>
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
                <div class="prompt-header-extend" v-if="!autoLoadWebuiPrompt">
                    <div class="extend-content">
                        <div class="extend-btn-group">
                            <div class="extend-btn-item" v-tooltip="getLang('load_webui_prompt')"
                                 @click="onClickLoadWebuiPrompt">
                                <icon-svg class="hover-scale-120" name="load2"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="prompt-header-extend" v-if="!neg">
                    <div class="extend-content">
                        <div class="extend-btn-group">
                            <div class="extend-btn-item" v-tooltip="getLang('use_chatgpt_gen_prompts')"
                                 @click="$emit('click:showChatgpt', $event)">
                                <icon-svg class="hover-scale-120" name="chatgpt"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="prompt-header-extend prompt-append">
                    <div class="extend-content">
                        <div class="gradio-checkbox hover-scale-120">
                            <label v-tooltip="getLang('auto_load_webui_prompt')">
                                <input type="checkbox" name="auto_load_webui_prompt" value="1"
                                       :checked="autoLoadWebuiPrompt"
                                       @change="$emit('update:autoLoadWebuiPrompt', $event.target.checked)">
                                <icon-svg name="load"/>
                            </label>
                        </div>
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
                        <textarea type="text" class="scroll-hide svelte-4xt1ch input-tag-append" ref="promptTagAppend"
                                  :placeholder="getLang('please_enter_new_keyword')"
                                  v-tooltip="getLang('enter_to_add')"
                                  @focus="onAppendTagFocus"
                                  @blur="onAppendTagBlur"
                                  @keyup="onAppendTagKeyUp"
                                  @keydown="onAppendTagKeyDown"></textarea>

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
                                <Transition name="fade">
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
                                </Transition>
                                <Transition name="fade">
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
                                </Transition>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                :class="['prompt-tags', droping ? 'droping': '', (dropIsSelecting || (dropIsEnd && dropTags.length)) ? 'selecting' : '']"
                ref="promptTags"
                @mousedown="onDropMouseDown"
                @mousemove="onDropMouseMove"
                @mouseup="onDropMouseUp">
                <div class="prompt-tags-list" ref="promptTagsList">

                    <div v-for="(tag, index) in tags" :key="'line-' + tag.id"
                         :class="['prompt-tag-line-no', tagLineNumbers[index] ? 'line-no' : '']"
                         :data-line="tagLineNumbers[index]"
                         :data-id="tag.id"
                         ref="promptTagLineNo"
                         @mousedown.stop="" @mousemove.stop="" @mouseup.stop=""></div>

                     <!--<TransitionGroup name="fadeLeft">-->
                    <div v-for="(tag, index) in tags" :key="tag.id"
                         :class="['prompt-tag', tag.disabled ? 'disabled': '', tag.type === 'wrap' ? 'wrap-tag' : '']"
                         :ref="'promptTag-' + tag.id" :data-id="tag.id">
                        <div class="prompt-tag-main"
                             @mouseenter="onTagMouseEnter(tag.id)"
                             @mousemove.stop="onTagMouseMove(tag.id)"
                             @mouseleave.stop="onTagMouseLeave(tag.id)">
                            <div class="prompt-tag-edit">
                                <template v-if="tag.type === 'wrap'">
                                    <div class="prompt-tag-value"
                                         :ref="'promptTagValue-' + tag.id"
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
                                         :class="tag.classes"
                                         :style="getTagColorStyle(tag)"
                                         :ref="'promptTagValue-' + tag.id"
                                         v-tooltip="tag.isLora || tag.isLyco ? '' : getLang('click_to_edit') + '<br/>' + getLang('dblclick_to_disable') + '<br/>' + getLang('drop_to_order')"
                                         @click="onTagClick(tag.id, $event)"
                                         @dblclick="onTagDblclick(tag.id)"
                                         @click.right.prevent="onTagRightClick(tag.id, $event)"
                                         v-html="renderTag(tag.id)">
                                    </div>
                                    <textarea v-show="editing[tag.id]" type="text"
                                              class="scroll-hide svelte-4xt1ch input-tag-edit"
                                              :ref="'promptTagEdit-' + tag.id"
                                              :placeholder="getLang('enter_to_save')"
                                              :value="tag.value"
                                              @mousedown.stop=""
                                              @mousemove.stop=""
                                              @mouseup.stop=""
                                              @blur="onTagInputBlur(tag.id)"
                                              @keydown="onTagInputKeyDown(tag.id, $event)"
                                              @change="onTagInputChange(tag.id, $event)"></textarea>
                                    <!--<input v-show="editing[tag.id]" type="text"
                                           class="scroll-hide svelte-4xt1ch input-tag-edit"
                                           :ref="'promptTagEdit-' + tag.id" :placeholder="getLang('enter_to_save')"
                                           :value="tag.value" @blur="onTagInputBlur(tag.id)"
                                           @keydown="onTagInputKeyDown(tag.id, $event)"
                                           @change="onTagInputChange(tag.id, $event)">-->
                                </template>
                                <div class="btn-tag-delete" :ref="'promptTagDelete-' + tag.id"
                                     @click="onDeleteTagClick(tag.id)" @mousedown.stop=""
                                     @mousemove.stop="" @mouseup.stop="">
                                    <icon-svg name="close"/>
                                </div>
                            </div>
                            <div class="btn-tag-extend"
                                 v-animate="'fadeIn'"
                                 :style="{display: (tag.type === 'text' || !tag.type) && (showExtendId === tag.id) && !this.editing[tag.id] ? 'flex' : 'none'}"
                                 @click.stop=""
                                 @mousedown.stop=""
                                 @mousemove.stop=""
                                 @mouseup.stop="">
                                <vue-number-input class="input-number" name="input-number" :model-value="tag.weightNum" center controls
                                                  :min="-100"
                                                  :step="0.1"
                                                  size="small"
                                                  @update:model-value="onTagWeightNumChange(tag.id, $event)"></vue-number-input>
                                <button type="button" name="weight-parentheses-inc" v-tooltip="getLang('increase_weight_add_parentheses')"
                                        @click="onIncWeightClick(tag.id, +1)">
                                    <icon-svg :name="useNovelAiWeightSymbol ? 'weight-braces-inc' : 'weight-parentheses-inc'"/>
                                </button>
                                <button type="button" name="weight-parentheses-dec" v-tooltip="getLang('increase_weight_subtract_parentheses')"
                                        @click="onIncWeightClick(tag.id, -1)">
                                    <icon-svg :name="useNovelAiWeightSymbol ? 'weight-braces-dec' : 'weight-parentheses-dec'"/>
                                </button>
                                <button type="button" name="weight-brackets-inc" v-tooltip="getLang('decrease_weight_add_brackets')"
                                        @click="onDecWeightClick(tag.id, +1)">
                                    <icon-svg name="weight-brackets-inc"/>
                                </button>
                                <button type="button" name="weight-brackets-dec" v-tooltip="getLang('decrease_weight_subtract_brackets')"
                                        @click="onDecWeightClick(tag.id, -1)">
                                    <icon-svg name="weight-brackets-dec"/>
                                </button>
                                <button type="button" name="wrap"
                                        v-tooltip="getLang('line_break_character')"
                                        @click="onWrapTagClick(tag.id)">
                                    <icon-svg name="wrap"/>
                                </button>
                                <button type="button" name="translate" v-tooltip="getLang('translate_keyword_to_english')"
                                        v-show="!isEnglish"
                                        @click="onTranslateToEnglishClick(tag.id)">
                                    <icon-svg v-if="!loading[tag.id + '_en']" name="english"/>
                                    <icon-svg v-if="loading[tag.id + '_en']" name="loading"/>
                                </button>
                                <button type="button" name="copy" v-tooltip="getLang('copy_to_clipboard')"
                                        @click="copy(tag.value)">
                                    <icon-svg name="copy"/>
                                </button>
                                <button type="button" name="favorite"
                                        v-tooltip="getLang(tag.isFavorite ? 'remove_from_favorite': 'add_to_favorite')"
                                        @click="onFavoriteTagClick(tag.id)">
                                    <icon-svg v-if="tag.isFavorite" name="favorite-yes"/>
                                    <icon-svg v-if="!tag.isFavorite" name="favorite-no"/>
                                </button>
                                <button type="button" name="blacklist"
                                        v-tooltip="getLang('add_blacklist')"
                                        @click="onBlacklistClick(tag.id)">
                                    <icon-svg name="blacklist"/>
                                </button>
                                <button type="button" name="enable"
                                        v-tooltip="getLang(tag.disabled ? 'enable_keyword': 'disable_keyword')"
                                        @click="onDisabledTagClick(tag.id)">
                                    <icon-svg v-if="!tag.disabled" name="disabled"/>
                                    <icon-svg v-if="tag.disabled" name="enable"/>
                                </button>
                            </div>
                        </div>
                        <div class="prompt-local-language"
                             v-show="!isEnglish && (tag.type === 'text' || !tag.type)">
                            <div class="translate-to-local hover-scale-120"
                                 v-tooltip="getLang('translate_keyword_to_local_language')"
                                 @click="onTranslateToLocalClick(tag.id)" @mousedown.stop="" @mousemove.stop=""
                                 @mouseup.stop="">
                                <icon-svg v-if="!loading[tag.id + '_local']" name="translate"/>
                                <icon-svg v-if="loading[tag.id + '_local']" name="loading"/>
                            </div>
                            <div class="local-language">{{ tag.localValue }}</div>
                        </div>
                    </div>
                    <div v-for="(tag, index) in tags" :key="tag.id"
                         :class="['prompt-wrap', tag.type === 'wrap' ? 'wrap-tag' : '']" :data-id="tag.id"
                         ref="promptTagWrap"
                         @mousedown.stop="" @mousemove.stop="" @mouseup.stop=""></div>
                </div>
                <!--<div class="prompt-append">
                    <input type="text" class="scroll-hide svelte-4xt1ch input-tag-append" ref="promptTagAppend"
                           v-model="appendTag" :placeholder="getLang('please_enter_new_keyword')"
                           v-tooltip="getLang('enter_to_add')" @keydown="onAppendTagKeyDown">
                </div>-->
                <div class="drop-select-bg" ref="dropSelectBg"
                     :style="{'display': dropIsStart ? 'block': 'none'}"></div>
                <div class="drop-select-box" ref="dropSelectBox"
                     :style="{'display': dropIsSelecting ? 'block': 'none', top: dropArea.top + 'px', 'left': dropArea.left + 'px', 'width': dropArea.width + 'px', 'height': dropArea.height + 'px'}"></div>
                <div class="drop-select-btns" ref="dropSelectBtns"
                     :style="{'display': dropIsEnd && dropTags.length ? 'flex': 'none', top: (dropEndY - 32) + 'px', 'left': dropEndX + 'px'}"
                     @mousedown.stop="" @mousemove.stop="" @mouseup.stop="">
                    <div class="btns-title">{{ getLang('batch_operation') }}</div>
                    <button type="button" v-tooltip="getLang('copy_to_clipboard')" @click="onDropCopy">
                        <icon-svg name="copy"/>
                    </button>
                    <button type="button" v-tooltip="getLang('add_to_favorite')" @click="onDropFavorite">
                        <icon-svg name="favorite-no"/>
                    </button>
                    <button type="button" v-tooltip="getLang('disable_keyword')" @click="onDropDisable">
                        <icon-svg name="disabled"/>
                    </button>
                    <button type="button" v-tooltip="getLang('enable_keyword')" @click="onDropEnable">
                        <icon-svg name="enable"/>
                    </button>
                    <button type="button" @click="onDropDelete">
                        <icon-svg name="remove"/>
                    </button>
                </div>
            </div>
            <div v-if="groupTagsProcessed.length" :class="['show-group-tags', hideGroupTags ? 'hided': '']" @click="onClickHideGroupTags"
                 v-tooltip="getLang(hideGroupTags ? 'show_group_tags' : 'hide_group_tags')">
                <icon-svg class="hover-scale-120" name="unfold"/>
            </div>
            <Transition name="fade">
                <div class="group-tabs" v-show="!hideGroupTags && groupTagsProcessed.length">
                    <div class="group-header" ref="groupTabsHeader">
                        <div v-for="(item, index) in groupTagsProcessed"
                             :key="index"
                             :class="['group-tab', item.tabKey == groupTagsActive ? 'active' : '']"
                             @click="activeGroupTab(index)"
                             :data-name="item.name">{{ item.name }}</div>
                    </div>
                    <div class="group-body">
                        <div v-for="(item, index) in groupTagsProcessed" :key="index" :class="['group-main', item.tabKey == groupTagsActive ? 'active' : '']">
                            <div class="sub-group-header" v-if="item.tabKey == groupTagsActive">
                                <div v-for="(group, subIndex) in item.groups"
                                     :key="subIndex"
                                     :class="[group.type && group.type === 'wrap' ? 'sub-group-tag-wrap': 'sub-group-tab', group.tabKey == subGroupTagsActive ? 'active' : '']"
                                     @click="activeSubGroupTab(index, subIndex)"
                                     :data-name="group.name">{{ group.name }}</div>
                            </div>
                            <div class="sub-group-body" v-if="item.tabKey == groupTagsActive">
                                <div v-for="(group, subIndex) in item.groups" :key="subIndex" :class="['sub-group-main', group.tabKey == subGroupTagsActive ? 'active' : '']">
                                    <Transition name="fade">
                                        <div class="group-tags" v-if="group.tabKey == subGroupTagsActive">
                                            <div v-if="group.type === 'extraNetworks'" class="group-extra-network"
                                                 v-for="extraData in group.datas" :key="extraData.name"
                                                 @click="onClickGroupTagExtraNetwork(extraData, item, group)"
                                                 @mouseenter="onGroupExtraNetworkMouseEnter($event, extraData.name)"
                                                 @mousemove="onGroupExtraNetworkMouseMove"
                                                 @mouseleave="onGroupExtraNetworkMouseLeave"
                                                 :style="getGroupTagExtraNetworkStyle(extraData)">
                                                <img class="extra-network-preview" :src="extraData.preview || './file=html/card-no-preview.png'" />
                                                <div class="extra-network-name">{{ extraData.name }}</div>
                                                <div class="extra-network-loading" v-if="extraData.loading">
                                                    <icon-svg name="loading"/>
                                                </div>
                                            </div>
                                            <div v-else class="tag-item" ref="groupTagItem" v-for="(local, en) in group.tags"
                                                v-tooltip="getGroupTagTooltip(local, en)"
                                                @click="onClickGroupTag(local, en, item, group)">
                                                <template v-if="local && local != en">
                                                    <div class="tag-local" :style="getGroupTagStyle(item.name, group.name, en)">{{ local }}</div>
                                                    <div class="tag-en">{{ en }}</div>
                                                </template>
                                                <div v-else class="tag-local" :style="getGroupTagStyle(item.name, group.name, en)">{{ en }}</div>
                                            </div>
                                        </div>
                                    </Transition>
                                    <div class="tags-footer" v-if="item.type === 'extraNetworks'">
                                        <div class="tags-size">
                                            <div class="tags-size-item" @click="onClickGroupExtraNetworkRefresh">
                                                <icon-svg v-if="extraNetworksRefreshing" name="loading"/>
                                                <icon-svg v-if="!extraNetworksRefreshing" class="hover-scale-120" name="refresh"/>
                                                <div class="size-title">{{ this.getLang('refresh') }}</div>
                                            </div>
                                            <div class="tags-size-item">
                                                <!--<input class="size-range" type="range" min="10" max="1000" step="1"
                                                       :value="extraNetworksWidth"
                                                       @change="$emit('update:extraNetworksWidth', $event.target.value)"/>-->
                                                <input class="size-number" type="number" min="10" max="1000" step="1"
                                                       :value="extraNetworksWidth"
                                                       @change="$emit('update:extraNetworksWidth', $event.target.value)">
                                                <div class="size-title">{{ this.getLang('width') }}</div>
                                            </div>
                                            <div class="tags-size-item">
                                                <!--<input class="size-range" type="range" min="10" max="1000" step="1"
                                                       :value="extraNetworksHeight"
                                                       @change="$emit('update:extraNetworksHeight', $event.target.value)"/>-->
                                                <input class="size-number" type="number" min="10" max="1000" step="1"
                                                       :value="extraNetworksHeight"
                                                       @change="$emit('update:extraNetworksHeight', $event.target.value)">
                                                <div class="size-title">{{ this.getLang('height') }}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="tags-footer" v-if="item.type !== 'favorite' && item.type !== 'extraNetworks'">
                                        <div class="tags-color">
                                            <div>{{ getLang('tags_color') }}:</div>
                                            <div class="tags-color-picker hover-scale-120"
                                                 v-tooltip="groupTagsColor[getTagsColorKey(item.name, group.name)]"
                                                 unaffected="true">
                                                <color-picker
                                                    :theme="theme == 'dark' ? 'black' : 'white'"
                                                    v-model:pureColor="groupTagsColor[getTagsColorKey(item.name, group.name)]"
                                                    @pureColorChange="onTagsColorChange(getTagsColorKey(item.name, group.name))"
                                                />
                                            </div>
                                            <div class="tags-color-reset hover-scale-120"
                                                 v-tooltip="getLang('reset_default_color')"
                                                 @click="onClickResetTagsColor(getTagsColorKey(item.name, group.name))">
                                                <icon-svg name="reset"/>
                                            </div>
                                            <div class="tags-color-clear hover-scale-120"
                                                 v-tooltip="getLang('clear_color')"
                                                 @click="onClickClearTagsColor(getTagsColorKey(item.name, group.name))">
                                                <icon-svg name="clear"/>
                                            </div>
                                        </div>
                                        <div class="tags-copyright">{{ getLang('tags-copyright') }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
        <highlight-prompt ref="highlightPrompt" :textarea="textarea" :hide-default-input="hideDefaultInput"/>
    </div>
</template>

<script>
import Sortable from "sortablejs"

import common from "@/utils/common"

import LanguageMixin from "@/mixins/languageMixin"
import VueNumberInput from '@/components/vue-number-input.vue'
import HeaderMixin from "@/mixins/phystonPrompt/headerMixin"
import DropMixin from "@/mixins/phystonPrompt/dropMixin"
import TagMixin from "@/mixins/phystonPrompt/tagMixin"
import GroupTagsMixin from "@/mixins/phystonPrompt/groupTagsMixin"
import IconSvg from "@/components/iconSvg.vue"
import HighlightPrompt from "@/components/highlightPrompt.vue"
import {ColorPicker} from "vue3-colorpicker"
import { splitByPeriod } from "@/utils/splitByPeriod"

export default {
    name: 'PhystonPrompt',
    components: {
        HighlightPrompt,
        VueNumberInput,
        IconSvg,
        ColorPicker,
    },
    mixins: [LanguageMixin, HeaderMixin, DropMixin, TagMixin, GroupTagsMixin],
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
        canOneTranslate: {
            type: Boolean,
            default: false,
        },
        autoTranslate: {
            type: Boolean,
            default: false,
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
        autoRemoveLastComma: {
            type: Boolean,
            default: false,
        },
        autoKeepWeightZero: {
            type: Boolean,
            default: false,
        },
        autoKeepWeightOne: {
            type: Boolean,
            default: false,
        },
        autoBreakBeforeWrap: {
            type: Boolean,
            default: false,
        },
        autoBreakAfterWrap: {
            type: Boolean,
            default: false,
        },
        autoRemoveLoraBeforeComma: {
            type: Boolean,
            default: false,
        },
        autoRemoveLoraAfterComma: {
            type: Boolean,
            default: false,
        },
        useNovelAiWeightSymbol: {
            type: Boolean,
            default: false,
        },
        autoRemoveBeforeLineComma: {
            type: Boolean,
            default: false,
        },
        autoSplitByPeriod: {
            type: Boolean,
            default: false,
        },
        autoSplitByPeriodIncludeParen: {
            type: Boolean,
            default: false,
        },
        autoSplitByPeriodSemicolon: {
            type: Boolean,
            default: false,
        },
        autoOptimizeSplitSymbol: {
            type: Boolean,
            default: false,
        },
        allowKeepEmptyLine: {
            type: Boolean,
            default: false,
        },
        hideDefaultInput: {
            type: Boolean,
            default: false,
        },
        autoLoadWebuiPrompt: {
            type: Boolean,
            default: true,
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
        extraNetworks: {
            type: Array,
            default: () => [],
        },
        loras: {
            type: Array,
            default: () => [],
        },
        lycos: {
            type: Array,
            default: () => [],
        },
        embeddings: {
            type: Array,
            default: () => [],
        },
        version: {
            type: String,
            default: '',
        },
        latestVersion: {
            type: String,
            default: '',
        },
        isLatestVersion: {
            type: Boolean,
            default: true,
        },
        theme: {
            type: String,
            default: 'dark',
        },
        groupTags: {
            type: Array,
            default: () => [],
        },
        extraNetworksWidth: {
            type: Number,
            default: 100,
        },
        extraNetworksHeight: {
            type: Number,
            default: 120,
        },
        hideGroupTags: {
            type: Boolean,
            default: false,
        },
        groupTagsColor: {
            type: Object,
            default: () => ({}),
        },
        groupTagsColorKeyCache: {
            type: Object,
            default: () => ({}),
        },
        blacklist: {
            type: Object,
            default: () => ({}),
        },
        cancelBlacklistConfirm: {
            type: Boolean,
            default: false,
        },
        hotkey: {
            type: Object,
            default: () => ({}),
        }
    },
    emits: [
        'update:languageCode',
        'update:autoTranslate',
        'update:autoTranslateToEnglish',
        'update:autoTranslateToLocal',
        'update:autoRemoveSpace',
        'update:autoRemoveLastComma',
        'update:autoKeepWeightZero',
        'update:autoKeepWeightOne',
        'update:hideDefaultInput',
        'update:hidePanel',
        'update:enableTooltip',
        'update:translateApi',
        'click:translateApi',
        'click:promptFormat',
        'click:blacklist',
        'click:hotkey',
        'click:selectTheme',
        'click:switchTheme',
        'click:showAbout',
        'click:selectLanguage',
        'click:showHistory',
        'click:showFavorite',
        'refreshFavorites',
        'click:showChatgpt',
        'update:hideGroupTags',
        'update:groupTagsColor',
        'update:blacklist',
        'showExtraNetworks',
        'hideExtraNetworks',
        'refreshExtraNetworks',
        'update:extraNetworksWidth',
        'update:extraNetworksHeight',
        'update:autoLoadWebuiPrompt',
        'update:autoSplitByPeriod',
        'update:autoSplitByPeriodIncludeParen',
        'update:autoSplitByPeriodSemicolon',
        'update:autoOptimizeSplitSymbol',
        'update:allowKeepEmptyLine',
    ],
    data() {
        return {
            prompt: '',
            counterText: '0/75',
            tags: [],

            sortable: null,
            droping: false,
            loading: {},
            editing: {},
            isEditing: false,
        }
    },
    computed: {
        isEnglish() {
            return this.languageCode === 'en_US'
        },
        translateApiItem() {
            return common.getTranslateApiItem(this.translateApis, this.translateApi)
        },
        /**
         * 行號：與 this.tags 平行的字串陣列，供模板以 data-line 綁定。
         *
         * UI 的「行」由 tags 陣列中的 wrap tag（type === 'wrap'）邏輯分割決定，
         * 與 flex-wrap 造成的視覺換行無關，因此須在此以單次前向遍歷計算。
         *
         * 補零為 3 位（001、002…），由 CSS content: attr(data-line) 直接取用，
         * 基礎樣式不設定 content，故預設不渲染偽元素、零開銷；
         * 顯示與否交由 styles/extensions 以純 CSS 控制。
         *
         * 僅行首 tag 取得行號，其餘為空字串，避免每列重複顯示造成干擾。
         * wrap tag 本身不標記（它是分隔符，不是內容）。
         *
         * @returns {string[]}
         */
        tagLineNumbers() {
            const numbers = []
            let line = 1
            let isFirstInLine = true
            this.tags.forEach((tag, index) => {
                if (typeof tag['type'] === 'string' && tag.type === 'wrap') {
                    /**
                     * wrap 是行邊界。當它是「行首」時代表一個空行
                     * （例如拖曳標籤後留在列首的 wrap），此時應顯示該行行號；
                     * 否則它只是結束一個非空行，行號已顯示在該行首個 tag，
                     * wrap 本身不顯示（維持 ''）。
                     */
                    numbers[index] = isFirstInLine ? String(line).padStart(3, '0') : ''
                    // 結束當前行，供下一行重新計數
                    line++
                    isFirstInLine = true
                    return
                }
                numbers[index] = isFirstInLine ? String(line).padStart(3, '0') : ''
                isFirstInLine = false
            })
            return numbers
        },
    },
    watch: {
        loras: {
            handler() {
                this.tags.forEach((tag) => {
                    this._setTagClass(tag)
                })
            },
            immediate: false,
        },
        lycos: {
            handler() {
                this.tags.forEach((tag) => {
                    this._setTagClass(tag)
                })
            },
            immediate: false,
        },
        embeddings: {
            handler() {
                this.tags.forEach((tag) => {
                    this._setTagClass(tag)
                })
            },
            immediate: false,
        },
    },
    mounted() {
        if (this.$appMode) {
            this.counterText = ''
        }
        this.$nextTick(() => {
            this.initSortable()
            // autoSizeInput(this.$refs.promptTagAppend)
            let times = [1000, 3000, 5000, 10000, 20000, 30000]
            let isBind = false
            times.forEach((time) => {
                if (isBind) return
                setTimeout(() => {
                    // console.log(this.name, '1111111111111111111111')
                    if (isBind) return
                    // console.log(this.name, '3333333333333333333333')
                    if (typeof addAutocompleteToArea !== 'function') return
                    // console.log(this.name, '4444444444444444444444')
                    if (typeof TAC_CFG !== 'object') return
                    // console.log(this.name, '5555555555555555555555')
                    if (!TAC_CFG) return
                    // console.log(this.name, '6666666666666666666666')
                    if (!TAC_CFG['activeIn']) return
                    // console.log(this.name, '7777777777777777777777')
                    isBind = true
                    addAutocompleteToArea(this.$refs.promptTagAppend)
                    // console.log(this.name, '2222222222222222222222')
                }, time)
            })
            this.init()
        })
    },
    methods: {
        init() {
            this.tags = []
            this.onTextareaChange()

            let oldValue = this.textarea.value
            setInterval(() => {
                if (this.autoLoadWebuiPrompt) {
                    let newValue = this.textarea.value
                    if (oldValue === newValue) return
                    // 如果焦点在 textarea 上，就不要触发 onTextareaChange 了
                    if (document.activeElement === this.textarea) return
                    oldValue = newValue
                    this.onTextareaChange(true)
                }
            }, 500)
            // this.textarea.removeEventListener('change', this.onTextareaChange)
            // this.textarea.addEventListener('change', this.onTextareaChange)
            // this.textarea.removeEventListener('blur', this.onTextareaChange)
            // this.textarea.addEventListener('blur', this.onTextareaChange)
        },
        onTextareaChange(event) {
            if (this.onTextareaChangeTimeId) clearTimeout(this.onTextareaChangeTimeId)
            this.onTextareaChangeTimeId = setTimeout(() => {
                this._onTextareaChange(event)
            }, 100)
        },
        _onTextareaChange(event) {
            console.log('onTextareaChange', event)
            const autocompleteParent = this.textarea.parentElement.getElementsByClassName('autocompleteParent')
            if (autocompleteParent.length) {
                if (autocompleteParent[0].style.display !== 'none') return
            } else {
                const autocompleteResults = this.textarea.parentElement.getElementsByClassName('autocompleteResults')
                if (autocompleteResults.length > 0) {
                    if (autocompleteResults[0].style.display !== 'none') return
                }
            }

            let value = this.textarea.value.trim()
            if (value === this.prompt.trim()) return
            let tags = common.splitTags(value, this.autoBreakBeforeWrap, this.autoBreakAfterWrap, {
                allowKeepEmptyLine: this.allowKeepEmptyLine,
            })

            let disabledTags = []
            this.tags.forEach((tag, index) => {
                if (tag.disabled) {
                    disabledTags.push({tag, index})
                }
            })
            disabledTags.forEach(({tag, index}) => {
                // 插入到 tags 中
                tags.splice(index, 0, tag.value)
            })

            let indexes = []
            let oldTags = this.tags
            this.tags = []
            for (let index in tags) {
                let tag = tags[index]
                if (tag === "\n") {
                    this._appendTag("\n", "\n", false, -1, 'wrap')
                } else {
                    // if (tag.indexOf('Negative prompt:') === 0) break
                    let find = false
                    for (let item of oldTags) {
                        if (item.value === tag) {
                            find = item
                            break
                        }
                    }
                    // _restoreTag：建立 tag 並自動還原 localValue/disabled/自訂屬性
                    const index = this._restoreTag(tag, -1, find || null)
                    if (!find && index !== -1) indexes.push(index)
                }
            }
            // autoSplitByPeriod：在 textarea 內容變動、重新解析標籤後，同步分割含 ". " 的標籤
            this.applySplitByPeriod()
            if (this.autoTranslateToLocal && event) {
                // 启动了自动翻译到本地语言，并且用户手动触发的
                let useNetwork = !(this.tagCompleteFile && this.onlyCsvOnAuto)
                useNetwork = false // 浪费网络请求，先关闭网络翻译。
                this.translates(indexes, true, useNetwork).finally(() => {
                    this.updateTags()
                })
            } else {
                this.updateTags()
            }
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
                this.$toastr.success(this.getLang('success'))
            }).catch(() => {
                this.$toastr.error(this.getLang('failed'))
            })
        },
        genPrompt(tags = null, ignoreDisabled = false) {
            tags = tags || this.tags
            let prompts = []
            let tags2 = []
            if (!ignoreDisabled) {
                for (let key in tags) {
                    if (!tags[key].disabled) {
                        tags2.push(tags[key])
                    }
                }
            } else {
                tags2 = tags
            }
            let length = tags2.length
            /**
             * 自動優化分割符號：於單次前向遍歷中累計「該行是否含 # 開頭/結尾 tag」。
             * 遇換行 tag 時重置，使 # 判定均為 O(1)，
             * 避免每遇到換行就回頭掃描整行（多個換行時最壞 O(n²)）。
             */
            let lineHasSharp = false
            tags2.forEach((tag, index) => {
                let prompt = ''
                if (typeof tag['type'] === 'string' && tag.type === 'wrap') {
                    // 換行結束當前行 → 重置行狀態，供下一行重新累計
                    lineHasSharp = false
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

                    if (tag.weightNum > 0 || tag.weightNum < 0) {
                        tag.weightNum = Number(parseFloat(tag.weightNum).toFixed(6))
                        tag.value = tag.value.replace(common.weightNumRegex, '$1:' + tag.weightNum)
                        if (tag.localValue !== '') {
                            tag.localValue = tag.localValue.replace(common.weightNumRegex, '$1:' + tag.weightNum)
                        }
                    }
                    if (tag.disabled && !ignoreDisabled) return

                    /**
                     * 自動優化分割符號：累計當前行的 # 狀態（O(1) 檢查，
                     * 行內已確認含 # 時略過後續 tag 的重複檢查）。
                     * 當前 tag 也屬於該行，必須在下方 nextIsWarp 判定之前更新。
                     */
                    if (this.autoOptimizeSplitSymbol && !lineHasSharp) {
                        const sharpValue = (tag.value || '').trim()
                        if (sharpValue.startsWith('#') || sharpValue.endsWith('#')) {
                            lineHasSharp = true
                        }
                    }

                    let splitSymbol = ',' + (this.autoRemoveSpace ? '' : ' ')
                    let splitSymbolDefault = splitSymbol

                    let nextTag = null
                    let nextIsWarp = false
                    let nextIsBreak = false
                    let nextIsLora = false
                    let nextIsLyco = false
                    // 获取下一个按钮
                    if (index + 1 < length) {
                        nextTag = tags2[index + 1]
                        if (typeof nextTag['type'] === 'string' && nextTag.type === 'wrap') {
                            nextIsWarp = true
                        } else if (nextTag.value === 'BREAK') {
                            nextIsBreak = true
                        } else if (nextTag.isLora) {
                            nextIsLora = true
                        } else if (nextTag.isLyco) {
                            nextIsLyco = true
                        }
                    }

                    /**
                     * 自動優化分割符號（autoOptimizeSplitSymbol）：
                     * 符合下列任一條件時，移除當前 tag 後的逗號（不論其他選項是否啟用）。
                     * 詳細規則見 _shouldRemoveCommaByAutoOptimize()。
                     * 換行情境（下一個為分行）連同空白一併移除，其餘僅移除逗號、保留空白。
                     */
                    if (this.autoOptimizeSplitSymbol && splitSymbol.includes(',')) {
                        if (this._shouldRemoveCommaByAutoOptimize(tag, tags2, index)) {
                            splitSymbol = nextIsWarp ? '' : splitSymbol.replace(/,/g, '')
                        }
                    }

                    if (nextIsWarp) {
                        // 如果下一个是换行

                        if (this.autoRemoveBeforeLineComma) {
                            splitSymbol = ''
                        } else {
                            /**
                             * 自動優化分割符號（autoOptimizeSplitSymbol）：
                             * 換行前符合任一條件時移除逗號。
                             * 在輸出層直接判定，不依賴 autoSplitByPeriod，選項獨立啟用時即生效。
                             * 行內 # 狀態由 forEach 遍歷期間累計，以物件選項傳入（預留未來擴充）。
                             */
                            if (this.autoOptimizeSplitSymbol && this._shouldRemoveCommaBeforeWrap(tag, {lineHasSharp})) {
                                splitSymbol = ''
                            }
                            // sd-webui-regional-prompter
                            const regionals = [' BREAK', ' ADDCOL', ' ADDROW', ' ADDCOMM', ' ADDBASE']
                            for (const regional of regionals) {
                                if (tag.value.endsWith(regional)) {
                                    // 如果是sd-webui-regional-prompter，那么就不需要加逗号
                                    splitSymbol = ''
                                }
                            }
                        }
                    } else if (nextIsBreak) {
                        splitSymbol = ' '
                    } else if ((nextIsLora || nextIsLyco) && this.autoRemoveLoraBeforeComma) {
                        splitSymbol = (this.autoRemoveSpace ? '' : ' ')
                    }

                    if (tag.value === 'BREAK') {
                        if (nextIsWarp) {
                            splitSymbol = ''
                        } else {
                            splitSymbol = ' '
                        }
                    }

                    if (this.autoRemoveLastComma && index + 1 === length) {
                        // 如果是最后一个，那么就不需要加逗號
                        splitSymbol = ''
                    }

                    if (splitSymbol === splitSymbolDefault && (tag.isLora || tag.isLyco) && this.autoRemoveLoraAfterComma) {
                        splitSymbol = (this.autoRemoveSpace ? '' : ' ')
                    }

                    // autoSplitByPeriod：若此 tag 是分割產生的中間段且原始 tag 無逗號，則移除逗號
                    if (this.autoSplitByPeriod && tag.splitNoComma && splitSymbol.includes(',')) {
                        splitSymbol = splitSymbol.replace(/,/g, '')
                    }

                    prompt = tag.value + splitSymbol

                }

                if (prompt) prompts.push(prompt)
            })
            if (prompts.length <= 0) return ''
            // console.log('update tags', prompts)
            return prompts.join('')
        },
        /**
         * 自動優化分割符號（autoOptimizeSplitSymbol）：判斷換行前的逗號是否應被移除。
         *
         * 此方法在 genPrompt() 的輸出層直接判定，不經過 applySplitByPeriod()，
         * 因此不依賴 autoSplitByPeriod，選項成為獨立選項後單獨啟用即會生效。
         *
         * 效能設計：行內 # 判定改由 genPrompt() 的 tags2.forEach 於單次前向遍歷中累計，
         * 以 options 物件傳入，此方法本身為 O(1)，
         * 避免每次遇到換行都回頭掃描整行（多個換行時最壞 O(n²)）。
         *
         * 判定規則（呼叫時當前 tag 必為換行前的最後一個 tag，任一符合即移除）：
         *   1. 當前 tag 以「:」結尾（如前綴式寫法「xxx:」，表示內容尚未結束）
         *   2. 當前 tag 是 Lora / Lyco
         *   3. options.lineHasSharp=true：該行（自上一個換行至當前 tag）任一 tag 以「#」開頭或結尾
         *   4. 當前 tag 以句號結尾（沿用原有的 period + wrap 移除行為）
         *
         * @param {object}  tag               - 當前標籤（換行前的最後一個 tag）
         * @param {object}  [options]         - 擴充選項（以物件傳入，便於未來新增欄位而不更動簽名）
         * @param {boolean} [options.lineHasSharp=false] - 該行是否含 # 開頭/結尾的 tag
         *                                                （由 genPrompt() 於遍歷期間累計，遇換行重置）
         * @returns {boolean} true = 應移除換行前的逗號
         */
        _shouldRemoveCommaBeforeWrap(tag, options = {}) {
            if (!tag) return false
            const {lineHasSharp = false} = options
            const value = (tag.value || '').trim()
            // 規則 1：換行前的 tag 以「:」結尾
            if (value.endsWith(':')) return true
            // 規則 2：換行前的 tag 是 Lora / Lyco
            if (tag.isLora || tag.isLyco) return true
            // 規則 3：該行任一 tag 以「#」開頭或結尾（由呼叫端遍歷期間累計傳入）
            // if (lineHasSharp) return true
            // 規則 4：換行前的 tag 以句號結尾
            return /\.\s*$/.test(tag.value)
        },
        /**
         * 自動優化分割符號（autoOptimizeSplitSymbol）：判斷當前 tag 後的逗號是否應被移除。
         *
         * 與 _shouldRemoveCommaBeforeWrap()（僅處理換行前一個 tag）不同，
         * 此方法涵蓋任意下一個 tag（分行 / BREAK / Lora / 一般 tag），
         * 於 genPrompt() 的輸出層直接判定，不經過 applySplitByPeriod()，
         * 因此不依賴 autoSplitByPeriod，選項獨立啟用時即生效。
         *
         * 判定規則（任一符合即移除逗號）：
         *   1. 當前 tag 是 Lora / Lyco，且下一個 tag 也是 Lora / Lyco
         *      （連續 Lora 間不需要逗號，避免破壞 Lora 語法）
         *   2. 下一個 tag 是 BREAK，或「分行 + BREAK」
         *      （分行可連續多個，略過後取第一個非分行 tag 判定）
         *   3. 當前 tag 以「;」或「}」結尾（表示語法尚未結束），
         *      且下一個 tag 是 分行 或 Lora / Lyco
         *
         * 效能：僅在下一個 tag 為分行時才會向後前瞻，並連續略過分行 tag，
         *       攤還 O(1)，不會因多個分行造成整體 O(n²)。
         *
         * @param {object} tag   - 當前標籤
         * @param {Array}  tags2 - 已過濾（排除 disabled）的標籤陣列，與 genPrompt() 使用同一份
         * @param {number} index - 當前標籤在 tags2 中的索引
         * @returns {boolean} true = 應移除當前 tag 後的逗號
         */
        _shouldRemoveCommaByAutoOptimize(tag, tags2, index) {
            if (!tag) return false
            const isLoraLike = item => !!item && (item.isLora || item.isLyco)
            const isWrap = item => !!item && typeof item['type'] === 'string' && item.type === 'wrap'
            const isBreak = item => !!item && typeof item.value === 'string' && item.value.trim() === 'BREAK'
            const nextTag = index + 1 < tags2.length ? tags2[index + 1] : null
            // 已是最後一個 tag → 由 autoRemoveLastComma 處理，此處不移除
            if (!nextTag) return false

            // 規則 1：當前是 Lora / Lyco，且下一個也是 Lora / Lyco
            if (isLoraLike(tag) && isLoraLike(nextTag)) return true
            // 規則 2-1：下一個 tag 是 BREAK
            if (isBreak(nextTag)) return true
            // 規則 2-2：下一個 tag 是分行，且分行後第一個非分行 tag 是 BREAK
            if (isWrap(nextTag)) {
                let nextIndex = index + 1
                while (nextIndex < tags2.length && isWrap(tags2[nextIndex])) {
                    nextIndex++
                }
                if (isBreak(nextIndex < tags2.length ? tags2[nextIndex] : null)) return true
            }
            // 規則 3：當前 tag 以「;」或「}」結尾，且下一個是 分行 / Lora / Lyco
            if (/[;}:]$/.test((tag.value || '').trim()) && (isWrap(nextTag) || isLoraLike(nextTag))) return true

            return false
        },
        /**
         * 判斷指定 tag 的最後一個逗號是否應被移除（供 applySplitByPeriod 設定 splitNoComma）。
         *
         * 單一事實來源：拆分流程中基於「下一個 tag 類型」決定逗號去留的邏輯
         * 都由此方法集中判定，避免重複散落在各處。
         *
         * 判定規則（需先通過 trigger 檢查）：
         *   1. autoOptimizeSplitSymbol=true 且 tag 以句號結尾 + next 為 wrap / lora → 移除
         *   2. 否則依 autoRemoveBeforeLineComma + nextIsBreak + nextIsLoraOrLyco 綜合判定
         *
         * 註：選項已更名為「自動優化分割符號」並成為獨立選項（不再屬於 autoSplitByPeriod 子選項）。
         *     其新增的分行前條件（「:」結尾 / 該行含 # tag / 分行前為 Lora）
         *     於 genPrompt() 的 _shouldRemoveCommaBeforeWrap() 在輸出層判定，不經過此方法，
         *     因此不依賴 autoSplitByPeriod；此方法僅負責拆分流程的 splitNoComma 標記。
         *
         * @param {object}      tag     - 當前標籤（用於檢查 value 是否以句號結尾）
         * @param {object|null} nextTag - 下一個標籤，由呼叫端負責提供（null 時直接回傳不移除）
         * @param {boolean}     trigger - 是否應執行逗號移除判定（false 時直接回傳不移除）
         *                                if 分支（已觸發分割）：恆為 true（分割正則已保證含句號）
         *                                else 分支（未觸發分割）：為 tag.value 是否以句號結尾的結果
         * @returns {boolean} true = 應移除最後一個逗號
         */
        _shouldRemoveLastComma(tag, nextTag, trigger) {
            // nextTag 無效或 trigger 為 false → 無條件不移除
            if (nextTag === null || !trigger) {
                return;
            }

            const nextIsWrap = nextTag?.type === 'wrap'
            const nextIsBreak = nextTag?.value === 'BREAK'
            const originalHasTrailingPeriod = /\.\s*$/.test(tag.value)
            const nextIsLoraOrLyco = originalHasTrailingPeriod
                && (nextTag?.isLora || nextTag?.isLyco)
                && !this.autoRemoveLoraBeforeComma

            if (this.autoOptimizeSplitSymbol && (originalHasTrailingPeriod && nextIsWrap || nextIsLoraOrLyco)) {
                return true
            }

            return (
                (nextIsWrap && this.autoRemoveBeforeLineComma)
                || nextIsBreak
                || nextIsLoraOrLyco
            )
        },
        /**
         * autoSplitByPeriod：在 tags 陣列層級實際分割標籤。
         *
         * 原因：若僅在 genPrompt() 輸出字串中分割，tags 陣列不會被修改，
         * 導致 UI 顯示的標籤與實際輸出不一致（prompts 已分割但 tag 仍為原始值）。
         * 因此改為直接操作 tags 陣列，在標籤載入或選項變更時觸發分割。
         *
         * 切割規則（stack-based 單次遍歷）：
         *   - 以句號後的空白字元為斷點，句號自動保留在前段末尾
         *   - 巢狀括號防護：stack 追蹤括號配對，僅在所有括號已關閉的位置切割
         *   - 邊界驗證：第一段與最後一段不得為空（排除開頭句號、結尾句號、僅句號空白的情境）
         *   - splitNoComma：中間段永遠不加逗號；最後一段繼承原 tag 的 comma 行為
         *   - else 分支同時負責清除 history 載入時 `_restoreTagProperties` 還原的過期 splitNoComma
         *     （tag.value 已不含句號卻仍帶有 splitNoComma 時，表示 prompt 結構已變動）
         */
        applySplitByPeriod() {
            if (!this.autoSplitByPeriod) return
            let i = 0
            while (i < this.tags.length) {
                let tag = this.tags[i]
                /** 跳過不應分割的標籤：換行、BREAK、Lora、Lyco */
                if (tag?.type === 'wrap' || tag.value === 'BREAK' || tag.isLora || tag.isLyco) {
                    i++
                    continue
                }

                let nextTag = this.tags[i + 1] || null

                /**
                 * 巢狀括號防護：stack-based 單次遍歷，僅在括號已完全關閉的位置切割。
                 * 算法已抽離至 @/utils/splitByPeriod.js，此處直接呼叫。
                 */
                const parts = splitByPeriod(tag.value, {
                    includeParen: this.autoSplitByPeriodIncludeParen,
                    splitSemicolon: this.autoSplitByPeriodSemicolon,
                })

                /** 需滿足：至少有 2 段 + 首段非空 + 末段非空 */
                if (parts.length > 1 && parts[0] !== '' && parts[parts.length - 1] !== '') {
                    let shouldRemoveLastComma = this._shouldRemoveLastComma(tag, nextTag, true)

                    /** 移除舊 tag，轉換新 parts 並直接插入對應位置 */
                    this.tags.splice(i, 1)
                    parts.forEach((part, index) => {
                        this._appendTag(part, '', false, i + index, 'text')
                        /**
                         * 不依賴 _appendTag 回傳值（index>=0 時回傳 index-1，與實際插入位置不符）
                         * 直接使用已知的插入位置 i + index
                         */
                        let tagIndex = i + index
                        let isIntermediate = index < parts.length - 1
                        /**
                         * 中間段：永遠不加逗號（原本是同一個 tag 的一部分）
                         * 最後一段：shouldRemoveLastComma=true 時不加（移除逗號）
                         */
                        if (isIntermediate || shouldRemoveLastComma) {
                            this.tags[tagIndex].splitNoComma = true
                        }
                    })

                    /** 跳過剛才新插入的這些標籤，繼續往後檢查 */
                    i += parts.length
                } else {
                    /** 未觸發分割：僅 tag 以句號結尾時才進入逗號移除判定 */
                    let hasTrailingPeriod = /\.\s*$/.test(tag.value)

                    if (this._shouldRemoveLastComma(tag, nextTag, hasTrailingPeriod)) {
                        tag.splitNoComma = true
                    } else if (!hasTrailingPeriod) {
                        /**
                         * 清除 history 載入時由 _restoreTagProperties 還原的過期 splitNoComma：
                         * 舊 session 中 tag 曾以句號結尾而被標記，但當前 value 已不含句號，
                         * 表示使用者已编辑或 prompt 結構已變動，應移除不再適用的標記
                         */
                        delete tag.splitNoComma
                    }
                    i++
                }
            }
        },
        updatePrompt() {
            let insertWrapIndexes = []
            let length = this.tags.length
            for (let i = 0; i < length; i++) {
                let tag = this.tags[i]
                if (tag.value === 'BREAK') {
                    if (this.autoBreakBeforeWrap) {
                        // 如果是在“BREAK”关键词前面加换行符
                        // 判断上一个是否换行符
                        if (i - 1 >= 0) {
                            let prevTag = this.tags[i - 1]
                            if (typeof prevTag['type'] === 'string' && prevTag.type === 'wrap') {
                                // 上一个已经是换行了
                            } else {
                                insertWrapIndexes.push(i)
                            }
                        }
                    }
                    if (this.autoBreakAfterWrap) {
                        // 如果是在“BREAK”关键词后面加换行符
                        // 判断下一个是否换行符
                        if (i + 1 < length) {
                            let nextTag = this.tags[i + 1]
                            if (typeof nextTag['type'] === 'string' && nextTag.type === 'wrap') {
                                // 下一个已经是换行了
                            } else {
                                insertWrapIndexes.push(i + 1)
                            }
                        }
                    }
                }
            }
            for (let i = 0; i < insertWrapIndexes.length; i++) {
                let index = insertWrapIndexes[i] + i
                this._appendTag("\n", "\n", false, index, 'wrap')
            }
            if (insertWrapIndexes.length) {
                this.updateTags()
                return
            }

            this.prompt = this.genPrompt()
            this.textarea.value = this.prompt
            common.hideCompleteResults(this.textarea)
            if (typeof updateInput === "function") {
                updateInput(this.textarea)
            } else {
                this.textarea.dispatchEvent(new Event('input'))
            }
        },
        updateTags() {
            console.log('tags change', this.tags)
            this.updatePrompt()
            const steps = this.steps.querySelector('input[type="number"]').value
            if (!this.$appMode) {
                this.gradioAPI.tokenCounter(this.textarea.value, steps).then(res => {
                    const {token_count, max_length} = res
                    this.counterText = `${token_count}/${max_length}`
                })
            }
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
            this.$nextTick(() => {
                for (let i = 0; i < this.$refs.promptTagsList.children.length; i++) {
                    let tag = this.$refs.promptTagsList.children[i]
                    if (!tag.classList.contains('prompt-tag')) continue
                    let id = tag.getAttribute('data-id')
                    let lineNo = this.$refs.promptTagLineNo.find(lineNo => {
                        return lineNo.getAttribute('data-id') === id
                    })
                    if (lineNo) tag.parentNode.insertBefore(lineNo, tag)
                    let wrap = this.$refs.promptTagWrap.find(wrap => {
                        return wrap.getAttribute('data-id') === id
                    })
                    if (wrap) tag.parentNode.insertBefore(wrap, tag.nextElementSibling)
                }
            })
        },
        onResize() {
            this.tags.forEach(tag => {
                this._setTagHeight(tag)
            })
        },
        initSortable() {
            this.sortable = Sortable.create(this.$refs.promptTagsList, {
                animation: 150,
                handle: '.prompt-tag-value',
                draggable: ".prompt-tag",
                onEnd: (env) => {
                    if (this.dropTags.length) {
                        let current = env.item
                        let currentId = current.getAttribute('data-id')
                        let dropTags = this._getDropTagsEle()
                        let currentIndex = dropTags.findIndex(tag => {
                            return tag.getAttribute('data-id') === currentId
                        })
                        let beforeTags = dropTags.slice(0, currentIndex)
                        let afterTags = dropTags.slice(currentIndex + 1).reverse()
                        // 移动 dropTags 中的html节点按照原始顺序到current的周围
                        beforeTags.forEach(tag => {
                            common.insertBefore(tag, current)
                        })
                        afterTags.forEach(tag => {
                            common.insertAfter(tag, current)
                        })
                    }

                    this._dropOver()
                    this.droping = false

                    let newIndexes = []
                    let $tags = {}
                    for (let i = 0; i < this.$refs.promptTagsList.children.length; i++) {
                        let tag = this.$refs.promptTagsList.children[i]
                        if (!tag.classList.contains('prompt-tag')) continue
                        let id = tag.getAttribute('data-id')
                        newIndexes.push(id)
                        $tags[id] = tag
                    }
                    this.tags = this.tags.sort((a, b) => {
                        return newIndexes.indexOf(a.id) - newIndexes.indexOf(b.id)
                    })
                    this.$forceUpdate()
                    this.updateTags()

                    /*let oldIndex = env.oldDraggableIndex
                    let newIndex = env.newDraggableIndex
                    if (oldIndex === newIndex) {
                        if (env.oldIndex !== env.newIndex) {
                            // 强制换回去
                            let oldElement = this.$refs.promptTagsList.children[env.oldIndex]
                            let newElement = this.$refs.promptTagsList.children[env.newIndex]
                            common.swapElement(oldElement, newElement)
                            return
                        }
                    }

                    const tags = [...this.tags]
                    tags.splice(newIndex, 0, tags.splice(oldIndex, 1)[0])

                    this.tags = tags
                    this.$forceUpdate()
                    this.updateTags()*/
                },
                onChoose: (env) => {
                    console.log(env)
                    if (this.dropTags.length) {
                        let current = env.item
                        let currentId = current.getAttribute('data-id')
                        let dropTags = this._getDropTagsEle()
                        dropTags.forEach(tag => {
                            if (tag.getAttribute('data-id') === currentId) return
                            tag.style.display = 'block'
                            tag.style.transition = 'transform 0.2s'
                            tag.style.transform = 'scale(0)'
                            setTimeout(() => {
                                tag.style.transition = ''
                                tag.style.transform = ''
                                tag.style.display = 'none'
                            }, 300)
                        })
                    }
                    this.editing = {}
                    this.isEditing = false
                    this.droping = true
                },
                onUnchoose: (env) => {
                    this.droping = null
                    if (this.dropTags.length) {
                        let current = env.item
                        let currentId = current.getAttribute('data-id')
                        let dropTags = this._getDropTagsEle()
                        dropTags.forEach(tag => {
                            if (tag.getAttribute('data-id') === currentId) return
                            tag.style.display = ''
                        })
                    }
                },
                /*onSpill: function (evt) {
                    evt.item // The spilled item
                }*/
                /*multiDrag: true, // Enable the plugin
                selectedClass: "sortable-selected", // Class name for selected item
                multiDragKey: 'SHIFT', // Key that must be down for items to be selected
                avoidImplicitDeselect: false,*/
            })
        },
        useHistory(history) {
            this.tags = []
            history.tags.forEach(item => {
                // _restoreTag：建立 tag 並自動還原 localValue/disabled/自訂屬性
                this._restoreTag(item.value, -1, item)
            })
            // autoSplitByPeriod：歷史紀錄載入後，同步分割含 ". " 的標籤
            this.applySplitByPeriod()
            this.updateTags()
        },
        useFavorite(favorite) {
            this.useHistory(favorite)
        },
        useChatgpt(prompt) {
            let tags = common.splitTags(prompt, this.autoBreakBeforeWrap, this.autoBreakAfterWrap, {
                allowKeepEmptyLine: this.allowKeepEmptyLine,
            })
            this.tags = []
            tags.forEach(tag => {
                this._appendTag(tag, '', false, -1, 'text')
            })
            // autoSplitByPeriod：ChatGPT prompt 載入後，同步分割含 ". " 的標籤
            this.applySplitByPeriod()
            this.updateTags()
        },
        onPromptMainClick() {
            if (this.autoLoadWebuiPrompt) {
                this.onTextareaChange(true)
            }
            this._setTextareaFocus()
            this.showExtendId = ''
        },
        translates(indexes, toLocal = false, useNetwork = true) {
            return new Promise((resolve, reject) => {
                if (this.languageCode === 'en_US' || this.languageCode === 'en_GB') {
                    // 本地语言是英文，不需要翻译
                    resolve()
                    return
                }

                let needTranslateTags = []

                let setLoadings = (tags, loading) => {
                    tags.forEach((tag) => {
                        setLoading(tag, loading)
                    })
                }

                let setLoading = (tag, loading) => {
                    if (this.canOneTranslate) {
                        this.loading[tag.id + '_local'] = loading
                        this.loading[tag.id + '_en'] = loading
                    } else {
                        if (tag.toLocal) {
                            this.loading[tag.id + '_local'] = loading
                        } else {
                            this.loading[tag.id + '_en'] = loading
                        }
                    }
                }

                let setTag = (tag, translateText) => {
                    if (tag.toLocal) {
                        tag.localValue = translateText
                    } else {
                        tag.localValue = tag.value
                        tag.value = translateText
                    }
                    this._setTagById(tag.id, tag.value, tag.localValue)
                }

                let getTranslateText = (tag) => {
                    if (tag.isLora && tag.loraExists) {
                        return this.getExtraNetworkFullName(tag.loraName, 'lora')
                    } else if (tag.isLyco && tag.lycoExists) {
                        return this.getExtraNetworkFullName(tag.lycoName, 'lycoris')
                    } else if (tag.isEmbedding) {
                        return this.getExtraNetworkFullName(tag.value, 'textual inversion')
                    }
                    return tag.value
                }

                // 先过滤掉不需要翻译的标签
                indexes.forEach(index => {
                    let tag = this.tags[index]
                    let translateText = getTranslateText(tag)
                    if (translateText !== tag.value) {
                        tag.localValue = translateText
                        return
                    }
                    if (!common.canTranslate(tag.value)) {
                        // 不需要翻译
                        return
                    }

                    if (tag.isLora) {
                        if (this.blacklist.translate?.includes(tag.loraName.toLowerCase())) return
                    } else if (tag.isLyco) {
                        if (this.blacklist.translate?.includes(tag.lycoName.toLowerCase())) return
                    } else if (tag.isEmbedding) {
                        if (this.blacklist.translate?.includes(tag.embeddingName.toLowerCase())) return
                    } else {
                        if (this.blacklist.translate?.includes(tag.originalValue.toLowerCase())) return
                    }

                    tag.isEnglish = common.isEnglishByLangCode(tag.value, this.languageCode)
                    if (tag.isEnglish === -1) {
                        // 无法检测
                        if (toLocal) {
                            // 翻译到本地语言
                            tag.toLocal = true
                        } else {
                            // 翻译到英文
                            tag.toLocal = false
                        }
                    } else if (tag.isEnglish === 0) {
                        // 不是英文
                        if (toLocal) {
                            // 翻译到本地语言
                            // 不是英文，那么 tag.value 就是本地语言
                            if (tag.localValue === '') {
                                // 如果 localValue 为空，那么需要把 value 翻译到英文
                                tag.localValue = tag.value
                                tag.toLocal = false
                            } else {
                                // 如果 localValue 不为空，那么先把它们交换一下
                                const value = tag.value
                                tag.value = tag.localValue
                                tag.localValue = value
                            }
                        } else {
                            // 翻译到英文
                            tag.toLocal = false
                        }
                    } else {
                        // 是英文
                        tag.toLocal = true
                    }
                    setLoading(tag, true)
                    needTranslateTags.push(tag)
                })

                const translate = (tags) => {
                    if (tags.length <= 0) {
                        setLoadings(tags, false)
                        resolve()
                        return
                    }
                    let groups = {}
                    tags.forEach((tag, index) => {
                        let fromLang = tag.toLocal ? 'en_US' : this.languageCode
                        let toLang = tag.toLocal ? this.languageCode : 'en_US'
                        let groupKey = fromLang + '.' + toLang
                        if (!groups[groupKey]) groups[groupKey] = {fromLang, toLang, tags: []}
                        groups[groupKey].tags.push(tag)
                    })
                    const translateGroup = () => {
                        let group = groups[Object.keys(groups)[0]]
                        if (!group) {
                            resolve()
                            return
                        }
                        let texts = group.tags.map(tag => getTranslateText(tag))
                        this.gradioAPI.translates(texts, group.fromLang, group.toLang, this.translateApi, this.translateApiConfig).then(res => {
                            if (res.success) {
                                let translated_text = res.translated_text
                                translated_text.forEach((translateText, index) => {
                                    // 去除最后的 .
                                    translateText = translateText.replace(/\.$/, '').trim()
                                    if (common.isEnglish(translateText)) {
                                        // 如果首字母是大写，转为小写（全部是大写，不转换）
                                        if (translateText !== translateText.toUpperCase()) {
                                            translateText = translateText.toLowerCase()
                                        }
                                    }

                                    let tag = group.tags[index]
                                    if (translateText !== '') setTag(tag, translateText)
                                    setLoading(tag, false)
                                })
                                delete groups[Object.keys(groups)[0]]
                                translateGroup()
                            } else {
                                // 有一个错误，其它的也不继续了
                                setLoadings(tags, false)
                                this.$toastr.error(res.message)
                                reject(res.message)
                            }
                        }).catch(err => {
                            // 有一个错误，其它的也不继续了
                            setLoadings(tags, false)
                            this.$toastr.error(err.message)
                            reject(err.message)
                        })
                    }
                    translateGroup()
                }

                let translateByCSV = (tags) => {
                    // 开启了使用tagcomplete翻译
                    console.log('translateByCSV', tags.map(tag => tag.value), { useNetwork })
                    let promises = []
                    tags.forEach(tag => {
                        // 是否被括号包裹
                        const splitTag = common.splitTag(tag.value)
                        if (splitTag.value !== tag.value) {
                            tag.value = splitTag.value
                            tag.splits = splitTag
                        }
                        if (tag.toLocal) {
                            // 翻译到本地语言
                            promises.push(this.translateToLocalByCSV(tag.value, void 0, void 0, useNetwork))
                        } else {
                            // 翻译到英文
                            promises.push(this.translateToEnByCSV(tag.value))
                        }
                    })
                    Promise.all(promises).then(results => {
                        let needs = []
                        results.forEach((result, index) => {
                            let tag = tags[index]
                            if (tag.splits) {
                                // 如果被括号包裹，还原
                                tag.value = tag.splits.left + tag.value + tag.splits.right
                            }

                            if (result === '') {
                                needs.push(tag)
                            } else {
                                if (tag.splits) {
                                    result = tag.splits.left + result + tag.splits.right
                                }
                                setLoading(tag, false)
                                setTag(tag, result)
                            }
                        })
                        console.log('No translated keywords: ', needs.map(tag => tag.value))
                        if (useNetwork) {
                            translate(needs)
                        } else {
                            setLoadings(needs, false)
                            resolve()
                        }
                    }).catch(error => {
                        // 有一个错误，就不翻译了
                        setLoadings(tags, false)
                        this.$toastr.error(error)
                        reject(error)
                    })
                }

                let translateByGroupTags = (tags) => {
                    // 开启了使用关键词组翻译
                    console.log('translateByGroupTags', tags.map(tag => tag.value), { useNetwork })
                    let promises = []
                    tags.forEach(tag => {
                        // 是否被括号包裹
                        const splitTag = common.splitTag(tag.value)
                        if (splitTag.value !== tag.value) {
                            tag.value = splitTag.value
                            tag.splits = splitTag
                        }
                        if (tag.toLocal) {
                            // 翻译到本地语言
                            promises.push(this.translateToLocalByGroupTags(tag.value, useNetwork))
                        } else {
                            // 翻译到英文
                            promises.push(this.translateToEnByGroupTags(tag.value, useNetwork))
                        }
                    })
                    Promise.allSettled(promises).then(results => {
                        let errors = []
                        let needs = []
                        results.forEach((result, index) => {
                            let tag = tags[index]
                            if (tag.splits) {
                                // 如果被括号包裹，还原
                                tag.value = tag.splits.left + tag.value + tag.splits.right
                            }

                            if (result.status !== 'fulfilled') {
                              errors.push(result.reason)
                            }

                            if (!result.value?.length || result.status !== 'fulfilled') {
                                needs.push(tag)
                            } else {
                                if (tag.splits) {
                                    result.value = tag.splits.left + result.value + tag.splits.right
                                }
                                setLoading(tag, false)
                                setTag(tag, result.value)
                            }
                        })
                        console.log('No translated keywords: ', needs.map(tag => tag.value))
                        if (this.tagCompleteFile) {
                            // 开启了使用tagcomplete翻译
                            translateByCSV(needs)
                        } else {
                            if (errors.length) {
                              setLoadings(tags, false)
                              this.$toastr.error(errors[0])
                              reject(errors[0])
                              return
                            }
                            if (useNetwork) {
                                translate(needs)
                            } else {
                                setLoadings(needs, false)
                                resolve()
                            }
                        }
                    }).catch(error => {
                        // 有一个错误，就不翻译了
                        setLoadings(tags, false)
                        this.$toastr.error(error)
                        reject(error)
                    })
                }

                if (this.groupTagsTranslate) {
                    translateByGroupTags(needTranslateTags)
                } else if (this.tagCompleteFile) {
                    translateByCSV(needTranslateTags)
                } else {
                    if (useNetwork) {
                        translate(needTranslateTags)
                    } else {
                        setLoadings(needTranslateTags, false)
                        resolve()
                    }
                }
            })
        }
    },
}
</script>
