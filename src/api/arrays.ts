import { hasLengthOf, hasMaxOf, hasMinOf, isArray, isArrayOf } from '../rules'
import { VCore } from './core'

export class VArray<T> extends VCore<T[]> {
	constructor (comparer: VCore<T, T>, type: string, err?: string) {
		super()
		this.addRule(isArray())
		this.addRule(isArrayOf<T>((v) => comparer.parse(v).valid, type, err))
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
}
