<template>
    <div class="icon-svg" :style="{width: width + 'px', height: height + 'px'}">
        <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24" :style="{fill: color}">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
    </div>
</template>
<script>
export default {
    name: 'IconClose',
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
            default: '#000',
        },
    },
}
</script>