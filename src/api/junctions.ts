import { isInvalid, isValid, makeRule } from '../utils/rules'
import { ExtractI } from './base'
import { VCore } from './core'

export class VOr<T extends VCore<any>[]> extends VCore<ExtractI<T[number]>> {
	constructor (options: T, err = 'doesnt match any of the schema') {
		super()
		this.addRule(makeRule<ExtractI<T[number]>>((value) => {
			const val = value as ExtractI<T[number]>
			if (options.length === 0) return isValid(val)
			for (const opt of options) {
				const valid = opt.parse(val)
				if (valid.valid) return isValid(val)
			}
			return isInvalid([err], val)
		}))
	}
}

export class VAnd<I> extends VCore<I> {
	constructor (options: VCore<I>[], err?: string) {
		super()
		this.addRule(makeRule((value) => {
			let v = value as I
			if (options.length === 0) return isValid(v)
			for (const opt of options) {
				const valid = opt.parse(v)
				if (valid.valid) v = valid.value as any
				else return isInvalid(err ? [err] : valid.errors, v)
			}
			return isValid(v)
		}))
	}
}