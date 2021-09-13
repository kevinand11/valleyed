import { extractTextFromHTML } from '../santizers'
import { isInvalid, isValid } from '../utils/rules'

export const isLongerThan = (value: string, length: number) => {
	if ((value?.trim?.() ?? undefined)?.length > length) return isValid()
	return isInvalid(`must contain more than ${length} characters`)
}

export const isShorterThan = (value: string, length: number) => {
	if ((value?.trim?.() ?? undefined)?.length < length) return isValid()
	return isInvalid(`must contain less than ${length} characters`)
}

export const isExtractedHTMLLongerThan = (value: string, length: number) => {
	return isLongerThan(extractTextFromHTML(value ?? ''), length)
}

export function hasMoreThan<Type> (value: Type[], length: number) {
	if (value?.length > length) return isValid()
	return isInvalid(`must contain more than ${length} items`)
}

export function hasLessThan<Type> (value: Type[], length: number) {
	if (value?.length < length) return isValid()
	return isInvalid(`must contain less than ${length} items`)
}

export function isShallowEqualTo<Type> (value: Type, compare: Type) {
	if (value === compare) return isValid()
	return isInvalid('is not equal')
}

export function isDeepEqualTo<Type> (value: Type, compare: Type, comparer: (val: Type, compare: Type) => boolean) {
	if (comparer(value, compare)) return isValid()
	return isInvalid('is not equal')
}

export const isMoreThan = (value: number, compare: number) => {
	if (value > compare) return isValid()
	return isInvalid(`must be greater than ${compare}`)
}

export const isLessThan = (value: number, compare: number) => {
	if (value < compare) return isValid()
	return isInvalid(`must be less than ${compare}`)
}

export function arrayContains<Type> (value: Type, array: Type[], comparer: (curr: Type, val: Type) => boolean) {
	if (array.find((x) => comparer(x, value))) return isValid()
	return isInvalid('value is not in the supported list')
}