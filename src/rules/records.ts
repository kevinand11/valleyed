import { isInstanceOf } from './types'
import { isInvalid, isValid, makeRule } from '../utils/rules'

const parse = <O, K, V>(value: O, entries: [any, any][], kCom: (cur: K) => boolean, vCom: (cur: V) => boolean, error?: string) => {
	for (const entry of entries) {
		const [key, value] = entry
		if (!kCom(key)) return isInvalid([error ?? `contains an invalid key ${String(key)}`], value)
		if (!vCom(value)) return isInvalid([error ?? `contains an invalid value for key ${String(key)}`], value)
	}
	return isValid(value)
}

export const isRecord = <V>(com: (cur: V) => boolean, error?: string) =>
	makeRule<Record<string, V>>((value) => parse(value as Record<string, V>, Object.entries(value ?? []) as any, () => true, com, error))

export const isMap = <K, V>(kCom: (cur: K) => boolean, vCom: (cur: V) => boolean, error?: string) =>
	makeRule<Map<K, V>>((value) => {
		const v = isInstanceOf(Map)(value)
		if (!v.valid) return v
		const val = value as Map<K, V>
		return parse(val, [...(val.entries() ?? [])], kCom, vCom, error)
	})
