import {
	arrayContains,
	hasLessThan,
	hasLessThanOrEqualTo,
	hasMoreThan,
	hasMoreThanOrEqualTo,
	isDeepEqualTo,
	isExtractedHTMLLongerThan,
	isLessThan,
	isLessThanOrEqualTo,
	isLongerThan,
	isLongerThanOrEqualTo,
	isMoreThan,
	isMoreThanOrEqualTo,
	isShallowEqualTo,
	isShorterThan,
	isShorterThanOrEqualTo
} from '../../rules'

export const isLongerThanX = (length: number, error?: string) => (val: string) => isLongerThan(val, length, error)
export const isLongerThanOrEqualToX = (length: number, error?: string) => (val: string) => isLongerThanOrEqualTo(val, length, error)
export const isShorterThanX = (length: number, error?: string) => (val: string) => isShorterThan(val, length, error)
export const isShorterThanOrEqualToX = (length: number, error?: string) => (val: string) => isShorterThanOrEqualTo(val, length, error)
export const isExtractedHTMLLongerThanX = (length: number, error?: string) => (val: string) => isExtractedHTMLLongerThan(val, length, error)
export const isExtractedHTMLLongerThanOrEqualToX = (length: number, error?: string) => (val: string) => isExtractedHTMLLongerThan(val, length, error)
export const isExtractedHTMLShorterThanX = (length: number, error?: string) => (val: string) => isExtractedHTMLLongerThan(val, length, error)
export const isExtractedHTMLShorterThanOrEqualToX = (length: number, error?: string) => (val: string) => isExtractedHTMLLongerThan(val, length, error)

export function hasMoreThanX<Type> (length: number, error?: string) {
	return (val: Type[]) => hasMoreThan(val, length, error)
}

export function hasMoreThanOrEqualToX<Type> (length: number, error?: string) {
	return (val: Type[]) => hasMoreThanOrEqualTo(val, length, error)
}

export function hasLessThanX<Type> (length: number, error?: string) {
	return (val: Type[]) => hasLessThan(val, length, error)
}

export function hasLessThanOrEqualToX<Type> (length: number, error?: string) {
	return (val: Type[]) => hasLessThanOrEqualTo(val, length, error)
}

export function isShallowEqualToX<Type> (compare: Type, error?: string) {
	return (val: Type) => isShallowEqualTo(val, compare, error)
}

export function isDeepEqualToX<Type> (compare: Type, comparer: (curr: Type, val: Type) => boolean, error?: string) {
	return (val: Type) => isDeepEqualTo(val, compare, comparer, error)
}

export const isMoreThanX = (length: number, error?: string) => (val: number) => isMoreThan(val, length, error)
export const isMoreThanOrEqualToX = (length: number, error?: string) => (val: number) => isMoreThanOrEqualTo(val, length, error)
export const isLessThanX = (length: number, error?: string) => (val: number) => isLessThan(val, length, error)
export const isLessThanOrEqualToX = (length: number, error?: string) => (val: number) => isLessThanOrEqualTo(val, length, error)

export function arrayContainsX<Type> (array: Type[], comparer: (curr: Type, val: Type) => boolean, error?: string) {
	return (val: Type) => arrayContains(val, array, comparer, error)
}