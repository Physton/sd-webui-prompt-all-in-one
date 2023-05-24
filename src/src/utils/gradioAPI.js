import axios from "axios"
import common from "@/utils/common";

export default class GradioAPI {
    apiBaseURL = "";

    constructor() {
        this.apiBaseURL = common.apiUrl()
        this.api = axios.create({
            baseURL: this.apiBaseURL,
            timeout: 60000,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    async getVersion() {
        return (await this.api.get("/get_version")).data.version
    }

    async getConfig() {
        return (await this.api.get("/get_config")).data
    }

    async getExtensions() {
        return (await this.api.get("/get_extensions")).data.extensions
    }

    async tokenCounter(text, steps) {
        return (await this.api.post("/token_counter", {text, steps})).data
    }

    async getData(key) {
        return (await this.api.get("/get_data", {params: {key}})).data.data
    }

    async getDatas(keys) {
        if (typeof keys === "object") {
            keys = keys.join(",")
        }
        return (await this.api.get("/get_datas", {params: {keys}})).data.datas
    }

    async setData(key, data) {
        return (await this.api.post("/set_data", {key, data})).data.success
    }

    async setDatas(datas) {
        return (await this.api.post("/set_datas", {datas})).data.success
    }

    async getDataListItem(key, index) {
        return (await this.api.get("/get_data_list_item", {params: {key, index}})).data.item
    }

    async pushDataList(key, item) {
        return (await this.api.post("/push_data_list", {key, item})).data.success
    }

    async popDataList(key) {
        return (await this.api.post("/pop_data_list", {key})).data.item
    }

    async shiftDataList(key) {
        return (await this.api.post("/shift_data_list", {key})).data.item
    }

    async removeDataList(key, index) {
        return (await this.api.post("/remove_data_list", {key, index})).data.success
    }

    async clearDataList(key) {
        return (await this.api.post("/clear_data_list", {key})).data.success
    }

    async getHistories(type) {
        return (await this.api.get("/get_histories", {params: {type}})).data.histories
    }

    async getFavorites(type) {
        return (await this.api.get("/get_favorites", {params: {type}})).data.favorites
    }

    async pushHistory(type, tags, prompt, name = '') {
        return (await this.api.post("/push_history", {type, tags, prompt, name})).data.success
    }

    async pushFavorite(type, tags, prompt, name = '') {
        return (await this.api.post("/push_favorite", {type, tags, prompt, name})).data.success
    }

    async getLatestHistory(type) {
        return (await this.api.get("/get_latest_history", {params: {type}})).data.history
    }

    async setHistory(type, id, tags, prompt, name) {
        return (await this.api.post("/set_history", {type, id, tags, prompt, name})).data.success
    }

    async setHistoryName(type, id, name) {
        return (await this.api.post("/set_history_name", {type, id, name})).data.success
    }

    async setFavoriteName(type, id, name) {
        return (await this.api.post("/set_favorite_name", {type, id, name})).data.success
    }

    async doFavorite(type, id) {
        return (await this.api.post("/dofavorite", {type, id})).data.success
    }

    async unFavorite(type, id) {
        return (await this.api.post("/unfavorite", {type, id})).data.success
    }

    async deleteHistory(type, id) {
        return (await this.api.post("/delete_history", {type, id})).data.success
    }

    async deleteHistories(type) {
        return (await this.api.post("/delete_histories", {type})).data.success
    }

    async translate(text, from_lang, to_lang, api, api_config = {}) {
        let data = (await this.api.post("/translate", {text, from_lang, to_lang, api, api_config})).data
        if (data.translated_text) {
            // 实体转义
            data.translated_text = common.unescapeHtml(data.translated_text)
        }
        return data
    }

    async getCSVs() {
        return (await this.api.get("/get_csvs")).data.csvs
    }

    async getCSV(key) {
        return (await this.api.get("/get_csv", {params: {key}})).data
    }

    async styles(file, hash="") {
        return (await this.api.get("/styles", {params: {file, hash}})).data
    }

    async getExtensionCssList() {
        return (await this.api.get("/get_extension_css_list")).data.css_list
    }

    async getExtraNetworks() {
        return (await this.api.get("/get_extra_networks")).data.extra_networks
    }
}