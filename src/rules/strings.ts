import { isInvalid, isValid, makeRule } from '../utils/rules'
import { emailRegex, urlRegex } from '../utils/regexes'

export const isString = (error = 'is not a string') => makeRule<any>((value) => {
	if (value === null || value === undefined) return isInvalid(error)
	if (!value.constructor) return isInvalid(error)
	if (value.constructor.name !== 'String') return isInvalid(error)
	return isValid()
})

export const isLengthOf = (length: number, error?: string) => makeRule<string>((value) => {
	const v = isString()(value)
	if (!v.valid) return v
	error = error ?? `must contain ${length} characters`
	if ((value?.trim?.() ?? undefined)?.length === length) return isValid()
	return isInvalid(error)
})

export const isMinOf = (length: number, error?: string) => makeRule<string>((value) => {
	const v = isString()(value)
	if (!v.valid) return v
	error = error ?? `must contain ${length} or more characters`
	if ((value?.trim?.() ?? undefined)?.length >= length) return isValid()
	return isInvalid(error)
})

export const isMaxOf = (length: number, error?: string) => makeRule<string>((value) => {
	const v = isString()(value)
	if (!v.valid) return v
	error = error ?? `must contain ${length} or less characters`
	if ((value?.trim?.() ?? undefined)?.length <= length) return isValid()
	return isInvalid(error)
})

export const isEmail = (error = 'is not a valid email') => makeRule<string>((value) => {
	const v = isString()(value)
	if (!v.valid) return v
	return emailRegex.test(value) ? isValid() : isInvalid(error)
})

export const isUrl = (error = 'is not a valid url') => makeRule<string>((value) => {
	const v = isString()(value)
	if (!v.valid) return v
	return urlRegex.test(value) ? isValid() : isInvalid(error)
})