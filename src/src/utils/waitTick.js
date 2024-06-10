import { nextTick } from 'vue'

export default {
	/**
	 * @types Function[]
	 */
	waitTickList: [],
	startingTick: false,
	/**
	 *
	 * @param cb Function
	 */
	addWaitTick(cb) {
		this.waitTickList.push(cb)
		return this.startWaitTick()
	},

	async execatueWaitTick()
	{
		if (this.startingTick) return

		this.startingTick = true

		while (this.waitTickList.length) {
			const cb = this.waitTickList.shift()
			await nextTick().then(cb)
		}

		this.startingTick = false
	},

	async startWaitTick() {
		if (!this.startingTick)
		{
			return nextTick(() => this.execatueWaitTick().catch(e => {
				this.startingTick = false
				return this.startWaitTick()
			}))
		}
	}
}
