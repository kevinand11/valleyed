import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isCustom = <T>(validity: (v: T) => boolean, error = 'doesn\'t pass custom rule') => makeRule<T>((value) => {
	const val = value as T
	return validity(val) ? isValid(val) : isInvalid([error], val)
})