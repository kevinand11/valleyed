import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isShallowEqualTo = <Type>(compare: Type, error?: string) => makeRule<Type>((value) => {
	error = error ?? `is not equal to ${compare}`
	const val = value as Type
	if (value === compare) return isValid(val)
	return isInvalid([error], val)
})

export const isDeepEqualTo = <Type>(compare: Type, comparer: (val: Type, compare: Type) => boolean, error?: string) => makeRule<Type>((value) => {
	error = error ?? `is not equal to ${compare}`
	const val = value as Type
	if (comparer(val, compare)) return isValid(val)
	return isInvalid([error], val)
})

export const arrayContains = <Type>(array: Type[], comparer: (val: Type, curr: Type) => boolean, error?: string) => makeRule<Type>((value) => {
	error = error ?? `is not in the supported list [${array.join(',')}]`
	const val = value as Type
	if (array.find((x) => comparer(val, x))) return isValid(val)
	return isInvalid([error], val)
})