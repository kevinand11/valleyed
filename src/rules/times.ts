import { isInvalid, isValid, makeRule } from '../utils/rules'
import { isNumber } from './numbers'
import { isString } from './strings'

export const isTime = (error = 'is not a valid date') => makeRule<any>((value) => {
	if (value instanceof Date) return isValid()
	if (isNumber()(value).valid) return isValid()
	if (isString()(value).valid) return isNumber()(Date.parse(value)).valid ? isValid() : isInvalid(error)
	return isInvalid(error)
})