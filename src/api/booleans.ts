import { VCore } from './core'
import { isBoolean } from '../rules'

export class VBoolean extends VCore<boolean> {
	constructor (err?: string) {
		super()
		this.addRule((val: boolean) => isBoolean(err)(val))
	}
}