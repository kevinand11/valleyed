import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

type GetVCoreG<C extends VCore<any>> = C extends VCore<infer T> ? T : unknown;

export class VOr<T extends VCore<any>[]> extends VCore<GetVCoreG<T[number]>> {
	static create<T extends VCore<any>[]> (options: T, err = 'doesnt match any of the schema') {
		const v = new VOr<T>()
		v.addRule(makeRule<GetVCoreG<T[number]>>((value) => {
			if (options.length === 0) return isValid(value)
			for (const opt of options) {
				const valid = opt.parse(value)
				if (valid.valid) return isValid(value)
			}
			return isInvalid(err, value)
		}))
		return v
	}
}

export class VAnd<T> extends VCore<T> {
	static create<T> (options: VCore<T>[], err = 'doesnt match the schema') {
		const v = new VAnd<T>()
		v.addRule(makeRule<T>((value) => {
			if (options.length === 0) return isValid(value)
			for (const opt of options) {
				const valid = opt.parse(value)
				if (valid.valid) value = valid.value
				else return isInvalid(err, value)
			}
			return isValid(value)
		}))
		return v
	}
}