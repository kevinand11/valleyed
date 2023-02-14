import { isInvalid, isValid, makeRule } from '../utils/rules'
import { isArray } from './arrays'

export type GetMap<T extends ReadonlyArray<any>> = readonly [...T]
type Func<T> = (v: T, idx: number) => boolean
type ExtractArgs<T extends ReadonlyArray<Func<any>>> =
	{ [K in keyof T]: T[K] extends Func<infer V> ? V : never }

export const isTuple = <T extends ReadonlyArray<Func<any>>> (
	comparer: GetMap<T>, error?: string
) => makeRule<ExtractArgs<T>>((value) => {
	const v = isArray()(value)
	if (!v.valid) return v
	if (comparer.length !== value.length) return isInvalid(['value length is not equal to comparer length'], value)
	const invIndex = comparer.findIndex((c, i) => !c(value[i], i))
	const invalid = invIndex !== -1
	error = error ?? `contains an invalid value at index ${invIndex}`
	return invalid ? isInvalid([error], value) : isValid(value)
})