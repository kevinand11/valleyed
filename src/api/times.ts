import { VCore } from './core'
import { isEarlierThan, isLaterThan, isTime, Timeable } from '../rules'

export type { Timeable }

export class VTime<I extends Timeable = Timeable, O extends Timeable = I, Tr extends Timeable = I> extends VCore<I, O, Tr> {
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
		return new VTime<I, O, number>()
			.clone(this)
			.setTransform((v) => new Date(v as any).valueOf())
	}

	asString () {
		return new VTime<I, O, string>()
			.clone(this)
			.setTransform((v) => new Date(v as any).toString())
	}

	asDate () {
		return new VTime<I, O, Date>()
			.clone(this)
			.setTransform((v) => new Date(v as any))
	}
}