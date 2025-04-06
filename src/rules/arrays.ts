import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isArray = (error = 'is not an array') =>
	makeRule<any>((value) => {
		if (Array.isArray(value)) return isValid(value)
		return isInvalid([error], value)
	})

export const hasLengthOf = <Type>(length: number, error?: string) =>
	makeRule<Type[]>((value) => {
		const v = isArray()(value)
		if (!v.valid) return v
		error = error ?? `must contain ${length} items`
		const val = value as Type[]
		if (val.length === length) return isValid(val)
		return isInvalid([error], val)
	})

export const hasMinOf = <Type>(length: number, error?: string) =>
	makeRule<Type[]>((value) => {
		const v = isArray()(value)
		if (!v.valid) return v
		error = error ?? `must contain ${length} or more items`
		const val = value as Type[]
		if (val.length >= length) return isValid(val)
		return isInvalid([error], val)
	})

export const hasMaxOf = <Type>(length: number, error?: string) =>
	makeRule<Type[]>((value) => {
		const v = isArray()(value)
		if (!v.valid) return v
		error = error ?? `must contain ${length} or less items`
		const val = value as Type[]
		if (val.length <= length) return isValid(val)
		return isInvalid([error], val)
	})

export const isArrayOf = <Type>(comparer: (cur: Type, idx: number) => boolean, error?: string) =>
	makeRule<Type[]>((value) => {
		const v = isArray()(value)
		if (!v.valid) return v

		const val = value as Type[]

		const invIndex = val.findIndex((elem, i) => !comparer(elem, i))
		const invalid = invIndex !== -1
		error = error ?? `contains invalid values at index ${invIndex}`
		return invalid ? isInvalid([error], val) : isValid(val)
	})
