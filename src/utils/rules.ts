export type Rule<T> = (value: T) => ReturnType<typeof isValid<T>> | ReturnType<typeof isInvalid<T>>
export type Sanitizer<T> = (value: T) => T
export type Transformer<I, O> = (value: I) => O

export type Options = {
	required: boolean | (() => boolean),
	nullable: boolean
}

export const isValid = <T> (value: T): { valid: true, error: null, value: T } => ({ valid: true, error: null, value })

export const isInvalid = <T> (error: string, value: T): { valid: false, error: string, value: T } => ({ valid: false, error, value })

export const makeRule = <T> (func: Rule<T>): Rule<T> => (val: T) => func(val)
export const makeSanitizer = <T> (func: Sanitizer<T>) => (val: T) => func(val)

export const check = <T> (value: T, rules: Rule<T>[], options?: Partial<Options>) => {
	const allOptions = { required: true, nullable: false, ...(options ?? {}) }

	if (rules.length === 0) return { valid: true, errors: [], value }
	const presence = typeof allOptions.required === 'function' ? allOptions.required() : allOptions.required
	if (!presence) return { valid: true, errors: [], value }
	if (value === null && allOptions.nullable) return { valid: true, errors: [], value }

	const res = rules.reduce((acc, rule) => {
		const v = rule(acc.value)
		acc.valid = acc.valid && v.valid
		if (v.valid) acc.value = v.value
		else acc.errors.add(v.error)
		return acc
	}, { value, valid: true, errors: new Set<string>() })

	return { ...res, errors: [...res.errors] }
}