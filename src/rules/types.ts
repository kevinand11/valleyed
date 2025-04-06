import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isUndefined = (error = 'is not undefined') =>
	makeRule<undefined>((value) => {
		const val = value as undefined
		if (value === undefined) return isValid(val)
		return isInvalid([error], val)
	})

export const isNull = (error = 'is not null') =>
	makeRule<null>((value) => {
		const val = value as null
		if (val === null) return isValid(val)
		return isInvalid([error], val)
	})

export const isBoolean = (error = 'is not a boolean') =>
	makeRule<boolean>((value) => {
		const val = value as boolean
		if (val === true || val === false) return isValid(val)
		return isInvalid([error], val)
	})

export const isInstanceOf = <T>(classDef: new () => T, error?: string) =>
	makeRule<T>((value) => {
		error = error ?? `is not an instance of ${classDef.name}`
		const val = value as T
		if ((val as any)?.constructor === classDef) return isValid(val)
		if (value instanceof classDef) return isValid(val)
		return isInvalid([error], val)
	})
