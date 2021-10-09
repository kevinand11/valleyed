import { isArray, isArrayOf, isBoolean, isNumber, isString } from '../../rules'

export const isStringX = (error?: string) => (val: any) => isString(val, error)
export const isNumberX = (error?: string) => (val: any) => isNumber(val, error)
export const isBooleanX = (error?: string) => (val: any) => isBoolean(val, error)
export const isArrayX = (error?: string) => (val: any) => isArray(val, error)

export function isArrayOfX<Type> (comparer: (curr: Type) => boolean, type: string, error?: string) {
	return (val: Type[]) => isArrayOf(val, comparer, type, error)
}