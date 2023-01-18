import { isInvalid, isValid, makeRule } from '../utils/rules'
import { isArray } from './types'

export const hasLengthOf = <Type> (length: number, error?: string) => makeRule<Type[]>((value) => {
	error = error ?? `must contain ${length} items`
	if (value?.length === length) return isValid()
	return isInvalid(error)
})

export const hasMinOf = <Type> (length: number, error?: string) => makeRule<Type[]>((value) => {
	error = error ?? `must contain ${length} or more items`
	if (value?.length >= length) return isValid()
	return isInvalid(error)
})

export const hasMaxOf = <Type> (length: number, error?: string) => makeRule<Type[]>((value) => {
	error = error ?? `must contain ${length} or less items`
	if (value?.length <= length) return isValid()
	return isInvalid(error)
})

export const isArrayOf = <T> (comparer: (cur: T) => boolean, type: string, error?: string) => makeRule<T[]>((value) => {
	error = error ?? `contains some values that are not ${type}`
	const validArray = isArray()(value)
	if (!validArray.valid) return validArray
	if (value.every((v) => comparer(v))) return isValid()
	return isInvalid(error)
})
