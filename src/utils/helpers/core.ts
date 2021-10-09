import { isRequiredIf } from '../../rules'

export function isRequiredIfX<Type> (condition: boolean, error?: string) {
	return (val: Type) => isRequiredIf(val, condition, error)
}