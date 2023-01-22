import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

type G1<C extends VCore<any, any>> = C extends VCore<infer T, any> ? T : unknown;
type G2<C extends VCore<any>> = C extends VCore<any, infer T> ? T : unknown;

export class VOr<T extends VCore<any, any>[]> extends VCore<G1<T[number]>, G2<T[number]>> {
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

export class VAnd<I, O> extends VCore<I, O> {
	constructor (options: VCore<I, O>[], err = 'doesnt match the schema') {
		super()
		this.addRule(makeRule((value) => {
			if (options.length === 0) return isValid(value)
			for (const opt of options) {
				const valid = opt.parse(value as any)
				if (valid.valid) value = valid.value
				else return isInvalid(err, value)
			}
			return isValid(value)
		}))
	}
}