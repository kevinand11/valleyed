import { isInvalid, isValid, makeRule } from '../utils/rules'

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

export const arrayContains = <Type> (array: Type[], comparer: (curr: Type, val: Type) => boolean, error?: string) => makeRule<Type>((value) => {
	error = error ?? `is not in the supported list [${array.join(',')}]`
	if (array.find((x) => comparer(x, value))) return isValid()
	return isInvalid(error)
})