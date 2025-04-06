import { stripHTML } from '../utils/functions'
import { emailRegex, urlRegex } from '../utils/regexes'
import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isString = (error = 'is not a string') =>
	makeRule<any>((value) => {
		if (value === null || value === undefined) return isInvalid([error], value)
		if (!value.constructor) return isInvalid([error], value)
		if (value.constructor.name !== 'String') return isInvalid([error], value)
		return isValid(value)
	})

export const isLengthOf = (length: number, stripHTMLTags = false, error?: string) =>
	makeRule<string>((value) => {
		const v = isString()(value)
		if (!v.valid) return v
		const val = value as string
		error = error ?? `must contain ${length} characters`
		if ((stripHTMLTags ? stripHTML(val) : val).trim().length === length) return isValid(val)
		return isInvalid([error], val)
	})

export const isMinOf = (length: number, stripHTMLTags = false, error?: string) =>
	makeRule<string>((value) => {
		const v = isString()(value)
		if (!v.valid) return v
		const val = value as string
		error = error ?? `must contain ${length} or more characters`
		if ((stripHTMLTags ? stripHTML(val) : val).trim().length >= length) return isValid(val)
		return isInvalid([error], val)
	})

export const isMaxOf = (length: number, stripHTMLTags = false, error?: string) =>
	makeRule<string>((value) => {
		const v = isString()(value)
		if (!v.valid) return v
		const val = value as string
		error = error ?? `must contain ${length} or less characters`
		if ((stripHTMLTags ? stripHTML(val) : val).trim().length <= length) return isValid(val)
		return isInvalid([error], val)
	})

export const isEmail = (error = 'is not a valid email') =>
	makeRule<string>((value) => {
		const v = isString()(value)
		if (!v.valid) return v
		const val = value as string
		return emailRegex.test(val) ? isValid(val) : isInvalid([error], val)
	})

export const isUrl = (error = 'is not a valid url') =>
	makeRule<string>((value) => {
		const v = isString()(value)
		if (!v.valid) return v
		const val = value as string
		return urlRegex().test(val) ? isValid(val) : isInvalid([error], val)
	})
