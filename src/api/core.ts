import { arrayContains, isCustom, isDeepEqualTo, isShallowEqualTo } from '../rules'
import { ExtractI, ExtractO, ExtractTr, VBase } from './base'

export class VCore<I, O = I, T = O> extends VBase<I, O, T> {
	constructor () {
		super()
	}

	original () {
		return this._setOption('original', true)
	}

	optional (): VPartial<this, undefined> {
		return new VPartial<this, undefined>(this)
			._setOption('required', false)
	}

	nullable (): VPartial<this, null> {
		return new VPartial<this, null>(this)
			._setOption('nullable', true)
	}

	nullish () {
		return this.optional().nullable()
	}

	default (def: O | (() => O)) {
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

class VPartial<T extends VCore<any>, P> extends VCore<P | ExtractI<T>, P | ExtractO<T>, P | ExtractTr<T>> {
	constructor (base: T) {
		super()
		this.clone(base)
	}
}