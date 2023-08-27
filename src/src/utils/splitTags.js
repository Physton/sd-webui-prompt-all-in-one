export default (tags, autoBreakBeforeWrap = false, autoBreakAfterWrap = false) => {
    if (tags === null || tags === undefined || tags === false || tags === "" || tags.trim() === "") return []

    tags = tags.replace(/，/g, ',') // 中文逗号
    tags = tags.replace(/。/g, ',') // 中文句号
    tags = tags.replace(/、/g, ',') // 中文顿号
    tags = tags.replace(/；/g, ',') // 中文分号
    tags = tags.replace(/．/g, ',') // 日文句号

    tags = tags.replace(/\t/g, '\n') // 制表符
    tags = tags.replace(/\r/g, '\n') // 回车符
    tags = tags.replace(/\n+/g, '\n') // 连续换行符

    tags = tags.replace(/\>_\</g, '|||EXPRESSION1|||') // >_<

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
    let result = []
    for (let i = 0; i < length; i++) {
        const char = tags[i]
        if (char === "\n") {
            if (startBracketChar === '') {
                // 前面没有括号
                if (temp.trim() !== "") {
                    result.push(temp.trim())
                }
                result.push("\n")
                bracketCount = 0
                startBracketChar = ''
                endBracketChar = ''
                temp = ''
            } else {
                // 前面有括号
                temp += ' '
            }
        } else if (char === ",") {
            if (startBracketChar === '') {
                // 前面没有括号
                result.push(temp.trim())
                bracketCount = 0
                startBracketChar = ''
                endBracketChar = ''
                temp = ''
            } else {
                // 前面有括号
                temp += char
            }
        } else {
            if (startBracketChar === '') {
                // 前面没有括号
                if (bracketStarts.includes(char)) {
                    // 括号开始
                    bracketCount = 1
                    startBracketChar = char
                    endBracketChar = brackets[char]
                    temp += char
                } else {
                    if (char === " " && temp.trim() === 'BREAK') {
                        result.push(temp.trim())
                        bracketCount = 0
                        startBracketChar = ''
                        endBracketChar = ''
                        temp = ''
                    } else {
                        temp += char
                        if (temp.endsWith(' BREAK')) {
                            temp = temp.substring(0, temp.length - ' BREAK'.length)
                            result.push(temp.trim())
                            result.push('BREAK')
                            bracketCount = 0
                            startBracketChar = ''
                            endBracketChar = ''
                            temp = ''
                        }
                    }
                }
            } else {
                // 前面有括号
                if (char === endBracketChar) {
                    // 是结束括号的标识，减掉括号计数
                    bracketCount--
                    if (bracketCount === 0) {
                        // 括号计数为0，括号结束
                        startBracketChar = ''
                        endBracketChar = ''
                        temp += char
                    } else {
                        temp += char
                    }
                } else if (char === startBracketChar) {
                    // 是开始括号的标识，加上括号计数
                    bracketCount++
                    temp += char
                } else {
                    temp += char
                }
            }
        }
    }
    if (temp !== '') {
        result.push(temp.trim())
    }

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

        // aaa <lora:KuutanKoihime:0.7>  <lora:add_detail:0.6><lora:clothesTransparent_v20:1:1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0>, [<lora:A:1>:<lora:B:1>:10], [lora:A:1::10], [<lora:A:1>:10], [<lora:A:1>:0.5], [[<lora:A:1>::25]:10], [<lora:A:1> #increment:10], [<lora:A:1> #decrease:10], [<lora:A:1> #cmd\(warmup\(0.5\)\):10]
        let regex = /\<lora:[^\>]+\>/
        let match = null
        let values = []
        while (match = regex.exec(value)) {
            let startIndex = match.index
            let endIndex = startIndex + match[0].length
            let before = value.substring(0, startIndex)
            let after = value.substring(endIndex)
            let middle = match[0]
            values.push(before)
            values.push(middle)
            value = after
        }
        values.push(value)
        for (let value2 of values) {
            if (value2 === '' || value2.trim() === '') continue
            // >_<
            value2 = value2.replace(/\|\|\|EXPRESSION1\|\|\|/g, '>_<')
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
