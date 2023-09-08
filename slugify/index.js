import {slugify} from '@lazy-cjk/zh-slugify'

function slugifyMulti(texts) {
    var result = []
    texts.forEach((text, index) => {
        result.push({
            text,
            index,
            result: slugify(text, true)
        })
    })
    return result
}

export default slugifyMulti