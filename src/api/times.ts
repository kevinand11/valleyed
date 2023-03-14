import { isEarlierThan, isLaterThan, isTime, Timeable } from '../rules'
import { VCore } from './core'

export type { Timeable }

export class VTime<T extends Timeable = Timeable> extends VCore<T> {
	constructor (err?: string) {
		super()
		this.addTyping(isTime(err))
	}

	min (compare: Timeable, err?: string) {
		return this.addRule(isLaterThan(compare, err))
	}

	max (compare: Timeable, err?: string) {
		return this.addRule(isEarlierThan(compare, err))
	}

	asStamp () {
		return this.transform((v) => new Date(v).valueOf())
	}

	asString () {
		return this.transform((v) => new Date(v).toString())
	}

	asDate () {
		return this.transform((v) => new Date(v))
	}
}