import { check, makeRule, Options, Rule } from '../utils/rules'

export class Validator {
	public static and<T> (rules: Rule<T>[][], options?: Partial<Options>): Rule<T> {
		return makeRule<T>((val) => {
			const value = val as T
			for (const rule of rules) {
				const valid = check(value, rule, options)
				if (valid.valid) continue
				else return valid
			}
			return { valid: true, value: value, errors: [] }
		})
	}


	public static or<T> (rules: Rule<T>[][], options?: Partial<Options>): Rule<T> {
		return makeRule<T>((val) => {
			const value = val as T
			for (const rule of rules) {
				const valid = check(value, rule, options)
				if (valid.valid) return valid
				else continue
			}
			return { valid: false, value: value, errors: ['doesn\'t match any of the schema'] }
		})
	}
}