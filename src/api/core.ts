import { arrayContains, isCustom } from '../rules'
import { Differ } from '../utils/differ'
import { Transformer } from '../utils/rules'
import { arrayNotContains, isEqualTo, isNotEqualTo } from './../rules/equality'
import { ExtractI, VBase } from './base'

export class VCore<I> extends VBase<I> {
	constructor () {
		super()
	}

	original () {
		return this._setOption('original', true)
	}

	requiredIf (required: () => boolean) {
		return makePartial<this, undefined>(this)
			._setOption('required', required)
	}

	optional () {
		return makePartial<this, undefined>(this)
			._setOption('required', false)
	}

	nullable () {
		return makePartial<this, null>(this)
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

	ne (
		compare: I,
		comparer = Differ.equal as (val: any, compare: I) => boolean,
		err?: string) {
		return this.addRule(isNotEqualTo(compare, comparer, err))
	}

	in (
		array: Readonly<I[]>,
		comparer = Differ.equal as (val: any, arrayItem: I) => boolean,
		err?: string
	) {
		return this.addRule(arrayContains(array, comparer, err))
	}

	nin (
		array: Readonly<I[]>,
		comparer = Differ.equal as (val: any, arrayItem: I) => boolean,
		err?: string
	) {
		return this.addRule(arrayNotContains(array, comparer, err))
	}

	transform<T> (transformer: Transformer<I, T>) {
		return new VCore<T>()
			.clone(this as unknown as VCore<T>)
			._addTransform(transformer as any)
	}
}

const makePartial = <T extends VCore<any>, P> (base: T) => base as VCore<P | ExtractI<T>>