<template>
    <div class="icon-svg" :style="{width: width + 'px', height: height + 'px'}">
        <svg t="1683017723924" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2069" id="mx_n_1683017723925" :width="width" :height="height" :style="{fill: color}">
            <path d="M450.56 597.12L342.4 489.6l-44.8 44.8 147.84 148.48 342.4-273.92-39.68-49.92-297.6 238.08z" :fill="color" p-id="2070"></path>
            <path d="M512 32A480 480 0 1 0 992 512 480.64 480.64 0 0 0 512 32z m0 896A416 416 0 1 1 928 512 416.64 416.64 0 0 1 512 928z" p-id="2071"></path>
        </svg>
    </div>
</template>
<script>
export default {
    name: 'IconEnable',
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