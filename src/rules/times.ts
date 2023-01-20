import { isInvalid, isValid, makeRule } from '../utils/rules'
import { isNumber } from './numbers'
import { isString } from './strings'

export const isTime = (error = 'is not a valid timestamp') => makeRule<any>((value) => {
	if (isNumber()(value instanceof Date ? value.valueOf() : value).valid) return isValid(value)
	if (isString()(value).valid) return isNumber()(Date.parse(value)).valid ? isValid(value) : isInvalid(error, value)
	return isInvalid(error, value)
})