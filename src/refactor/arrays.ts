import { hasLessThan, hasLessThanOrEqualTo, hasMoreThan, hasMoreThanOrEqualTo, isArray, isArrayOf } from '../rules'
import { VCore } from './core'

export class VArray<T> extends VCore<T[]> {
	constructor (err?: string) {
		super()
		this.addRule((val: T[]) => isArray(val, err))
	}

	gt (length: number, err?: string) {
		return this.addRule((val: T[]) => hasMoreThan(val, length, err))
	}

	gte (length: number, err?: string) {
		return this.addRule((val: T[]) => hasMoreThanOrEqualTo(val, length, err))
	}

	lt (length: number, err?: string) {
		return this.addRule((val: T[]) => hasLessThan(val, length, err))
	}

	lte (length: number, err?: string) {
		return this.addRule((val: T[]) => hasLessThanOrEqualTo(val, length, err))
	}

	of (comparer: (cur: T) => boolean, type: string, error?: string) {
		return this.addRule((val: T[]) => isArrayOf(val, comparer, type, error))
	}
}
