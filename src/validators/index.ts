import { check, Options, Rule } from '../utils/rules'

type Validity<T> = ReturnType<Rule<T>>

export class Validator {
	public static and<T>(value: T, rules: Rule<any>[][], options?: Partial<Options>) : Validity<T> {
		for (const rule of rules) {
			const valid = check(value, rule, options)
			if (valid.valid) continue
			else return valid
		}
		return { valid: true, value: value, errors: [] }
	}


	public static or<T>(value: T, rules: Rule<any>[][], options?: Partial<Options>) : Validity<T> {
		for (const rule of rules) {
			const valid = check(value, rule, options)
			if (valid.valid) return valid
			else continue
		}
		return { valid: false, value: value, errors: ['doesn\'t match any of the schema'] }
	}
}
