import { Differ } from './../utils/differ'
import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isEqualTo = <Type> (
	compare: Type,
	comparer = Differ.equal as (val: any, compare: Type) => boolean,
	error?: string) => makeRule<Type>((value) => {
		error = error ?? `is not equal to ${compare}`
		const val = value as Type
		if (value === compare) return isValid(val)
		if (comparer(val, compare)) return isValid(val)
		return isInvalid([error], val)
	})

export const arrayContains = <Type> (
	array: Type[],
	comparer = Differ.equal as (val: any, arrayItem: Type) => boolean,
	error?: string) => makeRule<Type>((value) => {
		error = error ?? `is not in the supported list [${array.join(',')}]`
		const val = value as Type
		if (array.find((x) => comparer(val, x))) return isValid(val)
		return isInvalid([error], val)
	})