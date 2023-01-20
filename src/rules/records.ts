import { isInvalid, isValid, makeRule } from '../utils/rules'
import { isInstanceOf } from './types'

const parse = <O, K, V> (
	value: O,
	keys: K[],
	values: V[],
	kCom: (cur: K) => boolean,
	vCom: (cur: V) => boolean,
	error?: string
) => {
	const invKIndex = keys.findIndex((elem) => !kCom(elem))
	const invalidK = invKIndex !== -1
	if (invalidK) return isInvalid(error ?? `contains an invalid key ${String(keys[invKIndex])}`, value)
	const invVIndex = values.findIndex((elem) => !vCom(elem))
	const invalidV = invVIndex !== -1
	if (invalidV) return isInvalid(error ?? `contains an invalid value for key ${String(keys[invVIndex])}`, value)
	return isValid(value)
}

export const isRecord = <V> (
	com: (cur: V) => boolean,
	error?: string) =>
		makeRule<Record<string, V>>((value) =>
			parse(value, [], Object.values(value) as any, () => true, com, error))

export const isMap = <K, V> (
	kCom: (cur: K) => boolean,
	vCom: (cur: V) => boolean,
	error?: string) =>
		makeRule<Map<K, V>>((value) => {
			const v = isInstanceOf(Map)(value)
			if (!v.valid) return v
			return parse(value, [...value.keys()], [...value.values()], kCom, vCom, error)
		})