/**
 * 分割标签（对外入口）。
 *
 * @param {string}  tags
 * @param {boolean} autoBreakBeforeWrap
 * @param {boolean} autoBreakAfterWrap
 * @param {object}  [options] - 扩充选项集中于此物件，避免参数随功能增加而爆炸。
 *   @param {boolean} [options.allowKeepEmptyLine=false] - 是否允许保持一个空行。
 * @returns {string[]}
 */
export default (tags, autoBreakBeforeWrap = false, autoBreakAfterWrap = false, options = {}) => {
    if (tags === null || tags === undefined || tags === false || tags === "" || tags.trim() === "") return []
    return splitRaw(tags, true, autoBreakBeforeWrap, autoBreakAfterWrap, options)
}

/**
 * 分割核心（可遞迴重處理）。
 *
 * @param {string}  tags
 * @param {boolean} allowSingleQuote - 是否允許單引號開啟引號。
 *   主呼叫為 true；當分段（分行或收尾）時發現單引號未關閉（quoteChar 為單引號），
 *   該段會以 false 遞迴重處理——忽略此未關閉的單引號，
 *   重新套用逗號／分行／BREAK／括號切割規則。
 *   雙引號不受影響（未關閉雙引號仍保護到結尾）。
 * @param {boolean} autoBreakBeforeWrap
 * @param {boolean} autoBreakAfterWrap
 * @param {object}  [options]
 * @param {boolean} [options.allowKeepEmptyLine=false] - 是否允許保持一個空行。
 *   false（預設）：連續換行一律壓縮為單一換行（\n+ → \n）。
 *   true：連續換行最多保留一個空行（\n{3,} → \n\n），兩個以上的空行仍會被壓縮。
 * @returns {string[]}
 */
