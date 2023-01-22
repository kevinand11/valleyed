import { VCore } from './core'
import { isBoolean } from '../rules'

export class VBoolean<I = boolean> extends VCore<I, boolean> {
	constructor (err?: string) {
		super()
		this.addTyping(isBoolean(err))
	}
}