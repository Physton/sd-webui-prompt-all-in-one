<template>
    <div v-show="svgCode" :class="['icon-svg', 'icon-svg-' + name]" data-name="name" v-html="svgCode"></div>
</template>
<script>
export default {
    name: 'IconSvg',
    props: {
        name: {
            type: String,
            required: true
        },
        svgName: {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            svgCode: ''
        }
    },
    watch: {
        name: {
            handler: function (val, oldVal) {
                this.getSvg()
            },
            immediate: false
        }
    },
    mounted() {
        this.getSvg()
    },
    methods: {
        getSvg() {
            if (!this.name) return
            let name = this.svgName || this.name

            window.loadingSvg = window.loadingSvg || {}
            window.isLoadSvg = window.isLoadSvg || {}

            if (window.isLoadSvg[name]) {
                // 已经加载过了
                this.svgCode = localStorage.getItem('iconSVG-' + name)
                return
            }

            if (localStorage.getItem('iconSVG-' + name)) {
                // 有缓存，先读取缓存的用用
                this.svgCode = localStorage.getItem('iconSVG-' + name)
            }

            if (window.loadingSvg[name]) {
                // 其他组件正在加载
                const interval = setInterval(() => {
                    if (!window.loadingSvg[name]) {
                        // 其他组件加载完成
                        clearInterval(interval)
                        this.svgCode = localStorage.getItem('iconSVG-' + name)
                    }
                }, 10)
                return
            }
            window.loadingSvg[name] = true

            if (!window.iconSvgHash) {
                window.iconSvgHash = new Date().getTime()
            }
            this.gradioAPI.styles('icons/' + name + '.svg', window.iconSvgHash).then(res => {
                this.svgCode = res
                localStorage.setItem('iconSVG-' + name, res)
                window.isLoadSvg[name] = true
                window.loadingSvg[name] = false
            }).catch(err => {
                window.loadingSvg[name] = false
            })
        }
    }
}
</script>