import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

type G1<C extends VCore<any>> = C extends VCore<infer T, any, any> ? T : unknown;
type G2<C extends VCore<any>> = C extends VCore<any, infer T, any> ? T : unknown;
type G3<C extends VCore<any>> = C extends VCore<any, any, infer T> ? T : unknown;

export class VOr<T extends VCore<any, any, any>[]> extends VCore<G1<T[number]>, G2<T[number]>, G3<T[number]>> {
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