import HistoryItem from './historyItem'

// not use，废弃
// not use，废弃
// not use，废弃
export class History {
    /**
     * 最大历史记录数
     * @type {number}
     */
    max = 100
    /**
     * 列表
     * @type {Array.<FavoriteItem>}
     */
    histories = []

    /**
     * 构造函数
     * @param max {number}
     */
    constructor(max = 100) {
        this.max = max
    }

    /**
     * 添加历史记录
     * @param historyItem {HistoryItem}
     * @returns {number}
     */
    push(historyItem) {
        this.histories.push(historyItem)
        if (this.histories.length > this.max) {
            this.histories.shift()
        }
        return this.histories.length - 1
    }

    /**
     * 添加历史记录
     * @param historyItem {Object}
     * @returns {number}
     */
    pushObject(historyItem) {
        return this.push(HistoryItem.fromObject(historyItem))
    }

    /**
     * 添加历史记录
     * @param historyItem {string}
     * @returns {number}
     */
    pushString(historyItem) {
        return this.push(HistoryItem.fromString(historyItem))
    }

    /**
     * 设置历史记录
     * @param index {number}
     * @param historyItem {HistoryItem}
     */
    setItemByIndex(index, historyItem) {
        this.histories[index] = historyItem
    }

    /**
     * 设置历史记录
     * @param id {string}
     * @param historyItem {HistoryItem}
     */
    setItemById(id, historyItem) {
        this.setItemByIndex(this.getHistoryIndexById(id), historyItem)
    }

    /**
     * 删除历史记录
     * @param index {number}
     */
    removeItem(index) {
        this.histories.splice(index, 1)
    }

    /**
     * 删除历史记录
     * @param id {string}
     */
    removeItemById(id) {
        this.removeItem(this.getHistoryIndexById(id))
    }

    /**
     * 设置最大历史记录数
     * @param max {number}
     * @returns {History}
     */
    setMax(max) {
        this.max = max
        return this
    }

    /**
     * 获取最大历史记录数
     * @returns {number}
     */
    getMax() {
        return this.max
    }

    /**
     * 获取最后一条历史记录
     * @returns {FavoriteItem}
     */
    getLatest() {
        return this.histories[this.histories.length - 1]
    }

    /**
     * 获取历史记录
     * @param id {string}
     * @returns {FavoriteItem}
     */
    getHistoryById(id) {
        return this.histories.find(item => item.id === id)
    }

    /**
     * 获取历史记录
     * @param index {number}
     * @returns {FavoriteItem}
     */
    getHistoryByIndex(index) {
        return this.histories[index]
    }

    /**
     * 获取历史记录
     * @param id {string}
     * @returns {number}
     */
    getHistoryIndexById(id) {
        return this.histories.findIndex(item => item.id === id)
    }

    /**
     * 获取所有历史记录
     * @returns {Array<FavoriteItem>}
     */
    getHistories() {
        return this.histories
    }

    /**
     * 获取历史记录数
     * @returns {number}
     */
    getHistoriesLength() {
        return this.histories.length
    }

    /**
     * 转换为对象
     * @returns {{name: string, id: number, time: number, prompt: string, tags: *[]}[]}
     */
    toObject() {
        return this.histories.map(item => item.toObject())
    }

    /**
     * 转换为字符串
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toObject())
    }
}

export default History