import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isCustom = <T>(validity: (v: T) => boolean, error = 'doesn\'t pass custom rule') => makeRule<T>((value) => {
	return validity(value) ? isValid(value) : isInvalid([error], value)
})