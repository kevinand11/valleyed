import { isInstanceOf } from '../rules'
import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

export class VMap<K, V> extends VCore<Map<K, V>> {
	constructor (kCom: VCore<K>, vCom: VCore<V>, err?: string) {
		super()
		this.addTyping(isInstanceOf(Map, err))
		this.addRule(makeRule<Map<K, V>>((value: Map<K, V>) => {
			for (const k of value.keys()) {
				const v = value.get(k)!
				const kValid = kCom.parse(k)
				const vValid = vCom.parse(v)
				if (!kValid.valid) return isInvalid(err ?? `contains an invalid key ${String(k)}`, value)
				if (!vValid.valid) return isInvalid(err ?? `contains an invalid value for key ${String(k)}`, value)
				if (k !== kValid.value) value.delete(k)
				value.set(kValid.value, vValid.value)
			}
			return isValid(value)
		}))
	}
}

export class VRecord<V> extends VCore<Record<string, V>> {
	constructor (vCom: VCore<V>, err?: string) {
		super()
		this.addTyping(makeRule<Record<string, V>>((value: Record<string, V>) => {
			for (const [k, v] of Object.entries(value)) {
				const validity = vCom.parse(v)
				err = err ?? `contains an invalid value for key ${k}`
				if (!validity.valid) return isInvalid(err, value)
				value[k] = validity.value
			}
			return isValid(value)
		}))
	}
}
