<template>
    <div v-if="svgCode" class="icon-svg" :style="{width: width + 'px', height: height + 'px'}" v-html="svgCode"></div>
</template>
<script>
export default {
    name: 'IconSvg',
    props: {
        name: {
            type: String,
            required: true
        },
        width: {
            type: Number,
            default: 16,
        },
        height: {
            type: Number,
            default: 16,
        },
        color: {
            type: String,
            default: '#02b7fd',
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
            this.gradioAPI.theme('default/icons/' + this.name + '.svg').then(res => {
                let parser = new DOMParser()
                let doc = parser.parseFromString(res, 'image/svg+xml')
                let svg = doc.getElementsByTagName('svg')[0]
                svg.setAttribute('width', this.width)
                svg.setAttribute('height', this.height)
                svg.setAttribute('fill', this.color)
                this.svgCode = svg.outerHTML
            })
        }
    }
}
</script>