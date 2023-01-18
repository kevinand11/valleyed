import { VCore } from './core'
import { isBoolean } from '../rules'

export class VBoolean<I = boolean> extends VCore<I, boolean> {
	constructor (err?: string) {
		super()
		this.addRule((val: boolean) => isBoolean(err)(val))
	}
}