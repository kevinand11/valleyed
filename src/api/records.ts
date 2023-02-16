import { isInstanceOf } from '../rules'
import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

export class VMap<KI, VI, KO, VO> extends VCore<Map<KI, VI>, Map<KO, VO>> {
	constructor (kCom: VCore<KI, KO>, vCom: VCore<VI, VO>, err?: string) {
		super()
		this.addTyping(isInstanceOf<Map<KI, VI>>(Map, err))
		this.addRule(makeRule<Map<KI, VI>>((value) => {
			const val = structuredClone(value) as Map<KI, VI>
			for (const k of val?.keys() ?? []) {
				const v = val?.get(k)!
				const kValid = kCom.parse(k as any)
				const vValid = vCom.parse(v as any)
				if (!kValid.valid) return isInvalid(err ? [err] : [`contains an invalid key ${String(k)}`], val)
				if (!vValid.valid) return isInvalid(err ? [err] : [`contains an invalid value for key ${String(k)}`], val)
				// @ts-ignore
				if (k !== kValid.value) val?.delete(k)
				// @ts-ignore
				val?.set(kValid.value, vValid.value)
			}
			return isValid(val)
		}))
	}
}

export class VRecord<VI, VO> extends VCore<Record<string, VI>, Record<string, VO>> {
	constructor (vCom: VCore<VI, VO>, err?: string) {
		super()
		this.addTyping(makeRule<Record<string, VI>>((value) => {
			const val = structuredClone(value) as Record<string, VI>
			for (const [k, v] of Object.entries(val ?? {})) {
				const validity = vCom.parse(v as any)
				err = err ?? `contains an invalid value for key ${k}`
				if (!validity.valid) return isInvalid( [err], val)
				// @ts-ignore
				if (value) value[k] = validity.value
			}
			return isValid(val)
		}))
	}
}
