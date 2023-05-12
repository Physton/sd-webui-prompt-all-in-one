<template>
    <div class="physton-prompt-translate-setting" v-if="isOpen">
        <div class="translate-setting-main">
            <div class="setting-line">
                <div class="line-title">{{ getLang('translate_api') }}</div>
                <div class="line-content">
                    <select v-model="apiKey">
                        <optgroup v-for="typeGroup in supportApi" :key="typeGroup.type"
                                  :label="getLang(typeGroup.type)">
                            <option v-for="item in typeGroup.children" :key="item.key" :value="item.key">
                                {{ item.name }}
                            </option>
                        </optgroup>
                    </select>
                </div>
            </div>
            <div class="setting-line" v-if="apiItem && apiItem.type == 'translators'">
                <div class="line-title"></div>
                <div class="line-content">
                    <span style="color: var(--red5)">*{{ getLang('not_api_key_desc') }}</span>
                </div>
            </div>
            <div class="setting-line" v-if="apiItem.help">
                <div class="line-title"></div>
                <div class="line-content">
                    <div v-for="item in apiItem.help" class="help-list">
                        <div class="help-item">[?] <a :href="item.url" target="_blank">{{ item.title }}</a></div>
                    </div>
                </div>
            </div>
            <div class="setting-line" v-for="config in configs">
                <div class="line-title">{{ config.title }}</div>
                <div class="line-content">
                    <input v-if="config.type == 'input'" v-model="config.value">
                    <select v-if="config.type == 'select'" v-model="config.value">
                        <option v-for="option in config.options" :value="option">{{ option }}</option>
                    </select>
                </div>
            </div>
            <div class="setting-line">
                <div class="line-title">{{ getLang('translate_test') }}</div>
                <div class="line-content">
                    <textarea class="test-input" v-model="testText"></textarea>
                </div>
            </div>
            <div class="setting-line">
                <div class="line-title"></div>
                <div class="line-content">
                    <div class="hover-scale-120 test-btn" @click="onTestClick">
                        <icon-loading v-if="loading" width="40" height="40" aria-required="true"/>
                        <block v-else>Test!</block>
                    </div>
                </div>
            </div>
            <div class="setting-line">
                <div class="line-title"></div>
                <div class="line-content">
                    <div class="translate-error" v-if="!translateSuccess && errorMessage">{{ errorMessage }}</div>
                    <textarea class="test-input" v-if="translatedText" v-model="translatedText"></textarea>
                </div>
            </div>
            <div class="setting-btns">
                <div class="translate-save hover-scale-120" @click="onSaveClick">{{ getLang('save') }}</div>
                <div class="translate-close hover-scale-120" @click="onCloseClick">{{ getLang('close') }}</div>
            </div>
        </div>
    </div>
</template>
<script>
import LanguageMixin from "@/mixins/languageMixin";
import IconCopy from "@/components/icons/iconCopy.vue";
import IconLoading from "@/components/icons/iconLoading.vue";
import common from "@/utils/common";

