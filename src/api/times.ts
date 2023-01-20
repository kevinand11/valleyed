import { VCore } from './core'
import { isTime } from '../rules'

export type Timeable = Date | string | number

export class VTime<I = Timeable> extends VCore<I, Timeable> {
	static create<I = Timeable> (err?: string) {
		const v = new VTime<I>()
		v.addTyping(isTime(err))
		return v
	}
}