import common from "@/utils/common"
import Papa from 'papaparse'
import globals from "../../globals";
import { slugify } from '@lazy-cjk/zh-slugify';

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
        },
        groupTagsTranslate: {
            type: Boolean,
            default: true
        },
        groupTagsTranslateCache: {
            type: Object,
            default: () => {
                return {
                    toEn: new Map(),
                    toLocal: new Map()
                }
            },
        },
    },
    data() {
        return {
            cancelMultiTranslate: false,
            globals: globals
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
        replaceGlobals(text) {
            return common.replaceGlobals(text, this.languageCode)
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
                    const key = slugify(local, true)
                    !data.toEn.has(key) && data.toEn.set(key, en)
                    data.toEn.set(local, en)
                    // console.log('setData:csv', local, key, en)
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
                    res = Papa.parse(res, {
                        header: false,
                        skipEmptyLines: true,
                    })
                    res.data.forEach(line => {
                        if (line.length < 2) return
                        let en = line[0].trim()
                        let local = line[1].trim()
                        if (en === '' || local === '') return
                        setData(en, local)
                    })

                    /*res = res.replace(/\r/g, '\n')
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
                    })*/
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
            } else {
                // 使用 , 分隔
                const texts = text.split(',').map(t => t.trim())
                let result = []
                texts.forEach(t => {
                    if (res.toLocal.has(t)) {
                        result.push(res.toLocal.get(t))
                    }
                })
                if (result.length > 0) return result.join(', ')
            }
            return ''
        },
        async translateToEnByCSV(text, tagCompleteFile = null, reload = false) {
            let res = await this.getCSV(tagCompleteFile, reload)
            return this._toEn(text, res.toEn)
        },
        async translateToLocalByGroupTags(text) {
            console.log(text)
            text = text.trim().toLowerCase()
            if (this.groupTagsTranslateCache.toLocal.has(text)) {
                let value = this.groupTagsTranslateCache.toLocal.get(text)
                return value.join(' / ')
            } else {
                // 使用 , 分隔
                const texts = text.split(',').map(t => t.trim())
                let result = []
                texts.forEach(t => {
                    if (this.groupTagsTranslateCache.toLocal.has(t)) {
                        let value = this.groupTagsTranslateCache.toLocal.get(t)
                        result.push(value.join(' / '))
                    }
                })
                if (result.length > 0) return result.join(', ')
            }
            return ''
        },
        async translateToEnByGroupTags(text) {
            return this._toEn(text, this.groupTagsTranslateCache.toEn)
        },
        _toEn(text, toEn) {
            text = text.trim().toLowerCase()
            if (toEn.has(text)) {
                return toEn.get(text)
            } else if ((text = slugify(text, true)) && toEn.has(text)) {
                return toEn.get(text)
            }
            return ''
        },
    }
}
