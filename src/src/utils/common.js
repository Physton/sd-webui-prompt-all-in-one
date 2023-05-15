export default {
    weightNumRegex: /(.*):([0-9\.]+)/,
    weightNumRegexEN: /(.*):\s*([0-9\.]+)/,
    weightNumRegexCN: /(.*)：\s*([0-9\.]+)/,
    dontSplitRegexes: [
        // [night light:magical forest:5, 15],[night light:magical forest:norvegian territory:5, 15, 25:catmull],(fire extinguisher:1, 2.0),[(fire extinguisher: 1.0, 2.0)::5],[lion:bird:girl: , 7, 10],EasyNegative (normal quality,Low quality,worst quality:1.4),EasyNegative [normal quality,Low quality,worst quality:1.4],<lora:clothesTransparent_v20:1:1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0>,(aaa,bbb,ccc),(deformed iris, deformed pupils, semi-realistic),(Tang costume, Chinese women, high collar, neckline, embroidery, gold thread, colored silk thread, floral and bird pattern, wide sleeves, wrist, gold thread embroidery, red silk satin, gloss, side slit design, hemline, floral pattern, petals, vines, romantic,:1.2),aaa,
        // (badhandv4:1.4),\(EasyNegative:1.4\), \(ng deepnegative v1 75t\), \(worst quality:1.4\), \(low quality:1.4\) , \(monochrome:1.1\), lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, normal quality, jpeg artifacts, \(signature, watermark, username:1.4\), blurry, bad feet, multiple breasts, \(mutated hands and fingers:1.5 \), \(long body :1.3\), \(mutation, poorly drawn :1.2\) , black-white, liquid body, liquid tongue, disfigured, malformed, mutated, anatomical nonsense, text font ui, malformed hands, long neck, blurred, lowers, bad proportions, bad shadow, uncoordinated body, unnatural body, fused breasts, bad breasts, huge breasts, poorly drawn breasts, extra breasts, liquid breasts, heavy breasts, missing breasts, huge haunch, huge thighs, huge calf, fused hand, missing hand, \(holding\), muscles, abs, (bad_prompt_version2-neg:1.2),
        // [night light:magical forest: 5, 15]
        // [night light:magical forest:norvegian territory: 5, 15, 25:catmull]
        // (fire extinguisher: 1.0, 2.0)
        // [(fire extinguisher: 1.0, 2.0)::5]
        // [lion:bird:girl: , 7, 10]
        /(\[([\w\s\_\-]+:)+\s*([0-9\.]*,?\s*)+(:[\w\s\_\-]+)*\])+/g,
        /(\(([\w\s\_\-]+:)+\s*([0-9\.]*,?\s*)+(:[\w\s\_\-]+)*\))+/g,
        // EasyNegative (normal quality,Low quality,worst quality:1.4)
        /(([^,]+)?\s*\\*\(([\w\s\_\-\|]+\,*(:[0-9\.]+)?\,?\s*)+\\*\)\s*([^,]+)?)+/g,
        // EasyNegative [normal quality,Low quality,worst quality:1.4]
        /(([^,]+)?\s*\\*\[([\w\s\_\-\|]+\,*(:[0-9\.]+)?\,?\s*)+\\*\]\s*([^,]+)?)+/g,
        // <lora:clothesTransparent_v20:1:1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0>
        /(\<[^\>]+\>)+/g,
    ],
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
     * 分割标签
     * @param tags {string}
     * @returns {string[]}
     */
    splitTags(tags) {
        if (tags === null || tags === undefined || tags === false || tags === "" || tags.trim() === "") return []

        tags = tags.trim()
        tags = tags.replace(/\t/g, '\n') // 制表符
        // tags = tags.replace(/\n/g, '\n') // 换行符
        tags = tags.replace(/\r/g, '\n') // 回车符
        tags = tags.replace(/\n+/g, '\n') // 连续换行符

        let list = []
        const lines = tags.split("\n")
        const lineCount = lines.length
        lines.forEach((line, index) => {
            line = line.trim()
            if (line === '') return
            // 替换
            line = line.replace(/，/g, ',') // 中文逗号
            line = line.replace(/。/g, ',') // 中文句号
            line = line.replace(/、/g, ',') // 中文顿号
            line = line.replace(/；/g, ',') // 中文分号
            line = line.replace(/．/g, ',') // 日文句号
            line = line.replace(/;/g, ',') // 英文分号
            const replace = '----====physton====----'
            const replaceRex = new RegExp(replace, 'g')
            for (const regex of this.dontSplitRegexes) {
                // 将其中的逗号替换掉
                line = line.replace(regex, (match) => {
                    return match.replace(/,/g, replace)
                })
            }
            line.split(",").forEach((tag, index) => {
                tag = tag.trim()
                if (tag === '') return
                // 把逗号替换回来
                tag = tag.replace(replaceRex, ',')
                list.push(tag)
            })
            if (index < lineCount - 1) {
                list.push('\n')
            }
        })
        return list
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
        return {}
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
}