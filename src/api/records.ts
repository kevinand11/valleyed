import { isMap, isRecord } from '../rules'
import { coreToComp, VCore } from './core'

export class VMap<K, V> extends VCore<Map<K, V>> {
	static create<K, V> (kCom: VCore<K>, vCom: VCore<V>, err?: string) {
		const v = new VMap<K, V>()
		v.addRule(isMap<K, V>(coreToComp(kCom), coreToComp(vCom), err))
		return v
	}
}

export class VRecord<V> extends VCore<Record<string, V>> {
	static create<V> (vCom: VCore<V>, err?: string) {
		const v = new VRecord<V>()
		v.addRule(isRecord<V>(coreToComp(vCom), err))
		return v
	}
}
