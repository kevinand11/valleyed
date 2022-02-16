import { isArray, isBoolean, isNumber, isRequiredIf, isString } from '../rules'

export type Rule = (value: any) => { valid: true, error: null } | { valid: false, error: string }

export class Validator {
	public static single (value: any, rules: Rule[], required: boolean | (() => boolean) = true) {
		const presence = typeof required === 'function' ? required() : required
		if (this.isEmpty(value) && !presence) return { isValid: true, errors: [] }
		if (rules.length === 0) return { isValid: true, errors: [] }

		rules = [(value: any) => isRequiredIf(value, presence), ...rules]

		const checks = rules.map((rule) => rule(value))
		const valid = checks.every((r) => r.valid)
		const errors = checks.map((r) => r.error)
			.filter((e) => e !== null) as string[]

		return { isValid: valid, errors }
	}

	private static isEmpty (val: any) {
		if (val === null || val === undefined) return true
		if (isString(val).valid || isArray(val).valid) return val.length === 0
		if (isNumber(val).valid) return val === 0
		if (isBoolean(val).valid) return true
		else return Object.keys(val).length === 0
	}
}
