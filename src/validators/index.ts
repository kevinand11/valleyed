import { check, Options, Rule } from '../utils/rules'

export class Validator {
	public static single<T = void> (value: T, rules: Rule<T>[], options: Partial<Options>) {
		const { valid, errors } = check(value, rules, options)

		return { isValid: valid, errors }
	}
}
