import { isBoolean } from '../rules'
import { VCore } from './core'

export class VBoolean extends VCore<boolean> {
	constructor (err?: string) {
		super()
		this.addTyping(isBoolean(err))
	}
}