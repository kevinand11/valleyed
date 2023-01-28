import { VCore } from './core'
import { isEarlierThan, isLaterThan, isTime, Timeable } from '../rules'

export type { Timeable }

export class VTime<I extends Timeable = Timeable, O extends Timeable = I> extends VCore<I, O> {
	constructor (err?: string) {
		super()
		this.addTyping(isTime(err))
	}

	min (compare: O, err?: string) {
		return this.addRule(isLaterThan(compare, err))
	}

	max (compare: O, err?: string) {
		return this.addRule(isEarlierThan(compare, err))
	}

	asStamp () {
		return new VTime<I, number>()
			.clone(this)
			.setTransform((v) => new Date(v as any).valueOf())
	}

	asString () {
		return new VTime<I, string>()
			.clone(this)
			.setTransform((v) => new Date(v as any).toString())
	}

	asDate () {
		return new VTime<I, Date>()
			.clone(this)
			.setTransform((v) => new Date(v as any))
	}
}