import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isCustom = <T> (validity: (v: T) => boolean, error = 'doesn\'t match custom schema') => makeRule<T>((value) => {
	return validity(value) ? isValid() : isInvalid(error)
})