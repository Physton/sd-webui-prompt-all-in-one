<template>
    <div class="icon-svg" :style="{width: width + 'px', height: height + 'px'}">
        <svg t="1684421226814" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
             p-id="3191" :width="width" :height="height" :style="{fill: color}">
            <path
                d="M896 512a384 384 0 1 0-384 384 384 384 0 0 0 384-384z m64 0A448 448 0 1 1 512 64a448 448 0 0 1 448 448z"
                p-id="3192"></path>
            <path
                d="M713.28 425.28a32 32 0 0 1 45.44 45.44l-224 224a32 32 0 0 1-45.44 0l-224-224a32 32 0 0 1 45.44-45.44L512 626.88z"
                p-id="3193"></path>
        </svg>
    </div>
</template>
<script>
export default {
    name: 'IconUnfold',
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