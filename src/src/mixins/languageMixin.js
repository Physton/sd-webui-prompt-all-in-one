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
    },
    data() {
        return {}
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
            return new Promise((resolve, reject) => {
                translateApi = translateApi || this.translateApi
                translateApiConfig = translateApiConfig || this.translateApiConfig || {}
                if (!common.canTranslate(text)) {
                    resolve(this._translateRes(true, '', text, text, from_lang, to_lang, translateApi, translateApiConfig))
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
                        needTranslateTexts.push({
                            "text": text,
                            "index": index
                        })
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
        }
    }
}