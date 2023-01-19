import { isLessThan, isLessThanOrEqualTo, isMoreThan, isMoreThanOrEqualTo, isNumber } from '../rules'
import { VCore } from './core'

export class VNumber<I = number> extends VCore<I, number> {
	static create<I = number> (err?: string) {
		const v = new VNumber<I>()
		v.addRule(isNumber(err))
		return v
	}

	gt (length: number, err?: string) {
		return this.addRule(isMoreThan(length, err))
	}

	gte (length: number, err?: string) {
		return this.addRule(isMoreThanOrEqualTo(length, err))
	}

	lt (length: number, err?: string) {
		return this.addRule(isLessThan(length, err))
	}

	lte (length: number, err?: string) {
		return this.addRule(isLessThanOrEqualTo(length, err))
	}

	round (dp: number) {
		return this.addSanitizer((val: number) => Number(Number(val).toFixed(dp)))
	}
}
