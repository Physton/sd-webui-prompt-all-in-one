<template>
    <div class="icon-svg" :style="{width: width + 'px', height: height + 'px'}">
        <svg t="1683529502013" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
             p-id="30771" :width="width" :height="height" :style="{fill: color}">
            <path d="M410.496 768L512 869.504 613.504 768H832a64 64 0 0 0 64-64V192a64 64 0 0 0-64-64H192a64 64 0 0 0-64 64v512a64 64 0 0 0 64 64h218.496zM512 960l-128-128H192a128 128 0 0 1-128-128V192a128 128 0 0 1 128-128h640a128 128 0 0 1 128 128v512a128 128 0 0 1-128 128h-192l-128 128z" p-id="30772"></path>
            <path d="M672 320h-320V256h320v64zM480 640V320h64v320h-64z" p-id="30773"></path>
        </svg>
    </div>
</template>
<script>
export default {
    name: 'IconTooltip',
    props: {
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
}
</script>