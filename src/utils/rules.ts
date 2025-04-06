export type Rule<T> = (value: unknown) => ReturnType<typeof isValid<T>> | ReturnType<typeof isInvalid<T>>
export type Sanitizer<T> = (value: T) => T
export type Transformer<I, O> = (value: I) => O

export type Options = {
	required: boolean | (() => boolean)
	nullable: boolean
	ignoreRulesIfNotRequired?: boolean
}

export const isValid = <T>(value: T, ignored = false): { valid: true; errors: string[]; value: T; ignored: boolean } => ({
	valid: true,
	errors: [],
	value,
	ignored,
})

export const isInvalid = <T>(errors: string[], value: T): { valid: false; errors: string[]; value: unknown; ignored: boolean } => ({
	valid: false,
	errors,
	value,
	ignored: false,
})

export const makeRule =
	<T>(func: Rule<T>): Rule<T> =>
	(val: unknown) =>
		func(val)
export const makeSanitizer =
	<T>(func: Sanitizer<T>) =>
	(val: T) =>
		func(val)

export const check = <T>(value: T, rules: Rule<T>[], options?: Partial<Options>): ReturnType<Rule<T>> => {
	const allOptions = { required: true, nullable: false, ignoreRulesIfNotRequired: false, ...(options ?? {}) }

	if (rules.length === 0) return { valid: true, errors: [], value, ignored: false }
	const presence = typeof allOptions.required === 'function' ? allOptions.required() : allOptions.required
	if (!presence && (value === undefined || allOptions.ignoreRulesIfNotRequired)) return { valid: true, errors: [], value, ignored: true }
	if (value === null && allOptions.nullable) return { valid: true, errors: [], value, ignored: true }

	let res = { errors: [] as string[], valid: true, value }

	for (const rule of rules) {
		res = rule(res.value) as any
		if (!res.valid) break
	}

	return { ...res, errors: [...new Set(res.errors)], ignored: false }
}
