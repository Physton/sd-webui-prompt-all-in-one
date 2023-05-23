import common from "@/utils/common";

export default {
    props: {
        languageCode: {
            type: String,
            default: 'en_US'
        },
        languages: {
            type: Object,
            default: () => {
            },
        },
        translateApis: {
            type: Array,
            default: () => [],
        },
        translateApi: {
            type: String,
            default: '',
        },
        translateApiConfig: {
            type: Object
        },
        tagCompleteFile: {
            type: String,
            default: ''
        },
        onlyCsvOnAuto: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            cancelMultiTranslate: false,
        }
    },
    computed: {
        langName() {
            for (const key in this.languages) {
                const item = this.languages[key]
                if (item.code === this.languageCode) {
                    return item.name
                }
            }
            return item.name
        }
    },
    methods: {
        getLang(key) {
            return common.getLang(key, this.languageCode, this.languages)
        },
        getCSV(tagCompleteFile = null, reload = false) {
            window.tagCompleteFileCache = window.tagCompleteFileCache || {}
            window.tagCompleteFileLoading = window.tagCompleteFileLoading || {}
            return new Promise((resolve, reject) => {
                tagCompleteFile = tagCompleteFile || this.tagCompleteFile
                if (!reload && window.tagCompleteFileCache[tagCompleteFile]) {
                    resolve(window.tagCompleteFileCache[tagCompleteFile])
                    return
                }

                // 判断是否获取csv中
                if (window.tagCompleteFileLoading[tagCompleteFile]) {
                    const timer = setInterval(() => {
                        if (!window.tagCompleteFileLoading[tagCompleteFile]) {
                            clearInterval(timer)
                            resolve(window.tagCompleteFileCache[tagCompleteFile])
                        }
                    }, 100)
                    return
                }
                window.tagCompleteFileLoading[tagCompleteFile] = true

                let data = {toEn: new Map(), toLocal: new Map()}
                let setData = (en, local) => {
                    const texts = [
                        en,
                        en.replace(/\_/g, ' '),
                        en.replace(/\-/g, ' '),
                    ]
                    texts.forEach(t => data.toLocal.set(t, local))
                    data.toEn.set(local, en)
                }

                if (!tagCompleteFile) {
                    if (typeof translations === 'object' && translations instanceof Map) {
                        translations.forEach((local, en) => {
                            setData(en, local)
                        })
                        window.tagCompleteFileLoading[tagCompleteFile] = false
                        window.tagCompleteFileCache[tagCompleteFile] = data
                        resolve(data)
                        return
                    }
                }

                if (!tagCompleteFile) {
                    window.tagCompleteFileLoading[tagCompleteFile] = false
                    window.tagCompleteFileCache[tagCompleteFile] = data
                    reject(this.getLang('not_found_csv_file'))
                    return
                }

                this.gradioAPI.getCSV(tagCompleteFile).then(res => {
                    // 解析csv
                    res = res.replace(/\r/g, '\n')

                    let lines = res.split('\n')
                    lines.forEach(line => {
                        if (line === '') return
                        if (line.trim() === '') return
                        let items = line.split(',')
                        if (items.length < 2) return
                        let en = items[0].trim()
                        let local = items[1].trim()
                        if (en === '' || local === '') return
                        setData(en, local)
                    })
                    window.tagCompleteFileLoading[tagCompleteFile] = false
                    window.tagCompleteFileCache[tagCompleteFile] = data
                    resolve(data)
                }).catch(error => {
                    window.tagCompleteFileLoading[tagCompleteFile] = false
                    window.tagCompleteFileCache[tagCompleteFile] = data
                    if (error.response && error.response.status === 404) {
                        reject(this.getLang('not_found_csv_file'))
                    } else {
                        reject(error.message)
                    }
                })
            })
        },
        async translateToLocalByCSV(text, tagCompleteFile = null, reload = false) {
            let res = await this.getCSV(tagCompleteFile, reload)
            text = text.trim().toLowerCase()
            if (res.toLocal.has(text)) {
                return res.toLocal.get(text)
            }
            return ''
        },
        async translateToEnByCSV(text, tagCompleteFile = null, reload = false) {
            let res = await this.getCSV(tagCompleteFile, reload)
            text = text.trim().toLowerCase()
            if (res.toEn.has(text)) {
                return res.toEn.get(text)
            }
            return ''
        },
    }
}