<template>
    <Transition name="fadeDown">
        <div class="physton-about-prompt" v-if="isOpen" @click="close">
        <div class="about-main" @click.stop>
            <div class="about-close" @click="close">
                <icon-svg name="close"/>
            </div>
            <div class="about-body" @click.stop>
                <p class="body-title"><a :href="globals.github" target="_blank">{{ globals.name }}</a></p>
                <p>
                    <a v-for="(item) in icons" :key="item.title" :href="item.url" target="_blank">
                        <img :src="item.image" :alt="item.title" />
                    </a>
                </p>
                <p v-if="!loading">
                    <span>{{ getLang('version') }}: <a :href="commitUrl(version)" target="_blank">{{ formatVersion(version) }}</a></span>
                    <span class="has-new-version" v-if="!isLatestVersion && latestVersion">&nbsp;&nbsp;&nbsp;&nbsp;({{ getLang('has_new_version') }}: <a :href="commitUrl(latestVersion)" target="_blank">{{ formatVersion(latestVersion) }}</a>)</span>
                </p>
                <p>{{ getLang('wiki_desc') }} <a :href="replaceGlobals('{{docs}}')" target="_blank">Wiki</a></p>
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
    </Transition>
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
            icons: [],
        }
    },
    emits: ['use'],
    computed: {},
    mounted() {
        this.icons = [
            {
                'title': 'GitHub stars',
                'url': this.globals.github + '/stargazers',
                'image': 'https://img.shields.io/github/stars/' + this.globals.name + '?style=flat-square',
            },
            {
                'title': 'GitHub forks',
                'url': this.globals.github + '/network/members',
                'image': 'https://img.shields.io/github/forks/' + this.globals.name + '?style=flat-square',
            },
            {
                'title': 'GitHub issues',
                'url': this.globals.github + '/issues',
                'image': 'https://img.shields.io/github/issues/' + this.globals.name + '?style=flat-square',
            },
            {
                'title': 'GitHub issues closed',
                'url': this.globals.github + '/issues?q=is%3Aissue+is%3Aclosed',
                'image': 'https://img.shields.io/github/issues-closed/' + this.globals.name + '?style=flat-square',
            },
            {
                'title': 'GitHub license',
                'url': this.globals.github + '/blob/master/LICENSE.md',
                'image': 'https://img.shields.io/github/license/' + this.globals.name + '?style=flat-square',
            },
            {
                'title': 'GitHub commits',
                'url': this.globals.github + '/commits/main',
                'image': 'https://img.shields.io/github/last-commit/' + this.globals.name + '?style=flat-square',
            },
        ]
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
            return this.globals.github + '/commit/' + version
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
            text = text.replace(/#(\d+)/g, '<a href="' + this.globals.github + '/issues/$1" target="_blank">#$1</a>')
            return text
        },
    },
}
</script>