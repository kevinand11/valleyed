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

export const isNumber = (error = 'is not a number') => makeRule<any>((value) => {
	if (typeof value === 'number' && !isNaN(value)) return isValid()
	return isInvalid(error)
})

export const isString = (error = 'is not a string') => makeRule<any>((value) => {
	if (value === null || value === undefined) return isInvalid(error)
	if (!value.constructor) return isInvalid(error)
	if (value.constructor.name !== 'String') return isInvalid(error)
	return isValid()
})

export const isArray = (error = 'is not an array') => makeRule<any>((value) => {
	if (Array.isArray(value)) return isValid()
	return isInvalid(error)
})