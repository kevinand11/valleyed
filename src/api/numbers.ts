import { isInt, isLessThan, isLessThanOrEqualTo, isMoreThan, isMoreThanOrEqualTo, isNumber } from '../rules'
import { VCore } from './core'

export class VNumber extends VCore<number> {
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

	int (err?: string) {
		return this.addRule(isInt(err))
	}

	round (dp = 0) {
		return this.addSanitizer((val) => Number(val.toFixed(dp)))
	}
}
