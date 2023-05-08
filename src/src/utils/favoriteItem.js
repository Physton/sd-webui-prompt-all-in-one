// not use，废弃
// not use，废弃
// not use，废弃

class FavoriteItem {
    /**
     * id
     * @type {string}
     */
    id = ''
    /**
     * 名称
     * @type {string}
     */
    name = ''
    /**
     * 标签
     * @type {[]}
     */
    tags = []
    /**
     * 提示词
     * @type {string}
     */
    prompt = ''
    /**
     * 时间
     * @type {number}
     */
    time = 0

    constructor(id = '') {
        this.id = id ? id : Math.random().toString(36).slice(2)
    }

    /**
     * 设置名称
     * @param name {string}
     * @returns {FavoriteItem}
     */
    setName(name) {
        this.name = name
        return this
    }

    /**
     * 设置标签
     * @param tags {Array}
     * @returns {FavoriteItem}
     */
    setTags(tags) {
        this.tags = tags
        return this
    }

    /**
     * 设置提示
     * @param prompt {string}
     * @returns {FavoriteItem}
     */
    setPrompt(prompt) {
        this.prompt = prompt
        return this
    }

    /**
     * 设置时间
     * @param time {number}
     * @returns {FavoriteItem}
     */
    setTime(time = 0) {
        this.time = time || Date.now()
        return this
    }

    /**
     * 判断标签是否相等
     * @param tags {Array}
     * @param ignoreId {boolean}
     * @returns {boolean}
     */
    isEqualTags(tags, ignoreId = false) {
        if (this.tags.length !== tags.length) return false
        for (let i = 0; i < tags.length; i++) {
            for (let key in tags[i]) {
                if (ignoreId && key === 'id') continue
                if (this.tags[i][key] !== tags[i][key]) return false
            }
            for (let key in this.tags[i]) {
                if (ignoreId && key === 'id') continue
                if (this.tags[i][key] !== tags[i][key]) return false
            }
        }
        return true
    }

    /**
     * 转换为对象
     * @returns {{name: string, id: number, time: number, prompt: string, tags: *[]}}
     */
    toObject() {
        return {
            id: this.id,
            name: this.name,
            tags: this.tags,
            prompt: this.prompt,
            time: this.time,
        }
    }

    /**
     * 转换为字符串
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toObject())
    }

    /**
     * 从对象创建
     * @param obj {Object}
     * @returns {FavoriteItem}
     */
    static fromObject(obj) {
        return new FavoriteItem(obj.id || '').setName(obj.name || '').setTags(obj.tags || []).setPrompt(obj.prompt || '').setTime(obj.time || 0)
    }

    /**
     * 从字符串创建
     * @param str {string}
     * @returns {FavoriteItem}
     */
    static fromString(str) {
        return FavoriteItem.fromObject(JSON.parse(str))
    }
}

export default FavoriteItem