import {
	arrayContains,
	hasLessThan,
	hasMoreThan,
	isArrayOf,
	isExtractedHTMLLongerThan,
	isLessThan,
	isLongerThan,
	isMoreThan,
	isRequiredIf,
	isShallowEqualTo,
	isShorterThan
} from '../rules'

export const isRequiredIfX = (condition: boolean) => (val: any) => isRequiredIf(val, condition)

export const isLongerThanX = (length: number) => (val: string) => isLongerThan(val, length)
export const isShorterThanX = (length: number) => (val: string) => isShorterThan(val, length)
export const isExtractedHTMLLongerThanX = (length: number) => (val: string) => isExtractedHTMLLongerThan(val, length)
export const hasMoreThanX = (length: number) => (val: any[]) => hasMoreThan(val, length)
export const hasLessThanX = (length: number) => (val: any[]) => hasLessThan(val, length)
export const isShallowEqualToX = (length: number) => (val: any) => isShallowEqualTo(val, length)
export const isMoreThanX = (length: number) => (val: any) => isMoreThan(val, length)
export const isLessThanX = (length: number) => (val: any) => isLessThan(val, length)

export function arrayContainsX<Type> (array: Type[], comparer: (curr: Type, val: Type) => boolean) {
	return (val: Type) => arrayContains(val, array, comparer)
}

export function isArrayOfX<Type> (comparer: (curr: Type) => boolean, type: string) {
	return (val: Type[]) => isArrayOf(val, comparer, type)
}