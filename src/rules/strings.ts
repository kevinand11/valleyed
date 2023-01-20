import { isInvalid, isValid, makeRule } from '../utils/rules'
import { emailRegex, urlRegex } from '../utils/regexes'

export const isString = (error = 'is not a string') => makeRule<any>((value) => {
	if (value === null || value === undefined) return isInvalid(error, value)
	if (!value.constructor) return isInvalid(error, value)
	if (value.constructor.name !== 'String') return isInvalid(error, value)
	return isValid(value)
})

export const isLengthOf = (length: number, error?: string) => makeRule<string>((value) => {
	const v = isString()(value)
	if (!v.valid) return v
	value = value.trim()
	error = error ?? `must contain ${length} characters`
	if (value.length === length) return isValid(value)
	return isInvalid(error, value)
})

export const isMinOf = (length: number, error?: string) => makeRule<string>((value) => {
	const v = isString()(value)
	if (!v.valid) return v
	value = value.trim()
	error = error ?? `must contain ${length} or more characters`
	if (value.length >= length) return isValid(value)
	return isInvalid(error, value)
})

export const isMaxOf = (length: number, error?: string) => makeRule<string>((value) => {
	const v = isString()(value)
	if (!v.valid) return v
	value = value.trim()
	error = error ?? `must contain ${length} or less characters`
	if (value.length <= length) return isValid(value)
	return isInvalid(error, value)
})

export const isEmail = (error = 'is not a valid email') => makeRule<string>((value) => {
	const v = isString()(value)
	if (!v.valid) return v
	return emailRegex.test(value) ? isValid(value) : isInvalid(error, value)
})

export const isUrl = (error = 'is not a valid url') => makeRule<string>((value) => {
	const v = isString()(value)
	if (!v.valid) return v
	return urlRegex.test(value) ? isValid(value) : isInvalid(error, value)
})