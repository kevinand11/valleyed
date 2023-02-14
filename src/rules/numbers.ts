import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isNumber = (error = 'is not a number') => makeRule<any>((value) => {
	if (typeof value === 'number' && !isNaN(value)) return isValid(value)
	return isInvalid([error], value)
})

export const isMoreThan = (compare: number, error?: string) => makeRule<number>((value) => {
	const v = isNumber()(value)
	if (!v.valid) return v
	error = error ?? `must be greater than ${compare}`
	const val = value as number
	if (val > compare) return isValid(val)
	return isInvalid([error], val)
})

export const isMoreThanOrEqualTo = (compare: number, error?: string) => makeRule<number>((value) => {
	const v = isNumber()(value)
	if (!v.valid) return v
	error = error ?? `must be greater than or equal to ${compare}`
	const val = value as number
	if (val >= compare) return isValid(val)
	return isInvalid([error], val)
})

export const isLessThan = (compare: number, error?: string) => makeRule<number>((value) => {
	const v = isNumber()(value)
	if (!v.valid) return v
	error = error ?? `must be less than ${compare}`
	const val = value as number
	if (val < compare) return isValid(val)
	return isInvalid([error], val)
})

export const isLessThanOrEqualTo = (compare: number, error?: string) => makeRule<number>((value) => {
	const v = isNumber()(value)
	if (!v.valid) return v
	error = error ?? `must be less than or equal to ${compare}`
	const val = value as number
	if (val <= compare) return isValid(val)
	return isInvalid([error], val)
})