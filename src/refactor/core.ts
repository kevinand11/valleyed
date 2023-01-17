import { Rule, Sanitizer } from '../validators'
import { arrayContains, isDeepEqualTo, isShallowEqualTo } from '../rules'

type Validator<T> = { func: Rule<T>, type: 'rule' } | { type: 'sanitizer', func: Sanitizer<T> }

export class VBase<T> {
	protected options = {
		required: false,
		nullable: false
	}
	private validators: Validator<T>[] = []

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
		if (this.validators.length === 0) return { isValid: true, error: '', value }
		if (!presence) return { isValid: true, error: '', value }
		if (value === null && this.options.nullable) return { isValid: true, error: '', value }

		for (const validator of validators) {
			if (validator.type === 'sanitizer') value = validator.func(value)
			else if (validator.type === 'rule') {
				const { valid, error } = validator.func(value)
				if (!valid) return { isValid: false, error: error ?? '', value }
			}
		}

		return { isValid: true, error: '', value }
	}
}

export class VCore<T> extends VBase<T> {
	required (value = true) {
		this.options.required = value
		return this
	}

	nullable (value = true) {
		this.options.nullable = value
		return this
	}

	eq (compare: T, err?: string) {
		return this.addRule((val: T) => isShallowEqualTo(val, compare, err))
	}

	eqD (compare: T, comparer: (val: T, compare: T) => boolean, err?: string) {
		return this.addRule((val: T) => isDeepEqualTo(val, compare, comparer, err))
	}

	in (array: T[], comparer: (curr: T, val: T) => boolean, err?: string) {
		return this.addRule((val: T) => arrayContains(val, array, comparer, err))
	}
}
