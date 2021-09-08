import { isInvalid, isValid } from '../utils/rules'

export const isRequiredIf = (value: any, condition: boolean) => {
	if (condition && value === undefined) return isInvalid('is required')
	if (condition && value === null) return isInvalid('is required')
	return isValid()
}

export const isBoolean = (value: boolean) => {
	if (value === true || value === false) return isValid()
	return isInvalid('must be a boolean value')
}
