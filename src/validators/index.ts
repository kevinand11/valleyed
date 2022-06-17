export type Rule = (value: any) => { valid: true, error: null } | { valid: false, error: string }

type Options = {
	required: boolean | (() => boolean),
	nullable: boolean
}

export class Validator {
	private static DEFAULT_OPTIONS: Options = {
		required: true,
		nullable: false
	}

	public static single (value: any, rules: Rule[], options: Partial<Options>) {
		const allOptions = { ...this.DEFAULT_OPTIONS, ...options }
		const presence = typeof allOptions.required === 'function' ? allOptions.required() : allOptions.required
		if (rules.length === 0) return { isValid: true, errors: [] }
		if (!presence) return { isValid: true, errors: [] }
		if (value === null && allOptions.nullable) return { isValid: true, errors: [] }

		const checks = rules.map((rule) => rule(value))
		const valid = checks.every((r) => r.valid)
		const errors = checks.map((r) => r.error)
			.filter((e) => e !== null) as string[]

		return { isValid: valid, errors }
	}
}
