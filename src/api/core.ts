import { check, Rule, Sanitizer } from '../utils/rules'
import { arrayContains, isCustom, isDeepEqualTo, isShallowEqualTo } from '../rules'

export class VBase<I, O = I> {
	protected options = {
		original: false,
		required: true,
		nullable: false,
		default: undefined as unknown as O
	}
	private _sanitizers: Sanitizer<any>[] = []

	private _forced = false as (I extends O ? false : true)

	get forced () {
		return this._forced
	}

	private _rules: Rule<O>[] = []

	get rules () {
		return this._rules
	}

	parse (value: I) {
		const sanitizedValue = this.sanitize(value)
		const v = check(sanitizedValue, this._rules, this.options)
		return {
			valid: v.valid,
			error: v.errors[0] ?? '',
			value: (this.options.original ? value : sanitizedValue) as unknown as O
		}
	}

	sanitize (value: I) {
		for (const sanitizer of this._sanitizers) value = sanitizer(value)
		if (value !== undefined) return value as unknown as O
		if (this.options.default) return this.options.default
		return undefined as unknown as O
	}

	addRule (rule: Rule<any>) {
		this._rules.push(rule)
		return this
	}

	addSanitizer (sanitizer: Sanitizer<any>) {
		this._sanitizers.push(sanitizer)
		return this
	}

	protected clone (c: VCore<any, any>) {
		this.options = c.options
		this._forced = c._forced as any
		this._rules = [...c._rules]
		this._sanitizers = [...c._sanitizers]
	}
}

export class VCore<I, O = I> extends VBase<I, O> {
	protected constructor () {
		super()
	}

	static c<I, O = I> () {
		return new VCore<I, O>()
	}

	original () {
		this.options.original = true
		return this
	}

	optional () {
		const v = VPartial.create<I, O, undefined>(this)
		v.options.required = false
		return v
	}

	nullable () {
		const v = VPartial.create<I, O, null>(this)
		v.options.nullable = true
		return v
	}

	nullish () {
		return this.optional().nullable()
	}

	default (def: O) {
		this.options.default = def
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
		v.clone(c)
		return v
	}
}

export const coreToComp = <T> (core: VCore<T>) => (v: T) => core.parse(v).valid