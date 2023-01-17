import { isLessThan, isLessThanOrEqualTo, isMoreThan, isMoreThanOrEqualTo, isNumber } from '../rules'
import { VCore } from './core'

export class VNumber extends VCore<number> {
	constructor (err?: string) {
		super()
		this.addRule((val: number) => isNumber(val, err))
	}

	gt (length: number, err?: string) {
		return this.addRule((val: number) => isMoreThan(val, length, err))
	}

	gte (length: number, err?: string) {
		return this.addRule((val: number) => isMoreThanOrEqualTo(val, length, err))
	}

	lt (length: number, err?: string) {
		return this.addRule((val: number) => isLessThan(val, length, err))
	}

	lte (length: number, err?: string) {
		return this.addRule((val: number) => isLessThanOrEqualTo(val, length, err))
	}
}
