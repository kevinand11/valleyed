import {
	arrayContains,
	hasLessThan,
	hasMoreThan,
	isArrayOf,
	isDeepEqualTo,
	isExtractedHTMLLongerThan,
	isLessThan,
	isLongerThan,
	isMoreThan,
	isRequiredIf,
	isShallowEqualTo,
	isShorterThan
} from '../rules'

export function isRequiredIfX<Type> (condition: boolean) {
	return (val: Type) => isRequiredIf(val, condition)
}

export const isLongerThanX = (length: number) => (val: string) => isLongerThan(val, length)
export const isShorterThanX = (length: number) => (val: string) => isShorterThan(val, length)
export const isExtractedHTMLLongerThanX = (length: number) => (val: string) => isExtractedHTMLLongerThan(val, length)

export function hasMoreThanX<Type> (length: number) {
	return (val: Type[]) => hasMoreThan(val, length)
}

export function hasLessThanX<Type> (length: number) {
	return (val: Type[]) => hasLessThan(val, length)
}

export function isShallowEqualToX<Type> (compare: Type) {
	return (val: Type) => isShallowEqualTo(val, compare)
}

export function isDeepEqualToX<Type> (compare: Type, comparer: (curr: Type, val: Type) => boolean) {
	return (val: Type) => isDeepEqualTo(val, compare, comparer)
}

export const isMoreThanX = (length: number) => (val: number) => isMoreThan(val, length)
export const isLessThanX = (length: number) => (val: number) => isLessThan(val, length)

export function arrayContainsX<Type> (array: Type[], comparer: (curr: Type, val: Type) => boolean) {
	return (val: Type) => arrayContains(val, array, comparer)
}

export function isArrayOfX<Type> (comparer: (curr: Type) => boolean, type: string) {
	return (val: Type[]) => isArrayOf(val, comparer, type)
}