import { isValid } from '../utils/rules'

export type Rule = (value: any) => { valid: true, error: null } | { valid: false, error: string }

export class Validator {
	public static single (value: any, rules: Rule[], presence = true) {
		if (rules.length === 0) return { isValid: true, errors: [] }

		const checks = rules.map((rule) => presence ? rule(value) : isValid())
		const valid = checks.every((r) => r.valid)
		const errors = checks.map((r) => r.error)
			.filter((e) => e !== null) as string[]

		return { isValid: valid, errors }
	}
}
