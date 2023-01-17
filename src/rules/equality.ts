import { extractTextFromHTML } from '../santizers'
import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isLengthEqual = (length: number, error?: string) => makeRule<string>((value) => {
	error = error ?? `must contain ${length} characters`
	if ((value?.trim?.() ?? undefined)?.length === length) return isValid()
	return isInvalid(error)
})

export const isLongerThan = (length: number, error?: string) => makeRule<string>((value) => {
	error = error ?? `must contain more than ${length} characters`
	if ((value?.trim?.() ?? undefined)?.length > length) return isValid()
	return isInvalid(error)
})

export const isLongerThanOrEqualTo = (length: number, error?: string) => makeRule<string>((value) => {
	error = error ?? `must contain ${length} or more characters`
	if ((value?.trim?.() ?? undefined)?.length >= length) return isValid()
	return isInvalid(error)
})

export const isShorterThan = (length: number, error?: string) => makeRule<string>((value) => {
	error = error ?? `must contain less than ${length} characters`
	if ((value?.trim?.() ?? undefined)?.length < length) return isValid()
	return isInvalid(error)
})

export const isShorterThanOrEqualTo = (length: number, error?: string) => makeRule<string>((value) => {
	error = error ?? `must contain ${length} or less characters`
	if ((value?.trim?.() ?? undefined)?.length <= length) return isValid()
	return isInvalid(error)
})

export const isExtractedHTMLLongerThan = (length: number, error?: string) => makeRule<string>((value) => {
	return isLongerThan(length, error)(extractTextFromHTML(value ?? ''))
})

export const isExtractedHTMLLongerThanOrEqualTo = (length: number, error?: string) => makeRule<string>((value) => {
	return isLongerThanOrEqualTo(length, error)(extractTextFromHTML(value ?? ''))
})

export const isExtractedHTMLShorterThan = (length: number, error?: string) => makeRule<string>((value) => {
	return isShorterThan(length, error)(extractTextFromHTML(value ?? ''))
})

export const isExtractedHTMLShorterThanOrEqualTo = (length: number, error?: string) => makeRule<string>((value) => {
	return isShorterThanOrEqualTo(length, error)(extractTextFromHTML(value ?? ''))
})

export const hasLength = <Type> (length: number, error?: string) => makeRule<Type[]>((value) => {
	error = error ?? `must contain ${length} items`
	if (value?.length === length) return isValid()
	return isInvalid(error)
})

export const hasMoreThan = <Type> (length: number, error?: string) => makeRule<Type[]>((value) => {
	error = error ?? `must contain more than ${length} items`
	if (value?.length > length) return isValid()
	return isInvalid(error)
})

export const hasMoreThanOrEqualTo = <Type> (length: number, error?: string) => makeRule<Type[]>((value) => {
	error = error ?? `must contain ${length} or more items`
	if (value?.length >= length) return isValid()
	return isInvalid(error)
})

export const hasLessThan = <Type> (length: number, error?: string) => makeRule<Type[]>((value) => {
	error = error ?? `must contain less than ${length} items`
	if (value?.length < length) return isValid()
	return isInvalid(error)
})

export const hasLessThanOrEqualTo = <Type> (length: number, error?: string) => makeRule<Type[]>((value) => {
	error = error ?? `must contain ${length} or less items`
	if (value?.length <= length) return isValid()
	return isInvalid(error)
})

export const isShallowEqualTo = <Type> (compare: Type, error?: string) => makeRule<Type>((value) => {
	error = error ?? `is not equal to ${compare}`
	if (value === compare) return isValid()
	return isInvalid(error)
})

export const isDeepEqualTo = <Type> (compare: Type, comparer: (val: Type, compare: Type) => boolean, error?: string) => makeRule<Type>((value) => {
	error = error ?? `is not equal to ${compare}`
	if (comparer(value, compare)) return isValid()
	return isInvalid(error)
})

export const isMoreThan = (compare: number, error?: string) => makeRule<number>((value) => {
	error = error ?? `must be greater than ${compare}`
	if (value > compare) return isValid()
	return isInvalid(error)
})

export const isMoreThanOrEqualTo = (compare: number, error?: string) => makeRule<number>((value) => {
	error = error ?? `must be greater than or equal to ${compare}`
	if (value >= compare) return isValid()
	return isInvalid(error)
})

export const isLessThan = (compare: number, error?: string) => makeRule<number>((value) => {
	error = error ?? `must be less than ${compare}`
	if (value < compare) return isValid()
	return isInvalid(error)
})

export const isLessThanOrEqualTo = (compare: number, error?: string) => makeRule<number>((value) => {
	error = error ?? `must be less than or equal to ${compare}`
	if (value <= compare) return isValid()
	return isInvalid(error)
})

export const arrayContains = <Type> (array: Type[], comparer: (curr: Type, val: Type) => boolean, error?: string) => makeRule<Type>((value) => {
	error = error ?? `is not in the supported list [${array.join(',')}]`
	if (array.find((x) => comparer(x, value))) return isValid()
	return isInvalid(error)
})