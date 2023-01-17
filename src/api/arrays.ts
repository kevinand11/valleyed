import {
	hasLength,
	hasLessThan,
	hasLessThanOrEqualTo,
	hasMoreThan,
	hasMoreThanOrEqualTo,
	isArray,
	isArrayOf
} from '../rules'
import { VCore } from './core'

export class VArray<T> extends VCore<T[]> {
	constructor (err?: string) {
		super()
		this.addRule(isArray(err))
	}

	has (length: number, err?: string) {
		return this.addRule(hasLength(length, err))
	}

	gt (length: number, err?: string) {
		return this.addRule(hasMoreThan(length, err))
	}

	gte (length: number, err?: string) {
		return this.addRule(hasMoreThanOrEqualTo(length, err))
	}

	lt (length: number, err?: string) {
		return this.addRule(hasLessThan(length, err))
	}

	lte (length: number, err?: string) {
		return this.addRule(hasLessThanOrEqualTo(length, err))
	}

	of (comparer: (cur: T) => boolean, type: string, error?: string) {
		return this.addRule(isArrayOf(comparer, type, error))
	}
}
