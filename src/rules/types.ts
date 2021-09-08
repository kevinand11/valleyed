import { isInvalid, isValid } from '../utils/rules'

export const isBoolean = (value: any) => {
	if (value === true || value === false) return isValid()
	return isInvalid('is not a boolean')
}

export const isNumber = (value: any) => {
	if (typeof value === 'number' && !isNaN(value)) return isValid()
	return isInvalid('is not a number')
}

export const isString = (value: any) => {
	if (value.constructor.name === 'String') return isValid()
	return isInvalid('is not a string')
}

export const isArray = (value: any) => {
	if (Array.isArray(value)) return isValid()
	return isInvalid('is not an array')
}

export function isArrayOf<Type> (value: Type[], comparer: (cur: Type) => boolean, type: string) {
	if (!Array.isArray(value)) return isInvalid('is not an array')
	if (value.every((v) => comparer(v))) return isValid()
	return isInvalid(`array has some values that are not ${ type }`)
}