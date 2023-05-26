import common from "@/utils/common";
import GradioAPI from "@/utils/gradioAPI";

export default {
    data() {
        return {
            /**
             * @type {GradioAPI}
             */
            gradioAPI: null,
        }
    },
    beforeMount() {
        this.gradioAPI = new GradioAPI()
    },
    methods: {
        loadExtraNetworks() {
            this.gradioAPI.getExtraNetworks().then(res => {
                if (!res) return
                this.extraNetworks = res
                res.forEach(extraNetwork => {
                    if (extraNetwork.name === 'textual inversion') {
                        let list = []
                        extraNetwork.items.forEach(item => {
                            list.push(item.name)
                        })
                        this.embeddings = list
                    } else if (extraNetwork.name === 'lora' || extraNetwork.name === 'lycoris') {
                        let list = []
                        extraNetwork.items.forEach(item => {
                            list.push(item.name)
                            if (item.output_name) {
                                list.push(item.output_name)
                            }
                        })
                        list = [...new Set(list)]
                        if (extraNetwork.name === 'lora') {
                            this.loras = list
                        } else {
                            this.lycos = list
                        }
                    }
                })
            })
        },
        getExtraNetworkFullName(name, type = 'lora') {
            if (typeof this.extraNetworks !== 'object') return name
            for (let extraNetwork of this.extraNetworks) {
                if (extraNetwork.name !== type) continue
                for (let item of extraNetwork.items) {
                    if (item.name === name || item.output_name === name) {
                        if (!item.civitai_info || !item.civitai_info.name) return name
                        if (item.civitai_info.model && item.civitai_info.model.name && item.civitai_info.model.name !== item.civitai_info.name) {
                            return '[' + item.civitai_info.name + '] ' + item.civitai_info.model.name
                        } else {
                            return item.civitai_info.name
                        }
                    }
                }
            }
            return name
        },
        loraExists(name) {
            if (typeof this.loras !== 'object') return name
            for (let key in this.loras) {
                if (this.loras[key] === name) {
                    return this.loras[key]
                }
            }
            return false
        },
        lycoExists(name) {
            if (typeof this.lycos !== 'object') return name
            for (let key in this.lycos) {
                if (this.lycos[key] === name) {
                    return this.lycos[key]
                }
            }
            return false
        },
        embeddingExists(name) {
            if (typeof this.embeddings !== 'object') return name
            for (let key in this.embeddings) {
                if (this.embeddings[key] === name) {
                    return this.embeddings[key]
                }
            }
            return false
        },
    }
}