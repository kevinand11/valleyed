import type { ExtractI } from './base'
import { VCore } from './core'
import { wrapInTryCatch } from '../utils/functions'
import { isInvalid, isValid, makeRule } from '../utils/rules'

export class VOr<T extends VCore<any>[]> extends VCore<ExtractI<T[number]>> {
	constructor(options: T, err = 'doesnt match any of the schema') {
		super()
		this.addTyping(
			makeRule<ExtractI<T[number]>>((value) => {
				const val = value as ExtractI<T[number]>
				if (options.length === 0) return isValid(val)
				for (const opt of options) {
					const valid = opt.parse(val)
					if (valid.valid) return valid
				}
				return isInvalid([err], val)
			}),
		)
	}
}

export class VAnd<I> extends VCore<I> {
	constructor(options: VCore<I>[], err?: string) {
		super()
		this.addTyping(
			makeRule((value) => {
				let v = value as I
				if (options.length === 0) return isValid(v)
				for (const opt of options) {
					const valid = opt.parse(v)
					if (valid.valid) v = valid.value as any
					else return isInvalid(err ? [err] : valid.errors, v)
				}
				return isValid(v)
			}),
		)
	}
}

export class VDiscriminator<D extends Record<string, VCore<any>>> extends VCore<ExtractI<D[keyof D]>> {
	constructor(discriminator: (val: ExtractI<D[keyof D]>) => string, schemas: D, err = 'doesnt match any of the schema') {
		super()
		this.addTyping(
			makeRule<ExtractI<D[keyof D]>>((value) => {
				const val = value as ExtractI<D[keyof D]>
				const accessor = wrapInTryCatch(() => discriminator(val))!
				if (!schemas[accessor]) return isInvalid([err], val)
				return schemas[accessor].parse(val)
			}),
		)
	}
}
