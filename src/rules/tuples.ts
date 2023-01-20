import { isInvalid, isValid, makeRule } from '../utils/rules'
import { isArray } from './arrays'

export type GetMap<T extends any[]> = readonly [...T]
type TupleToCompare<T extends Readonly<any[]>, R> = { [k in keyof T]: (v: T[k]) => R }
type Mapper<A extends any[], B> = TupleToCompare<GetMap<A>, B>

export const isTuple = <T extends any[]> (comparer: Mapper<T, boolean>, error?: string) => makeRule<T>((value) => {
	const v = isArray()(value)
	if (!v.valid) return v

	const invIndex = comparer.findIndex((c, i) => !c(value[i]))
	const invalid = invIndex !== -1
	error = error ?? `contains an invalid value at index ${invIndex}`
	return invalid ? isInvalid(error, value) : isValid(value)
})