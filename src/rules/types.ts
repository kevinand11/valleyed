import { isInvalid, isValid } from '../utils/rules'

export const isUndefined = (value: any, error = 'is not undefined') => {
	if (value === undefined) return isValid()
	return isInvalid(error)
}

export const isNull = (value: any, error = 'is not null') => {
	if (value === null) return isValid()
	return isInvalid(error)
}

export const isBoolean = (value: any, error = 'is not a boolean') => {
	if (value === true || value === false) return isValid()
	return isInvalid(error)
}

export const isNumber = (value: any, error = 'is not a number') => {
	if (typeof value === 'number' && !isNaN(value)) return isValid()
	return isInvalid(error)
}

export const isString = (value: any, error = 'is not a string') => {
	if (value === null || value === undefined) return isInvalid(error)
	if (!value.constructor) return isInvalid(error)
	if (value.constructor.name !== 'String') return isInvalid(error)
	return isValid()
}

export const isArray = (value: any, error = 'is not an array') => {
	if (Array.isArray(value)) return isValid()
	return isInvalid(error)
}

export function isArrayOf<Type> (value: Type[], comparer: (cur: Type) => boolean, type: string, error?: string) {
	error = error ?? `contains some values that are not ${type}`
	const validArray = isArray(value)
	if (!validArray.valid) return validArray
	if (value.every((v) => comparer(v))) return isValid()
	return isInvalid(error)
}