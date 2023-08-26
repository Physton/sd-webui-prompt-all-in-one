<template>
    <Transition name="fadeDown">
        <div class="physton-packages-state" v-if="isOpen" @click="close">
        <div class="state-main" @click.stop>
            <div class="state-close" @click="close">
                <icon-svg name="close"/>
            </div>
            <div class="state-body" @click.stop>
                <div class="today-now-show">
                    <label>
                        <input type="checkbox" :value="todayNotShow" @change="onTodayNotShowChange">
                        {{ getLang('today_not_show') }}
                    </label>
                </div>
                <div class="state-body-name">{{ globals.shortName }}</div>
                <div class="state-body-language" @click="$emit('click:selectLanguage', $event)">
                    <icon-svg name="i18n"/>
                    <div>Language: {{ langName }}</div>
                </div>
                <div class="state-body-desc" v-html="getLang('packages_desc')"></div>
                <div class="package-list">
                    <div v-for="(item) in packagesState" :key="item.name" class="package-item">
                        <div class="package-name">{{ item.name }}</div>
                        <div :class="['package-state', item.state ? 'installed' : 'not_install']">{{ getLang(item.state ? 'installed' : 'not_install') }}</div>
                        <div class="package-command">{{ getCommand(item) }}</div>
                    </div>
                </div>
                <div class="btn-packages-install hover-scale-120" @click="onInstallClick">
                    <icon-svg v-if="loading" name="loading"/>
                    <template v-else>{{ getLang('install') }}</template>
                </div>
                <div class="install-result" v-if="showResult">
                    {{ getLang('packages_installing') }}
                    <div class="result-content" v-if="result" ref="result">{{ result }}</div>
                </div>
            </div>
        </div>
    </div>
    </Transition>
</template>
<script>
import LanguageMixin from "@/mixins/languageMixin";
import IconSvg from "@/components/iconSvg.vue";

export default {
    name: 'PackagesState',
    components: {IconSvg},
    mixins: [LanguageMixin],
    props: {
        python: {
            type: String,
            default: './python',
        },
        packagesState: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            todayNotShow: false,
            isOpen: false,
            loading: false,
            showResult: false,
            result: '1112323\nsfsdfsdf\n2222\n3333\n1112323\nsfsdfsdf\n2222\n3333\n1112323\nsfsdfsdf\n2222\n3333',
        }
    },
    emits: [],
    computed: {},
    watch: {
        packagesState: {
            handler() {
                if (!this.isAllInstalled()) {
                    this.open()
                } else {
                    // this.close()
                }
            },
            deep: true,
        },
    },
    mounted() {
    },
    methods: {
        isInstalled(packageName) {
            let installed = false
            for (let item of this.packagesState) {
                if (item.name === packageName) {
                    return item.state
                }
            }
            return false
        },
        isAllInstalled() {
            for (let item of this.packagesState) {
                if (!item.state) {
                    return false
                }
            }
            return true
        },
        getCommand(item) {
            return `${this.python} -m pip install ${item.package}`
        },
        onInstallClick() {
            if (this.loading) return
            this.loading = true
            this.showResult = true
            this.result = ''
            let packages = []
            this.packagesState.forEach((item) => {
                if (!item.state) packages.push(item)
            })
            const complete = (state = false) => {
                this.loading = false
                if (state) {
                    this.result += '\ncomplete!'
                    setTimeout(this.close, 2000)
                }
                this.scrollToBottom()
            }
            const install = () => {
                let item = packages.shift()
                if (!item) return complete(true)
                this.gradioAPI.installPackage(item.name, item.package).then(res => {
                    this.result += `${res.message}\n`
                    if (res.state) {
                        this.scrollToBottom()
                        install()
                    } else {
                        complete(false)
                    }
                }).catch(err => {
                    console.log(err)
                    this.result += `${item.name} install failed\n${err.message}\n`
                    complete(false)
                })
            }
            install()
        },
        scrollToBottom() {
            this.$nextTick(() => {
                this.$refs.result.scrollTop = this.$refs.result.scrollHeight
            })
        },
        onTodayNotShowChange() {
            this.todayNotShow = !this.todayNotShow
            this.gradioAPI.setData('packagesStateTodayNotShow', new Date().toLocaleDateString())
        },
        open() {
            this.gradioAPI.getData('packagesStateTodayNotShow').then(res => {
                if (res && res === new Date().toLocaleDateString()) {
                    this.close()
                } else {
                    this.result = ''
                    this.loading = false
                    this.showResult = false
                    this.isOpen = true
                }
            }).catch(err => {
            })
        },
        close() {
            this.isOpen = false
        },
    },
}
</script>