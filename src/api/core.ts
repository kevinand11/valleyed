import { arrayContains, isCustom, isDeepEqualTo, isShallowEqualTo } from '../rules'
import { ExtractI, ExtractO, VBase } from './base'
import { Transformer } from '../utils/rules'

export class VCore<I, O = I> extends VBase<I, O> {
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

	default (def: I | (() => I)) {
		return this._setOption('default', def)
	}

	custom (fn: (v: I) => boolean, err?: string) {
		return this.addRule(isCustom(fn, err))
	}

	eq (compare: I, err?: string) {
		return this.addRule(isShallowEqualTo(compare, err))
	}

	eqD (compare: I, comparer: (val: I, compare: I) => boolean, err?: string) {
		return this.addRule(isDeepEqualTo(compare, comparer, err))
	}

	in (array: I[], comparer: (curr: I, val: I) => boolean, err?: string) {
		return this.addRule(arrayContains(array, comparer, err))
	}

	transform<T> (transformer: Transformer<I, T>) {
		return new VCore<I, T>()
			.clone(this)
			._transform(transformer)
	}
}

class VPartial<T extends VCore<any>, P> extends VCore<P | ExtractI<T>, P | ExtractO<T>> {
	constructor (base: T) {
		super()
		this.clone(base)
	}
}