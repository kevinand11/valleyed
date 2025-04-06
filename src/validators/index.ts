import type { Options, Rule } from '../utils/rules'
import { check, makeRule } from '../utils/rules'

export class Validator {
	public static and<T>(rules: Rule<T>[][], options?: Partial<Options>): Rule<T> {
		return makeRule<T>((val) => {
			const value = val as T
			let ignored = false
			for (const rule of rules) {
				const valid = check(value, rule, options)
				if (valid.ignored) ignored = true
				if (valid.valid) continue
				else return valid
			}
			return { valid: true, value: value, errors: [], ignored }
		})
	}

	public static or<T>(rules: Rule<T>[][], options?: Partial<Options>): Rule<T> {
		return makeRule<T>((val) => {
			const value = val as T
			let ignored = false
			for (const rule of rules) {
				const valid = check(value, rule, options)
				if (valid.ignored) ignored = true
				if (valid.valid) return valid
				else continue
			}
			return { valid: false, value: value, errors: ["doesn't match any of the schema"], ignored }
		})
	}
}
