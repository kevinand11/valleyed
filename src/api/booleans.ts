import { VCore } from './core'
import { isBoolean } from '../rules'

export class VBoolean extends VCore<boolean> {
	constructor (err?: string) {
		super()
		this.addTyping(isBoolean(err))
	}
}