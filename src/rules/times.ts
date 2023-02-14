import { isInvalid, isValid, makeRule } from '../utils/rules'
import { isNumber } from './numbers'
import { isString } from './strings'

export type Timeable = Date | string | number

export const isTime = <T extends Timeable> (error = 'is not a valid datetime') => makeRule<T>((value) => {
	if (isNumber()(value instanceof Date ? value.valueOf() : value).valid) return isValid(value)
	// @ts-ignore
	if (isString()(value).valid) return isNumber()(Date.parse(value)).valid ? isValid(value) : isInvalid(error, value)
	return isInvalid(error, value)
})

export const isLaterThan = <T extends Timeable> (compare: Timeable, error = 'is not later than compared value') => makeRule<T>((value) => {
	const date = new Date(value)
	const compareDate = new Date(compare)
	if (!isTime()(date).valid) return isInvalid('is not a valid datetime', value)
	if (!isTime()(compareDate).valid) return isInvalid('compare is not a valid datetime', value)
	return date > compareDate ? isValid(value) : isInvalid(error, value)
})

export const isEarlierThan = <T extends Timeable> (compare: Timeable, error = 'is not earlier than compared value') => makeRule<T>((value) => {
	const date = new Date(value)
	const compareDate = new Date(compare)
	if (!isTime()(date).valid) return isInvalid('is not a valid datetime', value)
	if (!isTime()(compareDate).valid) return isInvalid('compare is not a valid datetime', value)
	return date < compareDate ? isValid(value) : isInvalid(error, value)
})