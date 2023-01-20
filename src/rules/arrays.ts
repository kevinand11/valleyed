import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isArray = (error = 'is not an array') => makeRule<any>((value) => {
	if (Array.isArray(value)) return isValid(value)
	return isInvalid(error, value)
})

export const hasLengthOf = <Type> (length: number, error?: string) => makeRule<Type[]>((value) => {
	const v = isArray()(value)
	if (!v.valid) return v
	error = error ?? `must contain ${length} items`
	if (value.length === length) return isValid(value)
	return isInvalid(error, value)
})

export const hasMinOf = <Type> (length: number, error?: string) => makeRule<Type[]>((value) => {
	const v = isArray()(value)
	if (!v.valid) return v
	error = error ?? `must contain ${length} or more items`
	if (value.length >= length) return isValid(value)
	return isInvalid(error, value)
})

export const hasMaxOf = <Type> (length: number, error?: string) => makeRule<Type[]>((value) => {
	const v = isArray()(value)
	if (!v.valid) return v
	error = error ?? `must contain ${length} or less items`
	if (value.length <= length) return isValid(value)
	return isInvalid(error, value)
})

export const isArrayOf = <T> (comparer: (cur: T, idx: number) => boolean, type: string, error?: string) => makeRule<T[]>((value) => {
	const v = isArray()(value)
	if (!v.valid) return v

	const invIndex = value.findIndex((elem, i) => !comparer(elem, i))
	const invalid = invIndex !== -1
	error = error ?? `contains values that are not ${type} at index ${invIndex}`
	return invalid ? isInvalid(error, value) : isValid(value)
})
