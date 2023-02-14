import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isShallowEqualTo = <Type>(compare: Type, error?: string) => makeRule<Type>((value) => {
	error = error ?? `is not equal to ${compare}`
	if (value === compare) return isValid(value)
	return isInvalid([error], value)
})

export const isDeepEqualTo = <Type>(compare: Type, comparer: (val: Type, compare: Type) => boolean, error?: string) => makeRule<Type>((value) => {
	error = error ?? `is not equal to ${compare}`
	if (comparer(value, compare)) return isValid(value)
	return isInvalid([error], value)
})

export const arrayContains = <Type>(array: Type[], comparer: (val: Type, curr: Type) => boolean, error?: string) => makeRule<Type>((value) => {
	error = error ?? `is not in the supported list [${array.join(',')}]`
	if (array.find((x) => comparer(value, x))) return isValid(value)
	return isInvalid([error], value)
})