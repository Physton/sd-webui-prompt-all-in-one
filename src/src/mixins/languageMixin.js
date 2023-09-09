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
        getTagCompleteFileCache(tagCompleteFile = null) {
            return window.tagCompleteFileCache[tagCompleteFile || this.tagCompleteFile]
        },
        getCSV(tagCompleteFile = null, reload = false) {
            window.tagCompleteFileCache ||= {}
            window.tagCompleteFileLoading ||= {}
            return new Promise((resolve, reject) => {
                tagCompleteFile ||= this.tagCompleteFile
                let res = this.getTagCompleteFileCache(tagCompleteFile)
                if (!reload && res) {
                    resolve(res)
                    return
                }

                // 判断是否获取csv中
                if (window.tagCompleteFileLoading[tagCompleteFile]) {
                    const timer = setInterval(() => {
                        if (!window.tagCompleteFileLoading[tagCompleteFile]) {
                            clearInterval(timer)
                            resolve(this.getTagCompleteFileCache(tagCompleteFile))
                        }
                    }, 100)
                    return
                }
                window.tagCompleteFileLoading[tagCompleteFile] = true

                let data = {toEn: new Map(), toLocal: new Map()}
                let slugifyQueue = []
                let handleSlugifyQueue = () => {
                    if (!['zh_CN', 'zh_HK', 'zh_TW'].includes(this.languageCode)) return
                    if (slugifyQueue.length > 0) {
                        let keywords = []
                        slugifyQueue.forEach((item) => {
                            keywords.push(item.local)
                        })
                        this.gradioAPI.slugify(keywords).then(res => {
                            if (!res.result) return
                            slugifyQueue.forEach((item) => {
                                if (res.result[item.local]) {
                                    !data.toEn.has(res.result[item.local]) && data.toEn.set(res.result[item.local], item.en)
                                }
                            })
                            window.tagCompleteFileLoading[tagCompleteFile] = false
                            window.tagCompleteFileCache[tagCompleteFile] = data
                            console.log('Slugify complete: getCSV')
                        })
                    }
                }
                let setData = (en, local) => {
                    const texts = [
                        en,
                        en.replace(/\_/g, ' '),
                        en.replace(/\-/g, ' '),
                    ]
                    texts.forEach(t => data.toLocal.set(t, local))
                    slugifyQueue.push({en, local})
                    // const key = slugify(local, true)
                    // !data.toEn.has(key) && data.toEn.set(key, en)
                    data.toEn.set(local, en)
                    // console.log('setData:csv', local, key, en)
                }

                if (!tagCompleteFile) {
                    if (typeof translations === 'object' && translations instanceof Map) {
                        translations.forEach((local, en) => {
                            setData(en, local)
                        })
                        handleSlugifyQueue()
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
                    handleSlugifyQueue()
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
        /**
         * @returns {string}
         */
        _translateToLocalBy(text, toLocal, useNetwork = false) {
            text = text.trim().toLowerCase()
            let _localToString = value => (value.join?.(' / ') ?? value)
            if (toLocal.has(text)) {
                return _localToString(toLocal.get(text))
            } else {
                // 使用 , 分隔
                const texts = text.split(',').map(t => t.trim())
                let result = []
                let needs = []
                texts.forEach(t => {
                    if (toLocal.has(t)) {
                        result.push(_localToString(toLocal.get(t)))
                    } else if (useNetwork && t.length) {
                        needs.push(t)
                    }
                })
                if (result.length > 0 && !needs.length) return result.join(', ')
            }
            return ''
        },
        async translateToLocalByCSV(text, tagCompleteFile = null, reload = false, useNetwork = false) {
            let res = await this.getCSV(tagCompleteFile, reload)
            return this._translateToLocalBy(text, res.toLocal, useNetwork)
        },
        async translateToEnByCSV(text, tagCompleteFile = null, reload = false) {
            let res = await this.getCSV(tagCompleteFile, reload)
            return this._toEn(text, res.toEn)
        },
        async translateToLocalByGroupTags(text, useNetwork = false) {
            console.log('translateToLocalByGroupTags', text)
            return this._translateToLocalBy(text, this.groupTagsTranslateCache.toLocal, useNetwork)
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
        /**
         * @returns {string}
         */
        _slugifyToLocal(text, en, tagCompleteFile = null) {
            const res = this.getTagCompleteFileCache(tagCompleteFile)
            if (res) {
                en ??= this._toEn(text, res.toEn)
                let value
                if (en.length) {
                    value = this._translateToLocalBy(en, res.toLocal)
                    console.log('slugifyToLocal', { text, en, value })
                    return this._iifText(value, text)
                }
                console.log('slugifyToLocal', { text, en })
            }
            return text
        },
        /**
         * @param newValue string
         * @param oldValue string
         * @returns {string}
         * @private
         */
        _iifText(newValue, oldValue) {
            return newValue?.length ? newValue : oldValue
        }
    }
}
