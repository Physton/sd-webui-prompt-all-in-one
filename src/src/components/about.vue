<template>
    <div class="physton-about-prompt" v-if="isOpen" @click="close">
        <div class="about-main" @click.stop>
            <div class="about-close" @click="close">
                <icon-svg name="close"/>
            </div>
            <div class="about-body" @click.stop>
                <p class="body-title"><a href="https://github.com/Physton/sd-webui-prompt-all-in-one" target="_blank">sd-webui-prompt-all-in-one</a></p>
                <p>
                    <a v-for="(item) in icons" :key="item.title" :href="item.url" target="_blank">
                        <img :src="item.image" :alt="item.title" />
                    </a>
                </p>
                <p v-if="!loading">
                    <span>{{ getLang('version') }}: <a :href="commitUrl(version)" target="_blank">{{ formatVersion(version) }}</a></span>
                    <span class="has-new-version" v-if="!isLatestVersion && latestVersion">&nbsp;&nbsp;&nbsp;&nbsp;({{ getLang('has_new_version') }}: <a :href="commitUrl(latestVersion)" target="_blank">{{ formatVersion(latestVersion) }}</a>)</span>
                </p>
                <p>{{ getLang('wiki_desc') }} <a href="https://aiodoc.physton.com/" target="_blank">Wiki</a></p>
                <div class="version-list">
                    <icon-svg v-if="loading" name="loading"/>
                    <div class="version-item" v-for="(item) in versions" :key="item.version">
                        <div class="item-header">
                            <div class="version-sha"><a :href="commitUrl(item.version)" target="_blank">{{ formatVersion(item.version) }}</a></div>
                            <div class="version-date">{{ item.date }}</div>
                        </div>
                        <div class="version-msg" v-html="message(item.message)"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import LanguageMixin from "@/mixins/languageMixin";
import IconSvg from "@/components/iconSvg.vue";
import common from "@/utils/common";

export default {
    name: 'About',
    components: {IconSvg},
    mixins: [LanguageMixin],
    /*props: {
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
    },*/
    data() {
        return {
            version: '',
            latestVersion: '',
            isLatestVersion: true,

            isOpen: false,
            loading: false,
            versions: [],
            icons: [
                {
                    'title': 'GitHub stars',
                    'url': 'https://github.com/Physton/sd-webui-prompt-all-in-one/stargazers',
                    'image': 'https://img.shields.io/github/stars/Physton/sd-webui-prompt-all-in-one?style=flat-square',
                },
                {
                    'title': 'GitHub forks',
                    'url': 'https://github.com/Physton/sd-webui-prompt-all-in-one/network/members',
                    'image': 'https://img.shields.io/github/forks/Physton/sd-webui-prompt-all-in-one?style=flat-square',
                },
                {
                    'title': 'GitHub issues',
                    'url': 'https://github.com/Physton/sd-webui-prompt-all-in-one/issues',
                    'image': 'https://img.shields.io/github/issues/Physton/sd-webui-prompt-all-in-one?style=flat-square',
                },
                {
                    'title': 'GitHub issues closed',
                    'url': 'https://github.com/Physton/sd-webui-prompt-all-in-one/issues?q=is%3Aissue+is%3Aclosed',
                    'image': 'https://img.shields.io/github/issues-closed/Physton/sd-webui-prompt-all-in-one?style=flat-square',
                },
                {
                    'title': 'GitHub license',
                    'url': 'https://github.com/Physton/sd-webui-prompt-all-in-one/blob/master/LICENSE.md',
                    'image': 'https://img.shields.io/github/license/Physton/sd-webui-prompt-all-in-one?style=flat-square',
                },
                {
                    'title': 'GitHub commits',
                    'url': 'https://github.com/Physton/sd-webui-prompt-all-in-one/commits/main',
                    'image': 'https://img.shields.io/github/last-commit/Physton/sd-webui-prompt-all-in-one?style=flat-square',
                },
            ]
        }
    },
    emits: ['use'],
    computed: {},
    mounted() {
    },
    methods: {
        open() {
            this.isOpen = true
            this.version = ''
            this.latestVersion = ''
            this.isLatestVersion = true
            this.versions = []
            this.loading = true
            this.gradioAPI.getVersion().then(res => {
                this.version = res.version
                this.latestVersion = res.latest_version
                this.isLatestVersion = res.version === res.latest_version
            })
            this.gradioAPI.getRemoteVersions().then(res => {
                this.loading = false
                let versions = []
                res.forEach((item, index) => {
                    if (item.is_update_readme) return
                    item.date = common.formatTime(item.date)
                    versions.push(item)
                })
                this.versions = versions
            }).catch(err => {
                this.loading = false
            })
        },
        close() {
            this.isOpen = false
        },
        commitUrl(version) {
            return 'https://github.com/Physton/sd-webui-prompt-all-in-one/commit/' + version
        },
        formatVersion(version) {
            if (!version) return this.getLang('unknown_version')
            return version.slice(0, 7)
        },
        message(text) {
            text = common.escapeHtml(text)
            text = text.replace(/Former-commit-id: [a-z0-9]{40}/g, '')
            text = text.trim()
            text = text.replace("\n", '<br/>')
            text = text.replace(/#(\d+)/g, '<a href="https://github.com/Physton/sd-webui-prompt-all-in-one/issues/$1" target="_blank">#$1</a>')
            return text
        },
    },
}
</script>