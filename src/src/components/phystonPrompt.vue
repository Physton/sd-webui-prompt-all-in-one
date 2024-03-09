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
    emits: ['update:languageCode', 'update:autoTranslate', 'update:autoTranslateToEnglish', 'update:autoTranslateToLocal', 'update:autoRemoveSpace', 'update:autoRemoveLastComma', 'update:autoKeepWeightZero', 'update:autoKeepWeightOne', 'update:hideDefaultInput', 'update:hidePanel', 'update:enableTooltip', 'update:translateApi', 'click:translateApi', 'click:promptFormat', 'click:blacklist', 'click:hotkey', 'click:selectTheme', 'click:switchTheme', 'click:showAbout', 'click:selectLanguage', 'click:showHistory', 'click:showFavorite', 'refreshFavorites', 'click:showChatgpt', 'update:hideGroupTags', 'update:groupTagsColor', 'update:blacklist', 'showExtraNetworks', 'hideExtraNetworks', 'refreshExtraNetworks', 'update:extraNetworksWidth', 'update:extraNetworksHeight', 'update:autoLoadWebuiPrompt'],
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
            let tags = common.splitTags(value, this.autoBreakBeforeWrap, this.autoBreakAfterWrap)

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
                    const localValue = find ? find.localValue : ''
                    const disabled = find ? find.disabled : false
                    const index = this._appendTag(tag, localValue, disabled, -1, 'text')
                    if (!find && index !== -1) indexes.push(index)
                }
            }
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
            tags2.forEach((tag, index) => {
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

                    if (tag.weightNum > 0 || tag.weightNum < 0) {
                        tag.weightNum = Number(parseFloat(tag.weightNum).toFixed(6))
                        tag.value = tag.value.replace(common.weightNumRegex, '$1:' + tag.weightNum)
                        if (tag.localValue !== '') {
                            tag.localValue = tag.localValue.replace(common.weightNumRegex, '$1:' + tag.weightNum)
                        }
                    }
                    if (tag.disabled && !ignoreDisabled) return

                    let splitSymbol = ',' + (this.autoRemoveSpace ? '' : ' ')
                    let splitSymbolDefault = splitSymbol

                    let nextTag = null
                    let nextIsWarp = false
                    let nextIsBreak = false
                    let nextIsLora = false
                    let nextIsLyco = false
                    // 获取下一个按钮
                    if (index + 1 < length) {
                        nextTag = tags[index + 1]
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

                    if (nextIsWarp) {
                        // 如果下一个是换行

                        if (this.autoRemoveBeforeLineComma) {
                            splitSymbol = ''
                        } else {
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
                        // 如果是最后一个，那么就不需要加逗号
                        splitSymbol = ''
                    }

                    if (splitSymbol === splitSymbolDefault && (tag.isLora || tag.isLyco) && this.autoRemoveLoraAfterComma) {
                        splitSymbol = (this.autoRemoveSpace ? '' : ' ')
                    }

                    prompt = tag.value + splitSymbol
                }

                if (prompt) prompts.push(prompt)
            })
            if (prompts.length <= 0) return ''
            // console.log('update tags', prompts)
            return prompts.join('')
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
                this._appendTag(item.value, item.localValue, item.disabled, -1, item.type || 'text')
            })
            this.updateTags()
        },
        useFavorite(favorite) {
            this.useHistory(favorite)
        },
        useChatgpt(prompt) {
            let tags = common.splitTags(prompt, this.autoBreakBeforeWrap, this.autoBreakAfterWrap)
            this.tags = []
            tags.forEach(tag => {
                this._appendTag(tag, '', false, -1, 'text')
            })
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
