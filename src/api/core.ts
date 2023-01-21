import { arrayContains, isCustom, isDeepEqualTo, isShallowEqualTo } from '../rules'
import { VBase } from './base'

export class VCore<I, O = I> extends VBase<I, O> {
	protected constructor () {
		super()
	}

	static c<I, O = I> () {
		return new VCore<I, O>()
	}

	original () {
		this._options.original = true
		return this
	}

	optional () {
		const v = VPartial.create<I, O, undefined>(this)
		v._options.required = false
		return v
	}

	nullable () {
		const v = VPartial.create<I, O, null>(this)
		v._options.nullable = true
		return v
	}

	nullish () {
		return this.optional().nullable()
	}

	default (def: O) {
		this._options.default = def
		return this
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
	static create<I, O, P> (c: VCore<I, O>) {
		const v = new VPartial<I, O, P>()
		v.clone(c as any)
		return v
	}
}