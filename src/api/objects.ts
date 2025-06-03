import type { ExtractI, ExtractO } from './base'
import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

type GI<T extends Record<string, VCore<any>>> = { [K in keyof T]: ExtractI<T[K]> }
type GO<T extends Record<string, VCore<any>>> = { [K in keyof T]: ExtractO<T[K]> }

export class VObject<T extends Record<string, VCore<any>>> extends VCore<GI<T>, GO<T>> {
	constructor(
		private readonly schema: T,
		private readonly trim = true,
		private readonly err?: string,
	) {
		super()
		this.addTyping(
			makeRule<GI<T>>((value) => {
				const val = structuredClone(value) as GI<T>
				const keys = new Set([...Object.keys(val ?? {}), ...Object.keys(schema)])
				const errors: string[] = []
				for (const key of keys) {
					if (!(key in schema)) {
						if (trim) {
							try {
								delete val[key]
							} catch {
								/* */
							}
						}
						continue
					}
					const validity = schema[key].parse(val?.[key])
					const errorStart = schema[key] instanceof VObject ? `${key}.` : `${key}: `
					if (!validity.valid) errors.push(...validity.errors.map((e) => errorStart + e))
					// @ts-ignore
					if (val && validity.valid) val[key] = validity.value
				}
				return errors.length > 0 ? isInvalid(err ? [err] : errors, val) : isValid(val)
			}),
		)
	}

	extends<S extends Record<string, VCore<any>>>(schema: S) {
		const a = this.clone(this)
		return new VObject<Omit<T, keyof S> & S>({ ...a.schema, ...schema }, a.trim, a.err)
	}
}
