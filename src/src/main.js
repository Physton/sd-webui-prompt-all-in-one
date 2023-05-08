import * as Vue from 'vue'
import App from './App.vue'
import toastr from 'toastr'
import VueClipboard from 'vue-clipboard3'
const {toClipboard} = VueClipboard()
import CommonMixin from "@/mixins/commonMixin";

import tippy from "tippy.js";

onUiLoaded(() => {
    const div = document.createElement('div')
    div.id    = 'physton-prompt-all-in-one'
    document.body.appendChild(div)
    const app = Vue.createApp(App)

    app.config.globalProperties.$toastr    = toastr
    app.config.globalProperties.$copyText  = toClipboard
    app.config.globalProperties.$tippyList = []
    app.mixin(CommonMixin)
    app.directive('tooltip', {
        mounted(el, binding) {
            app.config.globalProperties.$tippyList.push(tippy(el, {
                content: binding.value,
                placement: 'bottom',
                theme: 'light',
                allowHTML: true,
                onCreate(instance, partialProps) {
                    const enable = localStorage.getItem('phystonPromptEnableTooltip') === 'true'
                    if (!enable) {
                        instance.disable()
                    }
                },
            }))
        },
    })

    app.mount('#physton-prompt-all-in-one')
})

