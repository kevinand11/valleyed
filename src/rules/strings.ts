import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isLengthOf = (length: number, error?: string) => makeRule<string>((value) => {
	error = error ?? `must contain ${length} characters`
	if ((value?.trim?.() ?? undefined)?.length === length) return isValid()
	return isInvalid(error)
})

export const isMinOf = (length: number, error?: string) => makeRule<string>((value) => {
	error = error ?? `must contain ${length} or more characters`
	if ((value?.trim?.() ?? undefined)?.length >= length) return isValid()
	return isInvalid(error)
})

export const isMaxOf = (length: number, error?: string) => makeRule<string>((value) => {
	error = error ?? `must contain ${length} or less characters`
	if ((value?.trim?.() ?? undefined)?.length <= length) return isValid()
	return isInvalid(error)
})
