export type Rule<T> = (value: unknown) => ReturnType<typeof isValid<T>> | ReturnType<typeof isInvalid<T>>
export type Sanitizer<T> = (value: T) => T
export type Transformer<I, O> = (value: I) => O

export type Options = {
	required: boolean | (() => boolean),
	nullable: boolean,
	ignoreRulesIfNotRequired?: boolean,
}

export const isValid = <T> (value: T): { valid: true, errors: string[], value: T } => ({ valid: true, errors: [], value })

export const isInvalid = <T> (errors: string[], value: T): { valid: false, errors: string[], value: unknown } => ({ valid: false, errors, value })

export const makeRule = <T> (func: Rule<T>): Rule<T> => (val: unknown) => func(val)
export const makeSanitizer = <T> (func: Sanitizer<T>) => (val: T) => func(val)

export const check = <T> (value: T, rules: Rule<T>[], options?: Partial<Options>): ReturnType<Rule<T>> => {
	const allOptions = { required: true, nullable: false, ignoreRulesIfNotRequired: false, ...(options ?? {}) }

	if (rules.length === 0) return { valid: true, errors: [], value }
	const presence = typeof allOptions.required === 'function' ? allOptions.required() : allOptions.required
	if (!presence && (value === undefined || allOptions.ignoreRulesIfNotRequired)) return { valid: true, errors: [], value }
	if (value === null && allOptions.nullable) return { valid: true, errors: [], value }

	let res = { errors: [] as string[], valid: true, value }

	for (const rule of rules) {
		res = rule(res.value) as any
		if (!res.valid) break
	}

	return { ...res, errors: [...new Set(res.errors)] }
}