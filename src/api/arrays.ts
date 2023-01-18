import { hasLengthOf, hasMaxOf, hasMinOf, isArray, isArrayOf } from '../rules'
import { VCore } from './core'

export class VArray<T> extends VCore<T[]> {
	constructor (err?: string) {
		super()
		this.addRule(isArray(err))
	}

	has (length: number, err?: string) {
		return this.addRule(hasLengthOf(length, err))
	}

	min (length: number, err?: string) {
		return this.addRule(hasMinOf(length, err))
	}

	max (length: number, err?: string) {
		return this.addRule(hasMaxOf(length, err))
	}

	of (comparer: (cur: T) => boolean, type: string, error?: string) {
		return this.addRule(isArrayOf(comparer, type, error))
	}
}
