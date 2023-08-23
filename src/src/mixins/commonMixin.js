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
                        let list = {}
                        extraNetwork.items.forEach(item => {
                            list[item.name.toLowerCase()] = item.name
                        })
                        this.embeddings = list
                    } else if (extraNetwork.name === 'lora' || extraNetwork.name === 'lycoris') {
                        let list = {}
                        extraNetwork.items.forEach(item => {
                            list[item.name.toLowerCase()] = item.name
                            if (item.output_name) {
                                list[item.output_name.toLowerCase()] = item.name
                            }
                        })
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
                const nameLowerCase = name.toLowerCase()
                for (let item of extraNetwork.items) {
                    if (item.name.toLowerCase() === nameLowerCase || item.output_name?.toLowerCase() === nameLowerCase) {
                        if (!item.civitai_info?.name) return name
                        if (item.civitai_info.model?.name && item.civitai_info.model.name !== item.civitai_info.name) {
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
            return this.loras[name.toLowerCase()] ?? false
        },
        lycoExists(name) {
            if (typeof this.lycos !== 'object') return name
            return this.lycos[name.toLowerCase()] ?? false
        },
        embeddingExists(name) {
            if (typeof this.embeddings !== 'object') return name
            return this.embeddings[name.toLowerCase()] ?? false
        },
    }
}
