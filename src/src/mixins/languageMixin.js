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
        }
    },
    data() {
        return {
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
        _translateRes(success, message, text, translated_text, from_lang, to_lang, api, apiConfig) {
            return {
                success,
                message,
                text,
                translated_text,
                from_lang,
                to_lang,
                api,
                api_config: apiConfig
            }
        },
        translate(text, from_lang, to_lang, translateApi = null, translateApiConfig = null) {
            return new Promise(async (resolve, reject) => {
                translateApi = translateApi || this.translateApi
                translateApiConfig = translateApiConfig || this.translateApiConfig || {}
                if (!common.canTranslate(text)) {
                    resolve(this._translateRes(true, '', text, text, from_lang, to_lang, translateApi, translateApiConfig))
                    return
                }

                let translateText = await this.translateByCSV(text, from_lang, to_lang)
                if (translateText) {
                    resolve(this._translateRes(true, '', text, translateText, from_lang, to_lang, translateApi, translateApiConfig))
                    return
                } else if (translateApi === 'csv') {
                    return
                }

                if (translateApi === 'openai') {
                    text = JSON.stringify({text})
                }
                this.gradioAPI.translate(text, from_lang, to_lang, translateApi, translateApiConfig).then(res => {
                    if (res.success) {
                        if (translateApi === 'openai') {
                            let translated_text = res.translated_text
                            // 找到第一个[，截取到最后一个]，然后再转成json
                            const start = translated_text.indexOf('{')
                            const end = translated_text.lastIndexOf('}')
                            translated_text = translated_text.substring(start, end + 1)
                            try {
                                translated_text = JSON.parse(translated_text).text
                                res.translated_text = translated_text
                            } catch (e) {
                                reject(e)
                                return
                            }
                        } else {
                            // 移除末尾的.，因为有些翻译会加上.
                            res.translated_text = res.translated_text.replace(/\.+$/, '')
                            res.translated_text = res.translated_text.trim()
                        }
                        resolve(res)
                    } else {
                        reject(res)
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },
        async translateMulti(texts, from_lang, to_lang, callback, complete = null, translateApi = null, translateApiConfig = null) {
            translateApi = translateApi || this.translateApi
            translateApiConfig = translateApiConfig || this.translateApiConfig || {}
            if (translateApi === 'openai') {
                let needTranslateTexts = []
                for (const index in texts) {
                    const text = texts[index]
                    if (common.canTranslate(text)) {
                        let translateText = this.translateByCSV(text, from_lang, to_lang)
                        if (translateText) {
                            callback(this._translateRes(true, '', text, translateText, from_lang, to_lang, translateApi, translateApiConfig), index)
                        } else {
                            needTranslateTexts.push({
                                "text": text,
                                "index": index
                            })
                        }
                    } else {
                        callback(this._translateRes(true, '', text, text, from_lang, to_lang, translateApi, translateApiConfig), index)
                    }
                }
                if (needTranslateTexts.length === 0) {
                    if (complete) complete()
                    return
                }
                let errors = (message) => {
                    for (const item of needTranslateTexts) {
                        callback(this._translateRes(false, message, item.text, '', from_lang, to_lang, translateApi, translateApiConfig), item.index)
                    }
                }
                this.gradioAPI.translate(JSON.stringify(needTranslateTexts), from_lang, to_lang, translateApi, translateApiConfig).then(res => {
                    if (res.success) {
                        console.log(res.translated_text)
                        let translated_text = res.translated_text
                        const start = translated_text.indexOf('[')
                        const end = translated_text.lastIndexOf(']')
                        translated_text = translated_text.substring(start, end + 1)
                        try {
                            translated_text = JSON.parse(translated_text)
                            for (const index in translated_text) {
                                const item = translated_text[index]
                                callback(this._translateRes(true, '', needTranslateTexts[index].text, item.text, from_lang, to_lang, translateApi, translateApiConfig), item.index)
                            }
                        } catch (e) {
                            errors(e.message)
                        }
                    } else {
                        errors(res.message)
                    }
                    if (complete) complete()
                }).catch(error => {
                    errors(error.message)
                    if (complete) complete()
                })
            } else if (translateApiConfig.concurrent && translateApiConfig.concurrent >= texts.length) {
                let completeCount = texts.length
                const completeFunc = () => {
                    completeCount--
                    if (completeCount === 0) {
                        if (complete) complete()
                    }
                }
                // 如果并发数大于等于需要翻译的文本数，并发翻译
                for (const index in texts) {
                    const text = texts[index]
                    this.translate(text, from_lang, to_lang, translateApi, translateApiConfig).then(res => {
                        callback(res, index)
                        completeFunc()
                    }).catch(error => {
                        callback(this._translateRes(false, error.message, text, '', from_lang, to_lang, translateApi, translateApiConfig), index)
                        completeFunc()
                    })
                }
            } else {
                // 一个个翻译
                for (const index in texts) {
                    const text = texts[index]
                    try {
                        let res = (await this.translate(text, from_lang, to_lang, translateApi, translateApiConfig))
                        callback(res, index)
                    } catch (error) {
                        callback(this._translateRes(false, error.message, text, '', from_lang, to_lang, translateApi, translateApiConfig), index)
                    }
                }
                if (complete) complete()
            }
        },
        getCSV(tagCompleteFile = null, reload = false) {
            window.tagCompleteFileCache = window.tagCompleteFileCache || {}
            return new Promise((resolve, reject) => {
                tagCompleteFile = tagCompleteFile || this.tagCompleteFile
                if (!reload && window.tagCompleteFileCache[tagCompleteFile]) {
                    resolve(window.tagCompleteFileCache[tagCompleteFile])
                    return
                }

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
                        window.tagCompleteFileCache[tagCompleteFile] = data
                        resolve(data)
                        return
                    }
                }

                if (!tagCompleteFile) {
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
                    window.tagCompleteFileCache[tagCompleteFile] = data
                    resolve(data)
                }).catch(error => {
                    if (error.response && error.response.status === 404) {
                        reject(this.getLang('not_found_csv_file'))
                    } else {
                        reject(error.message)
                    }
                })
            })
        },
        translateToLocalByCSV(text, tagCompleteFile = null, reload = false) {
            return new Promise((resolve, reject) => {
                this.getCSV(tagCompleteFile, reload).then(res => {
                    text = text.trim().toLowerCase()
                    if (res.toLocal.has(text)) {
                        resolve(res.toLocal.get(text))
                    }
                    resolve('')
                }).catch(err => {
                    reject(err)
                })
            });
        },
        translateToEnByCSV(text, tagCompleteFile = null, reload = false) {
            return new Promise((resolve, reject) => {
                this.getCSV(tagCompleteFile, reload).then(res => {
                    text = text.trim().toLowerCase()
                    if (res.toEn.has(text)) {
                        resolve(res.toEn.get(text))
                    }
                    resolve('')
                }).catch(err => {
                    reject(err)
                })
            });
        },
        async translateByCSV(text, from_lang, to_lang, tagCompleteFile = null, reload = false) {
            let translateText = ''
            try {
                if (from_lang === this.languageCode && to_lang === 'en_US') {
                    translateText = await this.translateToEnByCSV(text, tagCompleteFile, reload)
                } else if (from_lang === 'en_US' && to_lang === this.languageCode) {
                    translateText = await this.translateToLocalByCSV(text, tagCompleteFile, reload)
                }
            } catch (e) {
                console.log(e)
            }
            if (!translateText) return ''
            return translateText
        },
    }
}