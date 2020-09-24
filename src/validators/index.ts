import { Invalid, Valid } from '../utils/rules'

export type Rule = (value: any) => Valid | Invalid

export class Validator {
	public static single(value: any, rules: Rule[]){
		if(rules.length === 0) return { isValid: true, errors: [] }
		const checks = rules.map((rule) => rule(value))
		const isValid = checks.every((r) => r.valid)
		const errors = checks.map((r) => r.error)
			.filter((e) => e !== undefined) as string[]
		return { isValid, errors }
	}
}
