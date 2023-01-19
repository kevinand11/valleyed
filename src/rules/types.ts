import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isUndefined = (error = 'is not undefined') => makeRule<any>((value) => {
	if (value === undefined) return isValid()
	return isInvalid(error)
})

export const isNull = (error = 'is not null') => makeRule<any>((value) => {
	if (value === null) return isValid()
	return isInvalid(error)
})

export const isBoolean = (error = 'is not a boolean') => makeRule<any>((value) => {
	if (value === true || value === false) return isValid()
	return isInvalid(error)
})

export const isInstanceOf = <T> (classDef: new () => T, error?: string) => makeRule<any>((value) => {
	error = error ?? `is not an instance of ${classDef.name}`
	if (value instanceof classDef) return isValid()
	return isInvalid(error)
})