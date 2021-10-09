import { extractTextFromHTML } from '../santizers'
import { isInvalid, isValid } from '../utils/rules'

export const isLongerThan = (value: string, length: number, error?: string) => {
	error = error ?? `must contain more than ${length} characters`
	if ((value?.trim?.() ?? undefined)?.length > length) return isValid()
	return isInvalid(error)
}

export const isShorterThan = (value: string, length: number, error?: string) => {
	error = error ?? `must contain less than ${length} characters`
	if ((value?.trim?.() ?? undefined)?.length < length) return isValid()
	return isInvalid(error)
}

export const isExtractedHTMLLongerThan = (value: string, length: number, error?: string) => {
	return isLongerThan(extractTextFromHTML(value ?? ''), length, error)
}

export function hasMoreThan<Type> (value: Type[], length: number, error?: string) {
	error = error ?? `must contain more than ${length} items`
	if (value?.length > length) return isValid()
	return isInvalid(error)
}

export function hasLessThan<Type> (value: Type[], length: number, error?: string) {
	error = error ?? `must contain less than ${length} items`
	if (value?.length < length) return isValid()
	return isInvalid(error)
}

export function isShallowEqualTo<Type> (value: Type, compare: Type, error?: string) {
	error = error ?? `is not equal to ${compare}`
	if (value === compare) return isValid()
	return isInvalid(error)
}

export function isDeepEqualTo<Type> (value: Type, compare: Type, comparer: (val: Type, compare: Type) => boolean, error?: string) {
	error = error ?? `is not equal to ${compare}`
	if (comparer(value, compare)) return isValid()
	return isInvalid(error)
}

export const isMoreThan = (value: number, compare: number, error?: string) => {
	error = error ?? `must be greater than ${compare}`
	if (value > compare) return isValid()
	return isInvalid(error)
}

export const isLessThan = (value: number, compare: number, error?: string) => {
	error = error ?? `must be less than ${compare}`
	if (value < compare) return isValid()
	return isInvalid(error)
}

export function arrayContains<Type> (value: Type, array: Type[], comparer: (curr: Type, val: Type) => boolean, error?: string) {
	error = error ?? `is not in the supported list [${array.join(',')}]`
	if (array.find((x) => comparer(x, value))) return isValid()
	return isInvalid(error)
}