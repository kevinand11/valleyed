import { check, Rule, Sanitizer } from '../utils/rules'
import { and, arrayContains, isDeepEqualTo, isShallowEqualTo, or } from '../rules'

export class VBase<T> {
	protected options = {
		required: true,
		nullable: false
	}
	private _sanitizers: Sanitizer<T>[] = []

	private _rules: Rule<T>[] = []

	get rules () {
		return this._rules
	}

	parse (value: T) {
		value = this.sanitize(value)
		const v = check(value, this._rules, this.options)
		return {
			valid: v.valid,
			error: v.errors[0] ?? '',
			value
		}
	}

	sanitize (value: T) {
		for (const sanitizer of this._sanitizers) value = sanitizer(value)
		return value
	}

	addRule (rule: Rule<T>) {
		this._rules.push(rule)
		return this
	}

	addSanitizer (sanitizer: Sanitizer<T>) {
		this._sanitizers.push(sanitizer)
		return this
	}
}

export class VCore<T> extends VBase<T> {
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

	default (def: T) {
		return this.addSanitizer((val: T) => val ?? def)
	}

	eq (compare: T, err?: string) {
		return this.addRule(isShallowEqualTo(compare, err))
	}

	eqD (compare: T, comparer: (val: T, compare: T) => boolean, err?: string) {
		return this.addRule(isDeepEqualTo(compare, comparer, err))
	}

	in (array: T[], comparer: (curr: T, val: T) => boolean, err?: string) {
		return this.addRule(arrayContains(array, comparer, err))
	}

	or (rules: VCore<T>[]) {
		return this.addRule(or(rules.map((v) => v.rules)))
	}

	and (rules: VCore<T>[]) {
		return this.addRule(and(rules.map((v) => v.rules)))
	}
}
