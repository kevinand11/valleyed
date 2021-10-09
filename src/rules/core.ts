import { isInvalid, isValid } from '../utils/rules'

export function isRequiredIf<Type> (value: Type, condition: boolean, error = 'is required') {
	if (condition && value === undefined) return isInvalid(error)
	if (condition && value === null) return isInvalid(error)
	return isValid()
}