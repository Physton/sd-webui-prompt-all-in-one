<template>
    <div class="icon-svg" :style="{width: width + 'px', height: height + 'px'}">
        <svg t="1684120692315" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
             p-id="4885" :width="width" :height="height" :style="{fill: color}">
            <path d="M64 64h704v192H64z m-1.28 700.416H960V960H62.72z" p-id="4886"></path>
            <path d="M895.872 64v403.904H320.128v-68.416L191.872 501.504 320.128 608v-72.832h639.744V64z" p-id="4887"></path>
        </svg>
    </div>
</template>
<script>
export default {
    name: 'IconWrap',
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