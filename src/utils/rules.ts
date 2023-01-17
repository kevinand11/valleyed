export type Rule<T> = (value: T) => ReturnType<typeof isValid> | ReturnType<typeof isInvalid>
export type Sanitizer<T = void> = (value: T) => T

export type Options = {
	required: boolean | (() => boolean),
	nullable: boolean
}

export const isValid = (): { valid: true, error: null } => ({ valid: true, error: null })

export const isInvalid = (error: string): { valid: false, error: string } => ({ valid: false, error })

export const makeRule = <T> (func: Rule<T>): Rule<T> => (val: T) => func(val)

export const check = <T> (value: T, rules: Rule<T>[], options: Partial<Options>) => {
	const allOptions = { required: true, nullable: false, ...options }
	const presence = typeof allOptions.required === 'function' ? allOptions.required() : allOptions.required
	if (rules.length === 0) return { valid: true, errors: [] }
	if (!presence) return { valid: true, errors: [] }
	if (value === null && allOptions.nullable) return { valid: true, errors: [] }

	const checks = rules.map((rule) => rule(value))
	const valid = checks.every((r) => r.valid)
	const errors = checks.map((r) => r.error)
		.filter((e) => e !== null) as string[]

	return { valid, errors }
}