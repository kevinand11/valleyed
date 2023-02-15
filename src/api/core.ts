import { Differ } from 'utils/differ'
import { arrayContains, isCustom } from '../rules'
import { Transformer } from '../utils/rules'
import { isEqualTo } from './../rules/equality'
import { ExtractI, ExtractO, VBase } from './base'

export class VCore<I, O = I> extends VBase<I, O> {
	constructor () {
		super()
	}

	original () {
		return this._setOption('original', true)
	}

	requiredIf (required: () => boolean): VPartial<this, undefined> {
		return new VPartial<this, undefined>(this)
			._setOption('required', required)
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

	eq (
		compare: I,
		comparer = Differ.equal as (val: any, compare: I) => boolean,
		err?: string) {
		return this.addRule(isEqualTo(compare, comparer, err))
	}

	in (
		array: I[],
		comparer = Differ.equal as (val: any, arrayItem: I) => boolean,
		err?: string
	) {
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