function splitRaw(tags, allowSingleQuote, autoBreakBeforeWrap, autoBreakAfterWrap, options = {}) {
    const {allowKeepEmptyLine = false} = options

    /**
     * 中文/日文標點轉換（原為全域 pre-process，改為在迴圈內 quote-aware 執行）
     * 避免引號內的「、」。「」被提前轉換，失去原始語義。
     */
    function convertPunctuation(ch) {
        switch (ch) {
            /** ，中文逗号 */
            case '\uFF0C': return ','
            /** 。中文句号 */
            case '\u3002': return '.'
            /** 、中文顿号 */
            case '\u3001': return ','
            /** ；中文分号 */
            case '\uFF1B': return ','
            /** ．日文句号(fullwidth) */
            case '\uFF0E': return ','
            default: return ch
        }
    }

    /** 制表符 */
    tags = tags.replace(/\t/g, '\n')
    /** 回车符 */
    tags = tags.replace(/\r/g, '\n')
    /**
     * 连续换行符压缩：
     *   allowKeepEmptyLine=false（预设）— 一律压缩为单个换行（\n+ → \n）
     *   allowKeepEmptyLine=true          — 最多保留一个空行（\n{3,} → \n\n）
     */
    tags = allowKeepEmptyLine
        ? tags.replace(/\n{3,}/g, '\n\n')
        : tags.replace(/\n+/g, '\n')

    let emojis = [
        {emoji: ">_<", re: /\>_\</g},
        {emoji: ":<", re: /\:\</g},
        {emoji: ">:<", re: /\>\:\</g},
        {emoji: ":>", re: /\:\>/g},
        {emoji: ":-(", re: /\:\-\(/g},
        {emoji: ":-)", re: /\:\-\)/g},
    ]
    emojis.forEach((emoji, index) => {
        tags = tags.replace(emoji.re, "|||EXPRESSION" + index + "|||")
    })

    const brackets = {
        '(': ')',
        '[': ']',
        '<': '>',
        '{': '}'
    }
    const bracketStarts = Object.keys(brackets)

    let length = tags.length
    let temp = ''
    let startBracketChar = ''
    let endBracketChar = ''
    let bracketCount = 0
    /** null = 不在引號內，'"' 或 "'" = 目前開啟的引號字元 */
    let quoteChar = null
    let result = []

    /**
     * 推送一段文字：唯一的事實來源，分行分段、逗號分段、BREAK、收尾皆共用。
     * 若此時單引號未關閉（false positive，如所有格 orks'），
     * 忽略該單引號、以 allowSingleQuote=false 遞迴重處理此段，
     * 重新套用逗號／分行／BREAK／括號規則後再推送結果。
     * 未關閉的雙引號不觸發重處理（保持保護到結尾的既有行為）。
     */
    function pushSegment() {
        const text = temp.trim()
        if (text === '') return
        if (allowSingleQuote && quoteChar === "'") {
            result.push(...splitRaw(text, false, autoBreakBeforeWrap, autoBreakAfterWrap, options))
        } else {
            result.push(text)
        }
    }

    /**
     * 分行切割：唯一事實來源，引號內／外、括號內／外共用，保證行為完全一致。
     * 設計規則：分行優先級最高——不論引號或括號狀態，\n 一律觸發切割。
     * （括號僅保護逗號，不保護分行；切割後括號狀態重設，跨段括號不強制配對。）
     */
    function splitAtNewline() {
        pushSegment()
        result.push("\n")
        bracketCount = 0
        startBracketChar = ''
        endBracketChar = ''
        temp = ''
    }

    for (let i = 0; i < length; i++) {
        const char = tags[i]

        /** ── 引號追蹤（優先級最高）── */
        if (quoteChar) {
            /** 在引號內：遇到相同引號字元則關閉 */
            if (char === quoteChar) {
                quoteChar = null
            }
            /** 分行優先級大於引號：即使在引號內，\n 仍觸發切割 */
            if (char === "\n") {
                splitAtNewline()
                continue
            }
            temp += char
            continue
        } else if (char === '"') {
            /** 雙引號一律視為引號開啟（不會是撇號） */
            quoteChar = char
            temp += char
            continue
        } else if (char === "'" && allowSingleQuote) {
            /**
             * 單引號需區分撇號（it's、pathâ's、👍's）與引號開啟（'hello'）。
             * 撇號的特徵：前後都不是空白（\S 已涵蓋 tab、nbsp 及所有 Unicode 空白）。
             * 選 \S 而非 \w/\p{L}：過嚴會把非 ASCII 相鄰的撇號誤判為引號開頭，
             * 導致整串未閉合而黏成一段（災難性）；過鬆僅漏開引號（局部）。
             * allowSingleQuote=false（未關閉單引號的重處理）時跳過此分支，
             * 單引號視為一般字元，逗號照常切割。
             */
            const prevChar = i > 0 ? tags[i - 1] : ''
            const nextChar = i < length - 1 ? tags[i + 1] : ''
            const isApostrophe = /^\S$/.test(prevChar) && /^\S$/.test(nextChar)
            if (!isApostrophe) {
                quoteChar = char
                temp += char
                continue
            }
            temp += char
            continue
        }

        /** 中文/日文標點轉換：僅在引號外執行，引號內保留原始字元 */
        const converted = convertPunctuation(char)

        if (converted === "\n") {
            /** 分行優先級大於引號：與引號內共用同一切割邏輯 */
            splitAtNewline()
        } else if (converted === ",") {
            if (startBracketChar === '') {
                /** 前面没有括号 */
                pushSegment()
                bracketCount = 0
                startBracketChar = ''
                endBracketChar = ''
                temp = ''
            } else {
                /** 前面有括号 */
                temp += converted
            }
        } else {
            if (startBracketChar === '') {
                /** 前面没有括号 */
                if (bracketStarts.includes(converted)) {
                    /** 括号开始 */
                    bracketCount = 1
                    startBracketChar = converted
                    endBracketChar = brackets[converted]
                    temp += converted
                } else {
                    if (converted === " " && temp.trim() === 'BREAK') {
                        pushSegment()
                        bracketCount = 0
                        startBracketChar = ''
                        endBracketChar = ''
                        temp = ''
                    } else {
                        temp += converted
                        if (temp.endsWith(' BREAK')) {
                            temp = temp.substring(0, temp.length - ' BREAK'.length)
                            pushSegment()
                            result.push('BREAK')
                            bracketCount = 0
                            startBracketChar = ''
                            endBracketChar = ''
                            temp = ''
                        }
                    }
                }
            } else {
                /** 前面有括号 */
                if (converted === endBracketChar) {
                    /** 是结束括号的标识，减掉括号计数 */
                    bracketCount--
                    if (bracketCount === 0) {
                        /** 括号计数为0，括号结束 */
                        startBracketChar = ''
                        endBracketChar = ''
                        temp += converted
                    } else {
                        temp += converted
                    }
                } else if (converted === startBracketChar) {
                    /** 是开始括号的标识，加上括号计数 */
                    bracketCount++
                    temp += converted
                } else {
                    temp += converted
                }
            }
        }
    }
    pushSegment()

    let result2 = []
    for (let value of result) {
        if (value === "\n") {
            result2.push(value)
            continue
        }
        let start = value[0]
        let end = value[value.length - 1]
        if (start === '[' && end === ']') {
            result2.push(value)
            continue
        }
        if (start === '(' && end === ')') {
            result2.push(value)
            continue
        }
        if (start === '{' && end === '}') {
            result2.push(value)
            continue
        }

        /**
         * lora 標籤與權重括號格式範例（本段邏輯只會拆出 <lora:...>，其餘靠括號防護保留）：
         * aaa <lora:KuutanKoihime:0.7>  <lora:add_detail:0.6><lora:clothesTransparent_v20:1:1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0>, [<lora:A:1>:<lora:B:1>:10], [lora:A:1::10], [<lora:A:1>:10], [<lora:A:1>:0.5], [[<lora:A:1>::25]:10], [<lora:A:1> #increment:10], [<lora:A:1> #decrease:10], [<lora:A:1> #cmd\(warmup\(0.5\)\):10]
         */
        let regex = /\<lora:[^\>]+\>/
        let match = null
        let values = []
        while (match = regex.exec(value)) {
            let startIndex = match.index
            let endIndex = startIndex + match[0].length
            let before = value.substring(0, startIndex).trim()
            let after = value.substring(endIndex).trim()
            let middle = match[0]
            values.push(before)
            values.push(middle)
            value = after
        }
        values.push(value)
        for (let value2 of values) {
            if (value2 === '' || value2.trim() === '') continue
            emojis.forEach((emoji, index) => {
                value2 = value2.replace("|||EXPRESSION" + index + "|||", emoji.emoji)
            })
            // value2 = value2.replace(/\|\|\|EXPRESSION1\|\|\|/g, '>_<')
            result2.push(value2)
        }
    }
    result = result2

    /*let result2 = []
    let len = result.length
    for (let i = 0; i < len; i++) {
        let value = result[i]
        if (value === "BREAK") {
            if (autoBreakBeforeWrap) {
                // 如果是在“BREAK”关键词前面加换行符
                // 判断上一个是否换行符
                if (i > 0) {
                    let prev = result[i - 1]
                    if (prev === "\n" || prev === "\r\n") {
                        // 上一个已经是换行了
                    } else {
                        // 上一个不是换行
                        result2.push("\n")
                    }
                }
            }
            result2.push(value)
            if (autoBreakAfterWrap) {
                // 如果是在“BREAK”关键词后面加换行符
                // 判断下一个是否换行符
                if (i + 1 < len) {
                    let next = result[i + 1]
                    if (next === "\n" || next === "\r\n") {
                        // 下一个已经是换行了
                    } else {
                        // 下一个不是换行
                        result2.push("\n")
                    }
                }
            }
        } else {
            result2.push(value)
        }
    }*/

    return result
}

/*
export default {
    dontSplitRegexes: [
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

    /!**
     * 分割标签
     * @param tags {string}
     * @returns {string[]}
     *!/
    splitTags(tags) {
        tags = tags.trim()
        tags = tags.replace(/\t/g, '\n') // 制表符
        // tags = tags.replace(/\n/g, '\n') // 换行符
        tags = tags.replace(/\r/g, '\n') // 回车符
        tags = tags.replace(/\n+/g, '\n') // 连续换行符

        tags = tags.replace(/\n+/g, ',')
        console.log(tags)

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
}*/
