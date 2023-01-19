import { check, Rule, Sanitizer } from '../utils/rules'
import { arrayContains, isDeepEqualTo, isShallowEqualTo } from '../rules'

export class VBase<I, O = I> {
	forced = false as (I extends O ? false : true)
	protected options = {
		original: false,
		required: true,
		nullable: false
	}
	private _sanitizers: Sanitizer<any>[] = []

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
		return value as unknown as O
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
		this.forced = c.forced as any
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

	default (def: I) {
		return this.addSanitizer((val: I) => val ?? def)
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
}

export class VPartial<I, O, P> extends VCore<I | P, O | P> {
	static create<I, O, P> (c: VCore<I, O>) {
		const v = new VPartial<I, O, P>()
		v.clone(c)
		return v
	}
}