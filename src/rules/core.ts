import { isInvalid, isValid } from '../utils/rules'

export const isRequiredIf = (value: any, condition: boolean) => {
	if(value === null) return isInvalid('cannot be null')
	if(condition && value === undefined) return isInvalid('is required')
	return isValid()
}
