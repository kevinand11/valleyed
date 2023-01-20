import { isLessThan, isLessThanOrEqualTo, isMoreThan, isMoreThanOrEqualTo, isNumber } from '../rules'
import { VCore } from './core'

export class VNumber<I = number> extends VCore<I, number> {
	static create<I = number> (err?: string) {
		const v = new VNumber<I>()
		v.addRule(isNumber(err))
		return v
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
		return this.addSanitizer((val) => Number(this.conv(val).toFixed(dp)))
	}

	private conv (value: I) {
		if (isNumber()(value).valid) return value as number
		return 0
	}
}
