import { isInvalid, isValid } from '../utils/rules'

export const isRequired = (value: any) => {
	if(value === undefined || value === null || value === '') return isInvalid('is required')
	return isValid()
}

export const isNotRequired = (value: any) => {
	if(value === null) return isInvalid('cannot be null')
	return isValid()
}

export const isRequiredIf = (value: any, condition: boolean) => {
	if(value === null) return isInvalid('cannot be null')
	if(condition && value === undefined) return isInvalid('is required')
	return isValid()
}
