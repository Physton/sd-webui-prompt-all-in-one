import splitTags from "@/utils/splitTags";

export default {
    loraRegex: /^\<lora:\s*([^\:]+)\s*(:)?\s*([0-9\.]+)?\>$/,
    lycoRegex: /^\<lyco:\s*([^\:]+)\s*(:)?\s*([0-9\.]+)?\>$/,
    weightNumRegex: /(.*):([0-9\.]+)/,
    weightNumRegexEN: /(.*):\s*([0-9\.]+)/,
    weightNumRegexCN: /(.*)：\s*([0-9\.]+)/,
    bracketsEN: [
        {'(': '(', ')': ')'},
        {'[': '[', ']': ']'},
        {'{': '{', '}': '}'},
        {'<': '<', '>': '>'},
    ],
    bracketsCN: [
        {'（': '(', '）': ')'},
        {'【': '[', '】': ']'},
        {'《': '<', '》': '>'},
        {'「': '{', '」': '}'},
        {'『': '{', '』': '}'},
        {'〈': '<', '〉': '>'},
        {'﹝': '(', '﹞': ')'},
        {'﹛': '{', '﹜': '}'},
        {'﹙': '(', '﹚': ')'},
    ],

    /**
     * 替换标签
     * @param text {string}
     * @returns {*|string}
     */
    replaceTag(text) {
        if (typeof text !== "string") return text
        if (text === "") return text
        text = this.replaceBrackets(text)
        if (this.weightNumRegexEN.test(text)) text = text.replace(this.weightNumRegexEN, '$1:$2')
        if (this.weightNumRegexCN.test(text)) text = text.replace(this.weightNumRegexCN, '$1:$2')
        return text
    },

    /**
     * 替换括号
     * @param text
     * @returns {*}
     */
    replaceBrackets(text) {
        const length = text.length
        if (length === 0) return text
        let replaces = {}
        this.bracketsCN.forEach(item => {
            for (const key in item) {
                replaces[key] = item[key]
            }
        })

        let start = text[0]
        let end = text[length - 1]
        if (typeof replaces[start] !== "undefined") {
            text = replaces[start] + text.substring(1)
        }
        if (typeof replaces[end] !== "undefined") {
            text = text.substring(0, length - 1) + replaces[end]
        }
        return text
    },

    /**
     * 是否有括号
     * @param text {string}
     * @returns {Array|boolean}
     */
    hasBrackets(text) {
        const length = text.length
        if (length === 0) return false
        let brackets = []
        this.bracketsEN.forEach(item => {
            let temp = []
            for (const key in item) {
                temp.push(key)
            }
            brackets.push(temp)
        })
        this.bracketsCN.forEach(item => {
            let temp = []
            for (const key in item) {
                temp.push(key)
            }
            brackets.push(temp)
        })

        let start = text[0]
        let end = text[length - 1]
        for (const bracket of brackets) {
            if (bracket[0] === start && bracket[1] === end) {
                return bracket
            }
        }
        return false
    },

    /**
     * 拆分标签
     * @param tag {string}
     * @returns {{left: string, right: string, value: string}}
     */
    splitTag(tag) {
        let result = {left: '', value: '', right: ''}
        let match = tag.match(/^([\(\<\{\[]+)(.*)$/)
        if (!match) {
            // 没有匹配到左括号
            result.value = tag
            return result
        }
        result.left = match[1]
        tag = match[2]
        match = tag.match(/((\:[0-9\.]+)?[\)\>\}\]]+)$/)
        if (!match) {
            // 没有匹配到右括号
            result.value = tag
            return result
        }
        result.right = match[1]
        tag = tag.substring(0, tag.length - result.right.length)
        result.value = tag
        return result
    },

    /**
     * 分割标签
     * @param tags {string}
     * @returns {string[]}
     */
    splitTags(tags) {
        return splitTags(tags)
    },

    /**
     * 是否可以翻译
     * @param text {string}
     * @returns {boolean}
     */
    canTranslate(text) {
        // 如果为空，不翻译
        if (text.trim() === '') return false
        // 如果<>包裹，不翻译
        if (text[0] === '<' && text[text.length - 1] === '>') return false
        // 如果是数字、标点符号，不翻译
        const regex = /^[0-9`~!@#$%^&*()_+\-=\[\]{}\\|;:'",.\/<>?]+$/
        if (regex.test(text)) return false
        // 如果是单个英文字母，不翻译
        if (/^[a-zA-Z]$/.test(text)) return false
        return true
    },

    /**
     * 判断是否是英文
     * @param text {string}
     * @returns {boolean}
     */
    isEnglish(text) {
        const length = text.length
        if (text[0] === '<' && text[length - 1] === '>') {
            return true
        }
        // 通过ascii码判断
        for (let i = 0; i < length; i++) {
            if (text.charCodeAt(i) > 127) {
                return false
            }
        }
        return true
    },

    canOneTranslate(languageCode) {
        const detections = ['zh_CN', 'zh_HK', 'zh_TW', 'ar_SA', 'ja_JP', 'ko_KR', 'ru_RU']
        detections.push('am_ET', 'hy_AM', 'as_IN', 'bn_BD', 'ba_RU', 'bg_BG', 'prs_AF', 'dv_MV', 'el_GR', 'gu_IN', 'he_IL', 'hi_IN', 'iu_CA', 'kn_IN', 'kk_KZ', 'km_KH', 'ku_Arab_IQ', 'ky_KG', 'lo_LA', 'mk_MK', 'ml_IN', 'mr_IN', 'mn_Cyrl_MN', 'mn_Mong_CN', 'my_MM', 'ne_NP', 'or_IN', 'ps_AF', 'fa_IR', 'pa_Guru_IN', 'sr_Cyrl_RS', 'ta_IN', 'tt_Latn_RU', 'te_IN', 'th_TH', 'bo_CN', 'ti_ET', 'uk_UA', 'ur_PK', 'ug_Arab_CN', 'vi_VN')
        if (!detections.includes(languageCode)) return false // 无法检测是否英文
        return true
    },

    /**
     * 检测是否英文
     * @param text {string}
     * @param languageCode {string}
     * @returns {number} 0: 不是英文，1: 是英文，2: 未知
     */
    isEnglishByLangCode(text, languageCode) {
        if (!this.canOneTranslate(languageCode)) return -1 // 无法检测是否英文

        const length = text.length
        // 通过ascii码判断
        for (let i = 0; i < length; i++) {
            if (text.charCodeAt(i) > 127) {
                // 不是英文
                return 0
            }
        }
        return 1
    },

    /**
     * 获取语言
     * @param key {string}
     * @param languageCode {string}
     * @param languages {object}
     * @returns {string}
     */
    getLang(key, languageCode, languages) {
        if (languages[languageCode] && languages[languageCode].lang && languages[languageCode].lang[key]) {
            return languages[languageCode].lang[key]
        } else if (languages['en_US'] && languages['en_US'].lang && languages['en_US'].lang[key]) {
            return languages['en_US'].lang[key]
        } else {
            return key
        }
    },

    /**
     * 实体化html
     * @param str {string}
     * @returns {string}
     */
    escapeHtml(str) {
        return str.replace(/[&<>'"]/g, tag => {
            const chars = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;',
            }
            return chars[tag] || tag
        })
    },

    /**
     * 反实体化html
     * @param str {string}
     * @returns {string}
     */
    unescapeHtml(str) {
        return str.replace(/&amp;|&lt;|&gt;|&#39;|&quot;/g, tag => {
            const chars = {
                '&amp;': '&',
                '&lt;': '<',
                '&gt;': '>',
                '&#39;': "'",
                '&quot;': '"',
            }
            return chars[tag] || tag
        })
    },

    /**
     * 获取标签的权重数
     * @param tag {string}
     * @returns {number}
     */
    getTagWeightNum(tag) {
        const match = tag.match(this.weightNumRegex)
        let weightNum = match ? parseFloat(match[2]) : 0
        weightNum = weightNum >= 0 ? weightNum : 0
        return weightNum
    },

    /**
     * 获取标签的加权数
     * @param tag {string}
     * @returns {number}
     */
    getTagIncWeight(tag) {
        return this.countLayers(tag, '(', ')')
    },

    /**
     * 获取标签的减权数
     * @param tag {string}
     * @returns {number}
     */
    getTagDecWeight(tag) {
        return this.countLayers(tag, '[', ']')
    },

    /**
     * 计算字符串包裹的层数
     * @param str {string}
     * @param start {string}
     * @param end {string}
     * @returns {number}
     */
    countLayers(str, start = '(', end = ')') {
        let count = 0
        if (str.length < 2) return count // 长度小于2，不可能有会有包裹
        while (true) {
            // 取出第一个和最后一个字符
            let first = str[0]
            let last = str[str.length - 1]
            if (first === start && last === end) {
                // 如果第一个和最后一个字符是括号，且是对应的括号，那么层数加1，然后去掉第一个和最后一个字符
                count++
                // 去掉第一个和最后一个字符
                str = str.slice(1, str.length - 1)
            } else {
                break
            }
        }
        return count
    },

    /**
     * 设置字符串的包裹
     * @param str {string}
     * @param num {number}
     * @param start {string}
     * @param end {string}
     * @param joinStr {string}
     * @returns {string}
     */
    setLayers(str, num = 0, start = '(', end = ')', joinStr = '') {
        // 先去除所有的括号
        while (true) {
            let first = str[0]
            let last = str[str.length - 1]
            if (first === start && last === end) {
                // 如果第一个和最后一个字符是括号，且是对应的括号，那么层数加1，然后去掉第一个和最后一个字符
                // 去掉第一个和最后一个字符
                str = str.slice(1, str.length - 1)
            } else {
                break
            }
        }
        // 如果层数为0，那么直接返回
        if (num === 0) return str
        // 如果层数大于0，那么在字符串的前面加上num个start，后面加上num个end
        return start.repeat(num) + str + joinStr + end.repeat(num)
    },

    /**
     * 获取翻译api信息
     * @param key {string}
     * @param api {object}
     * @returns {boolean}
     */
    getTranslateApiInfo(key, api) {
        let find = false
        for (const group in api) {
            for (const item in group.children) {
                if (item.key === key) {
                    find = item
                    break
                }
            }
        }
        return find
    },

    /**
     * 判断标签是否相等
     * @param tags1 {Array}
     * @param tags2 {Array}
     * @param ignores {Array}
     * @returns {boolean}
     */
    isEqualTags(tags1, tags2, ignores = []) {
        if (tags2.length !== tags1.length) return false
        for (let i = 0; i < tags1.length; i++) {
            for (let key in tags1[i]) {
                if (ignores.includes(key)) continue
                if (tags2[i][key] !== tags1[i][key]) return false
            }
            for (let key in tags2[i]) {
                if (ignores.includes(key)) continue
                if (tags2[i][key] !== tags1[i][key]) return false
            }
        }
        return true
    },

    /**
     * 获取翻译api的item
     * @param translateApis {Array}
     * @param translateApi {string}
     * @returns {{}|*}
     */
    getTranslateApiItem(translateApis, translateApi) {
        if (!translateApis || translateApis.length <= 0) return {}
        for (let group of translateApis) {
            for (let item of group.children) {
                if (item.key === translateApi) {
                    return item
                }
            }
        }
        // 如果没有找到，那么返回第一个
        return translateApis[0].children[0]
    },

    /**
     * 隐藏 a1111-sd-webui-tagcomplete 面板
     * @param textarea
     */
    hideCompleteResults(textarea) {
        if (typeof hideResults === 'function') {
            const times = [100, 200, 300, 500, 1000]
            times.forEach(time => {
                setTimeout(() => {
                    hideResults(textarea)
                }, time)
            })
        }
    },

    /**
     * 获取当前时间
     * @param time {number}
     * @returns {string}
     */
    formatTime(time, hasYear = true) {
        let now = new Date(time * 1000);
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        if (month < 10) month = "0" + month;
        let day = now.getDate();
        if (day < 10) day = "0" + day;
        let hour = now.getHours();
        if (hour < 10) hour = "0" + hour;
        let minute = now.getMinutes();
        if (minute < 10) minute = "0" + minute;
        let second = now.getSeconds();
        if (second < 10) second = "0" + second;
        if (hasYear) {
            return `${year}/${month}/${day} ${hour}:${minute}:${second}`
        } else {
            return `${month}/${day} ${hour}:${minute}:${second}`
        }
    },

    /**
     * 获取api url
     * @returns {string}
     */
    apiUrl() {
        let url
        if (typeof gradioURL === "string" && gradioURL !== "") {
            url = new URL(gradioURL)
            url = url.origin
        } else {
            url = window.location.origin
        }
        return url + '/physton_prompt/'
    },

    /**
     * 移除css
     * @param id {string}
     */
    removeCSS(id) {
        if (!id) return
        let css = document.getElementById(id)
        if (css) {
            css.remove()
        }
    },

    /**
     * 加载css
     * @param file {string}
     * @param id {string}
     * @param remove {boolean}
     * @param cache {boolean}
     */
    loadCSS(file, id = '', remove = true, cache = false) {
        if (remove) this.removeCSS(id)
        let url = this.apiUrl() + 'styles?file=' + encodeURIComponent(file)
        if (!cache) {
            url += '&t=' + new Date().getTime()
        }
        let link = document.createElement('link')
        link.id = id
        link.rel = 'stylesheet'
        link.href = url
        document.head.appendChild(link)
    },

    /**
     * 交换元素
     * @param ele1 {Element}
     * @param ele2 {Element}
     */
    swapElement(ele1, ele2) {
        let parent1 = ele1.parentNode
        let parent2 = ele2.parentNode
        let next1 = ele1.nextSibling
        let next2 = ele2.nextSibling
        parent1.insertBefore(ele2, next1)
        parent2.insertBefore(ele1, next2)
    },
}