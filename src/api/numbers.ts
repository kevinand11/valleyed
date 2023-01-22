import { isLessThan, isLessThanOrEqualTo, isMoreThan, isMoreThanOrEqualTo, isNumber } from '../rules'
import { VCore } from './core'

export class VNumber<I = number> extends VCore<I, number> {
	constructor (err?: string) {
		super()
		this.addTyping(isNumber(err))
	}

	gt (value: number, err?: string) {
		return this.addRule(isMoreThan(value, err))
	}

	gte (value: number, err?: string) {
		return this.addRule(isMoreThanOrEqualTo(value, err))
	}

	lt (value: number, err?: string) {
		return this.addRule(isLessThan(value, err))
	}

	lte (value: number, err?: string) {
		return this.addRule(isLessThanOrEqualTo(value, err))
	}

	round (dp: number) {
		return this.addSanitizer((val) => Number(val.toFixed(dp)))
	}
}
