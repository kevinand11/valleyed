import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

type GetVCoreG<C extends VCore<any>> = C extends VCore<infer T> ? T : unknown;

export class VOr<T extends VCore<any>[]> extends VCore<GetVCoreG<T[number]>> {
	constructor (options: T, err = 'doesnt match any of the schema') {
		super()
		this.addRule(makeRule<GetVCoreG<T[number]>>((value) => {
			if (options.length === 0) return isValid(value)
			for (const opt of options) {
				const valid = opt.parse(value)
				if (valid.valid) return isValid(value)
			}
			return isInvalid(err, value)
		}))
	}
}

export class VAnd<T> extends VCore<T> {
	constructor (options: VCore<T>[], err = 'doesnt match the schema') {
		super()
		this.addRule(makeRule<T>((value) => {
			if (options.length === 0) return isValid(value)
			for (const opt of options) {
				const valid = opt.parse(value)
				if (valid.valid) value = valid.value
				else return isInvalid(err, value)
			}
			return isValid(value)
		}))
	}
}