import FavoriteItem from "./favoriteItem";

// not use，废弃
// not use，废弃
// not use，废弃
class Favorite {
    /**
     * 列表
     * @type {Array.<FavoriteItem>}
     */
    favorites = []

    /**
     * 构造函数
     */
    constructor() {
    }

    /**
     * 添加收藏
     * @param favoriteItem {FavoriteItem}
     * @returns {number}
     */
    push(favoriteItem) {
        this.favorites.push(favoriteItem)
        return this.favorites.length - 1
    }

    /**
     * 添加收藏
     * @param favoriteItem {Object}
     * @returns {number}
     */
    pushObject(favoriteItem) {
        return this.push(FavoriteItem.fromObject(favoriteItem))
    }

    /**
     * 添加收藏
     * @param favoriteItem {string}
     * @returns {number}
     */
    pushString(favoriteItem) {
        return this.push(FavoriteItem.fromString(favoriteItem))
    }

    /**
     * 设置收藏
     * @param index {number}
     * @param favoriteItem {FavoriteItem}
     */
    setItemByIndex(index, favoriteItem) {
        this.favorites[index] = favoriteItem
    }

    /**
     * 设置收藏
     * @param id {string}
     * @param favoriteItem {FavoriteItem}
     */
    setItemById(id, favoriteItem) {
        this.setItemByIndex(this.getFavoriteIndexById(id), favoriteItem)
    }

    /**
     * 删除收藏
     * @param index {number}
     */
    removeItem(index) {
        this.favorites.splice(index, 1)
    }

    /**
     * 删除收藏
     * @param id {string}
     */
    removeItemById(id) {
        this.removeItem(this.getFavoriteIndexById(id))
    }

    /**
     * 获取最后一条收藏
     * @returns {FavoriteItem}
     */
    getLatest() {
        return this.favorites[this.favorites.length - 1]
    }

    /**
     * 获取收藏
     * @param id {string}
     * @returns {FavoriteItem}
     */
    getFavoriteById(id) {
        return this.favorites.find(item => item.id === id)
    }

    /**
     * 获取收藏
     * @param index {number}
     * @returns {FavoriteItem}
     */
    getFavoriteByIndex(index) {
        return this.favorites[index]
    }

    /**
     * 获取收藏
     * @param id {string}
     * @returns {number}
     */
    getFavoriteIndexById(id) {
        return this.favorites.findIndex(item => item.id === id)
    }

    /**
     * 获取所有收藏
     * @returns {Array<FavoriteItem>}
     */
    getFavorites() {
        return this.favorites
    }

    /**
     * 获取收藏数量
     * @returns {number}
     */
    getFavoritesLength() {
        return this.favorites.length
    }

    /**
     * 转换为收藏
     * @returns {{name: string, id: number, time: number, prompt: string, tags: *[]}[]}
     */
    toObject() {
        return this.favorites.map(item => item.toObject())
    }

    /**
     * 转换为字符串
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toObject())
    }
}

export default Favorite