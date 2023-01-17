import { Rule, Sanitizer } from '../utils/rules'
import { and, arrayContains, isDeepEqualTo, isShallowEqualTo, or } from '../rules'

type Validator<T> = { func: Rule<T>, type: 'rule' } | { type: 'sanitizer', func: Sanitizer<T> }

export class VBase<T> {
	protected options = {
		required: true,
		nullable: false
	}
	private validators: Validator<T>[] = []

	get rules () {
		return this.validators.filter((v) => v.type === 'rule').map((r) => r.func) as Rule<T>[]
	}

	parse (value: T) {
		return this.run(value, this.validators)
	}

	sanitize (value: T) {
		return this.run(value, this.validators.filter((v) => v.type === 'sanitizer'))
	}

	protected addRule (rule: Rule<T>) {
		this.validators.push({ type: 'rule', func: rule })
		return this
	}

	protected addSanitizer (sanitizer: Sanitizer<T>) {
		this.validators.push({ type: 'sanitizer', func: sanitizer })
		return this
	}

	private run (value: T, validators: Validator<T>[]) {
		const presence = this.options.required
		if (validators.length === 0) return { valid: true, error: '', value }
		if (!presence) return { valid: true, error: '', value }
		if (value === null && this.options.nullable) return { valid: true, error: '', value }

		for (const validator of validators) {
			if (validator.type === 'sanitizer') value = validator.func(value)
			else if (validator.type === 'rule') {
				const { valid, error } = validator.func(value)
				if (!valid) return { valid: false, error: error ?? '', value }
			}
		}

		return { valid: true, error: '', value }
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
