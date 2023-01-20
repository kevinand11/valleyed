import { VCore } from './core'
import { isBoolean } from '../rules'

export class VBoolean<I = boolean> extends VCore<I, boolean> {
	static create<I = boolean> (err?: string) {
		const v = new VBoolean<I>()
		v.addTyping(isBoolean(err))
		return v
	}
}