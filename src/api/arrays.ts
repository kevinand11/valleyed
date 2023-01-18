import { hasLengthOf, hasMaxOf, hasMinOf, isArray } from '../rules'
import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

export class VArray<T> extends VCore<T[]> {
	constructor (comparer: VCore<T, T>, type: string, err?: string) {
		super()
		this.addRule(isArray())
		this.addRule(makeRule<T[]>((value) => {
			const invIndex = value.findIndex((elem) => !comparer.parse(elem).valid)
			const invalid = invIndex !== -1
			err = err ?? `contains some values that are not ${type} at index ${invIndex}`
			return invalid ? isInvalid(err) : isValid()
		}))
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
