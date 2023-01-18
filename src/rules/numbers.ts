import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isMoreThan = (compare: number, error?: string) => makeRule<number>((value) => {
	error = error ?? `must be greater than ${compare}`
	if (value > compare) return isValid()
	return isInvalid(error)
})

export const isMoreThanOrEqualTo = (compare: number, error?: string) => makeRule<number>((value) => {
	error = error ?? `must be greater than or equal to ${compare}`
	if (value >= compare) return isValid()
	return isInvalid(error)
})

export const isLessThan = (compare: number, error?: string) => makeRule<number>((value) => {
	error = error ?? `must be less than ${compare}`
	if (value < compare) return isValid()
	return isInvalid(error)
})

export const isLessThanOrEqualTo = (compare: number, error?: string) => makeRule<number>((value) => {
	error = error ?? `must be less than or equal to ${compare}`
	if (value <= compare) return isValid()
	return isInvalid(error)
})