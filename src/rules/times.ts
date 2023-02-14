import { isInvalid, isValid, makeRule } from '../utils/rules'
import { isNumber } from './numbers'
import { isString } from './strings'

export type Timeable = Date | string | number

export const isTime = <T extends Timeable> (error = 'is not a valid datetime') => makeRule<T>((value) => {
	if (isNumber()(value instanceof Date ? value.valueOf() : value).valid) return isValid(value)
	// @ts-ignore
	if (isString()(value).valid) return isNumber()(Date.parse(value)).valid ? isValid(value) : isInvalid([error], value)
	return isInvalid([error], value)
})

export const isLaterThan = <T extends Timeable> (compare: Timeable, error = 'is not later than compared value') => makeRule<T>((value) => {
	const date = new Date(value)
	const compareDate = new Date(compare)
	const errors: string[] = []
	if (!isTime()(date).valid) errors.push('is not a valid datetime')
	if (!isTime()(compareDate).valid) errors.push('compare is not a valid datetime')
	if (date <= compareDate) errors.push(error)
	return errors.length === 0 ? isValid(value) : isInvalid(errors, value)
})

export const isEarlierThan = <T extends Timeable> (compare: Timeable, error = 'is not earlier than compared value') => makeRule<T>((value) => {
	const date = new Date(value)
	const compareDate = new Date(compare)
	const errors: string[] = []
	if (!isTime()(date).valid) errors.push('is not a valid datetime')
	if (!isTime()(compareDate).valid) errors.push('compare is not a valid datetime')
	if (date >= compareDate) errors.push(error)
	return errors.length === 0 ? isValid(value) : isInvalid(errors, value)
})