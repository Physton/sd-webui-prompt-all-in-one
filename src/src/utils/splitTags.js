export default (tags) => {
    if (tags === null || tags === undefined || tags === false || tags === "" || tags.trim() === "") return []

    tags = tags.replace(/，/g, ',') // 中文逗号
    tags = tags.replace(/。/g, ',') // 中文句号
    tags = tags.replace(/、/g, ',') // 中文顿号
    tags = tags.replace(/；/g, ',') // 中文分号
    tags = tags.replace(/．/g, ',') // 日文句号

    tags = tags.replace(/\t/g, '\n') // 制表符
    tags = tags.replace(/\r/g, '\n') // 回车符
    tags = tags.replace(/\n+/g, '\n') // 连续换行符

    const brackets = {
        '(': ')',
        '[': ']',
        '<': '>',
        '{': '}'
    }
    const bracketRegexes = [
        /\(([^\)]+)\)/g, // 括号
        /\[([^\]]+)\]/g, // 中括号
        /<([^\>]+)>/g, // 尖括号
        /\{([^\}]+)\}/g, // 大括号
    ]
    const replaceComma = '----====physton====----'

    // 先把最内层括号中的,替换成----====physton====----
    bracketRegexes.forEach(regx => {
        tags = tags.replace(regx, (match, p1) => {
            return match.replace(p1, p1.replace(/,/g, replaceComma))
        })
    })
    let list = []
    let lines = tags.split('\n')
    const linesCount = lines.length
    lines = lines.map((line, index) => {
        line = line.trim()
        if (line === "") return
        line.split(",").forEach(tag => {
            tag = tag.trim()
            if (tag === "") return
            // 把----====physton====----替换回来
            // 本行内的括号是否对齐，如果没对齐，不要加逗号，对齐了加逗号
            /*let isAlign = false
            for (let start in brackets) {
                let startCount = tag.split(start).length - 1
                let endCount = tag.split(brackets[start]).length - 1
                if (startCount === endCount) {
                    isAlign = true
                    break
                }
            }*/
            tag = tag.replace(new RegExp(replaceComma, 'g'), ',')
            /*if (isAlign) {
                // tag += ','
            }*/
            list.push(tag)
        })
        if (index < linesCount - 1) {
            list.push('\n')
        }
    })
    return list
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
