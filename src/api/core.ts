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

	private _rules: Rule<any>[] = []

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
}

export class VCore<I, O = I> extends VBase<I, O> {
	original (value = true) {
		this.options.original = value
		return this
	}

	optional (value = true) {
		this.options.required = !value
		return this
	}

	nullable (value = true) {
		this.options.nullable = value
		return this
	}

	nullish (value = true) {
		this.optional(value)
		this.nullable(value)
		return this
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
