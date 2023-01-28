import { isInstanceOf } from '../rules'
import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

export class VMap<KI, VI, KO, VO> extends VCore<Map<KI, VI>, Map<KO, VO>> {
	constructor (kCom: VCore<KI, KO>, vCom: VCore<VI, VO>, err?: string) {
		super()
		this.addTyping(isInstanceOf(Map, err))
		this.addRule(makeRule((value) => {
			for (const k of value.keys()) {
				const v = value.get(k)!
				const kValid = kCom.parse(k as any)
				const vValid = vCom.parse(v as any)
				if (!kValid.valid) return isInvalid(err ?? `contains an invalid key ${String(k)}`, value)
				if (!vValid.valid) return isInvalid(err ?? `contains an invalid value for key ${String(k)}`, value)
				// @ts-ignore
				if (k !== kValid.value) value.delete(k)
				// @ts-ignore
				value.set(kValid.value, vValid.value)
			}
			return isValid(value)
		}))
	}
}

export class VRecord<VI, VO> extends VCore<Record<string, VI>, Record<string, VO>> {
	constructor (vCom: VCore<VI, VO>, err?: string) {
		super()
		this.addTyping(makeRule((value) => {
			for (const [k, v] of Object.entries(value)) {
				const validity = vCom.parse(v as any)
				err = err ?? `contains an invalid value for key ${k}`
				if (!validity.valid) return isInvalid(err, value)
				// @ts-ignore
				value[k] = validity.value
			}
			return isValid(value)
		}))
	}
}
