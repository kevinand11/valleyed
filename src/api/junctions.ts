import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'
import { ExtractI, ExtractO, ExtractTr } from './base'

export class VOr<T extends VCore<any, any, any>[]> extends VCore<ExtractI<T[number]>, ExtractO<T[number]>, ExtractTr<T[number]>> {
	constructor (options: T, err = 'doesnt match any of the schema') {
		super()
		this.addRule(makeRule((value) => {
			if (options.length === 0) return isValid(value)
			for (const opt of options) {
				const valid = opt.parse(value)
				if (valid.valid) return isValid(value)
			}
			return isInvalid(err, value)
		}))
	}
}

export class VAnd<I, O, Tr> extends VCore<I, O, Tr> {
	constructor (options: VCore<I, O, Tr>[], err = 'doesnt match the schema') {
		super()
		this.addRule(makeRule((value) => {
			let v = value as any
			if (options.length === 0) return isValid(v)
			for (const opt of options) {
				const valid = opt.parse(v)
				if (valid.valid) v = valid.value
				else return isInvalid(err, v)
			}
			return isValid(v)
		}))
	}
}