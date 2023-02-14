import { isInvalid, isValid, makeRule } from '../utils/rules'
import { isNumber } from './numbers'
import { isString } from './strings'

export type Timeable = Date | string | number

export const isTime = <T extends Timeable>(error = 'is not a valid datetime') => makeRule<T>((value) => {
	const val = value as T
	if (isNumber()(val instanceof Date ? val.valueOf() : val).valid) return isValid(val)
	// @ts-ignore
	if (isString()(val).valid) return isNumber()(Date.parse(val)).valid ? isValid(val) : isInvalid([error], val)
	return isInvalid([error], val)
})

export const isLaterThan = <T extends Timeable> (compare: Timeable, error = 'is not later than compared value') => makeRule<T>((value) => {
	const val = value as T
	const date = new Date(val)
	const compareDate = new Date(compare)
	if (!isTime()(date).valid) return isInvalid(['is not a valid datetime'], val)
	if (!isTime()(compareDate).valid) return isInvalid(['compare is not a valid datetime'], val)
	if (date <= compareDate) return isInvalid([error], val)
	return isValid(val)
})

export const isEarlierThan = <T extends Timeable> (compare: Timeable, error = 'is not earlier than compared value') => makeRule<T>((value) => {
	const val = value as T
	const date = new Date(val)
	const compareDate = new Date(compare)
	if (!isTime()(date).valid) return isInvalid(['is not a valid datetime'], val)
	if (!isTime()(compareDate).valid) return isInvalid(['compare is not a valid datetime'], val)
	if (date >= compareDate) return isInvalid([error], val)
	return isValid(val)
})