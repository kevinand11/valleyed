import { arrayContains, isCustom, isDeepEqualTo, isShallowEqualTo } from '../rules'
import { VBase } from './base'

export class VCore<I, O = I, T = O> extends VBase<I, O, T> {
	constructor () {
		super()
	}

	original () {
		return this._setOption('original', true)
	}

	optional () {
		return new VCore<I | undefined, O | undefined, T | undefined>()
			.clone(this as any)
			._setOption('required', false)
	}

	nullable () {
		return new VCore<I | null, O | null, T | null>()
			.clone(this as any)
			._setOption('nullable', true)
	}

	nullish () {
		return this.optional().nullable()
	}

	default (def: O) {
		return this._setOption('default', def)
	}

	custom (fn: (v: O) => boolean, err?: string) {
		return this.addRule(isCustom(fn, err))
	}

	eq (compare: O, err?: string) {
		return this.addRule(isShallowEqualTo(compare, err))
	}

	eqD (compare: O, comparer: (val: O, compare: O) => boolean, err?: string) {
		return this.addRule(isDeepEqualTo(compare, comparer, err))
	}

	in (array: O[], comparer: (curr: O, val: O) => boolean, err?: string) {
		return this.addRule(arrayContains(array, comparer, err))
	}
}

export class VPartial<I, O, P> extends VCore<I | P, O | P> {
	constructor (c: VCore<I, O, any>) {
		super()
		this.clone(c as any)
	}
}