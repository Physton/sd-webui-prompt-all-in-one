<template>
    <div class="icon-svg" :style="{width: width + 'px', height: height + 'px'}">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
             style="margin: auto; background: transparent; display: block; shape-rendering: auto; animation-play-state: running; animation-delay: 0s;" :width="width" :height="height" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
            <circle cx="50" cy="50" r="0" fill="none" stroke="#e90c59" stroke-width="2"
                    style="animation-play-state: running; animation-delay: 0s;">
                <animate attributeName="r" repeatCount="indefinite" dur="1s" values="0;50" keyTimes="0;1"
                         keySplines="0 0.2 0.8 1" calcMode="spline" begin="0s"
                         style="animation-play-state: running; animation-delay: 0s;"></animate>
                <animate attributeName="opacity" repeatCount="indefinite" dur="1s" values="1;0" keyTimes="0;1"
                         keySplines="0.2 0 0.8 1" calcMode="spline" begin="0s"
                         style="animation-play-state: running; animation-delay: 0s;"></animate>
            </circle>
            <circle cx="50" cy="50" r="0" fill="none" stroke="#46dff0" stroke-width="2"
                    style="animation-play-state: running; animation-delay: 0s;">
                <animate attributeName="r" repeatCount="indefinite" dur="1s" values="0;50" keyTimes="0;1"
                         keySplines="0 0.2 0.8 1" calcMode="spline" begin="-0.5s"
                         style="animation-play-state: running; animation-delay: 0s;"></animate>
                <animate attributeName="opacity" repeatCount="indefinite" dur="1s" values="1;0" keyTimes="0;1"
                         keySplines="0.2 0 0.8 1" calcMode="spline" begin="-0.5s"
                         style="animation-play-state: running; animation-delay: 0s;"></animate>
            </circle>
        </svg>
    </div>
</template>
<script>
export default {
    name: 'IconLoading',
    props: {
        width: {
            type: Number,
            default: 16,
        },
        height: {
            type: Number,
            default: 16,
        }
    },
}
</script>
<style>
.lds-ripple {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
}

.lds-ripple div {
    position: absolute;
    border: 4px solid #fff;
    opacity: 1;
    border-radius: 50%;
    animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

.lds-ripple div:nth-child(2) {
    animation-delay: -0.5s;
}

@keyframes lds-ripple {
    0% {
        top: 36px;
        left: 36px;
        width: 0;
        height: 0;
        opacity: 0;
    }
    4.9% {
        top: 36px;
        left: 36px;
        width: 0;
        height: 0;
        opacity: 0;
    }
    5% {
        top: 36px;
        left: 36px;
        width: 0;
        height: 0;
        opacity: 1;
    }
    100% {
        top: 0px;
        left: 0px;
        width: 72px;
        height: 72px;
        opacity: 0;
    }
}
</style>