export default {
    name: 'TranslateSetting',
    components: {IconLoading, IconCopy},
    mixins: [LanguageMixin],
    props: {},
    data() {
        return {
            testText: `Hi, this extension is developed by Physton. Welcome to use it!
If you have any suggestions or opinions, please feel free to raise an issue or PR on Github.
If you find this extension helpful, please give me a star on Github!

Developed by: Physton
Github: Physton/sd-webui-prompt-all-in-one`,
            translateSuccess: false,
            errorMessage: '',
            translatedText: '',
            loading: false,
            isOpen: false,
            configs: [],
            apiKey: '',
        }
    },
    computed: {
        apiItem() {
            return common.getTranslateApiItem(this.translateApis, this.apiKey)
        },
        supportApi() {
            if (!this.translateApis || this.translateApis.length <= 0) return []
            let api = JSON.parse(JSON.stringify(this.translateApis))
            api.forEach(group => {
                group.children = group.children.filter(item => item.support[this.languageCode])
            })
            return api
        },
    },
    mounted() {
        this.translateSuccess = false
        this.errorMessage = ''
        this.translatedText = ''
        this.loading = false
    },
    watch: {
        apiKey: {
            handler: function (val, oldVal) {
                this.translateSuccess = false
                this.errorMessage = ''
                this.translatedText = ''
                this.loading = false
                this.configs = []
                this.gradioAPI.getData('translate_api.' + this.apiKey).then(res => {
                    const apiItem = this.apiItem
                    if (apiItem && apiItem.config) {
                        for (const item of this.apiItem.config) {
                            if (res) {
                                item.value = res[item.key] || item.default
                            } else {
                                item.value = item.default || ''
                            }
                            this.configs.push(item)
                        }
                        console.log(this.configs)
                    }
                })
            },
        },
        immediate: true
    },
    methods: {
        open(apiKey) {
            this.apiKey = apiKey
            this.isOpen = true
        },
        onTestClick() {
            if (this.loading) return
            this.translateSuccess = false
            this.errorMessage = ''
            this.translatedText = ''
            this.loading = true
            let configs = {}
            for (const item of this.configs) {
                configs[item.key] = item.value
            }
            this.translate(this.testText, 'en_US', this.languageCode, this.apiKey, configs).then(res => {
                if (!res.success) {
                    this.errorMessage = res.message
                } else {
                    this.translatedText = res.translated_text
                    this.translateSuccess = true
                }
                this.loading = false
            }).catch(err => {
                this.errorMessage = err.message
                this.loading = false
            })
        },
        onSaveClick() {
            this.isOpen = false
            let configs = {}
            for (const item of this.configs) {
                configs[item.key] = item.value
            }
            this.$emit('update:translateApi', this.apiKey)
            this.gradioAPI.setData('translate_api.' + this.apiKey, configs)
        },
        onCloseClick() {
            this.isOpen = false
        }
    },
}
</script>
<style lang="less">
.physton-prompt-translate-setting {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);

  .translate-setting-main {
    width: 700px;
    height: auto;
    padding: 20px;
    margin: 0;
    box-shadow: 0 0 3px 0 #4a54ff;
    border-radius: 6px 6px 4px 4px;
    background-color: rgba(30, 30, 30, .9);
    transition: height .1s ease-in-out, width .1s ease-in-out;
    color: #fff;

    .setting-line {
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      margin-bottom: 10px;

      .line-title {
        font-size: 16px;
        font-weight: bold;
        color: #fff;
        width: 150px;
        line-height: 24px;
      }

      .line-content {
        flex: 1;
        font-size: 14px;
        color: #fff;

        span {
          font-size: 14px;
          color: #fff;
        }

        .api-name {
          display: inline-block;
          background: center center #4A54FF;
          background-image: linear-gradient(315deg, #6772FF 0, #00F9E5 100%);
          background-size: 104% 104%;
          color: #1d1d1d;
          border-radius: 2px;
          padding: 4px;
        }

        input, textarea, select {
          background: rgba(30, 30, 30, .9);
          border: 1px solid #3c3c3c;
          padding: 4px;
          width: 100%;
          font-size: 14px;
          color: #fff;
          resize: none;

          &:focus {
            outline: none;
            border-color: #4A54FF;
          }
        }

        .test-input {
          height: 150px;
        }

        .test-btn {
          cursor: pointer;
          display: inline-block;
          padding: 0 40px;
          height: 40px;
          line-height: 40px;
          color: #fff;
          background: #108bb5;
          border-radius: 4px;
          display: inline-block;
        }

        .translate-error {
          color: #ff4a4a;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .help-list {
          font-size: 14px;
          line-height: 24px;

          .help-item {
            margin-bottom: 10px;

            &:last-child {
              margin-bottom: 0;
            }
            a {
              color: #fff;
               text-decoration: none;
              font-size: 14px;
              border-bottom: 1px solid #fff;
              padding-bottom: 4px;

              &:hover {
                color: #108bb5;
                border-bottom-color: #108bb5;
              }
            }
          }
        }
      }
    }

    .setting-btns {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-top: 10px;

      .translate-save {
        cursor: pointer;
        display: inline-block;
        padding: 0 40px;
        height: 40px;
        line-height: 40px;
        color: #fff;
        background: center center #4A54FF;
        background-image: linear-gradient(315deg, #6772FF 0, #00F9E5 100%);
        background-size: 104% 104%;
        border-radius: 4px;
        display: inline-block;
        margin-right: 10px;
      }

      .translate-close {
        cursor: pointer;
        display: inline-block;
        padding: 0 40px;
        height: 40px;
        line-height: 40px;
        color: #4A54FF;
        background: transparent;
        border: 1px solid #4A54FF;
        border-radius: 4px;
        display: inline-block;
      }
    }
  }
}
</style>