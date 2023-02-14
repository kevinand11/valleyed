import { isInvalid, isValid, makeRule } from '../utils/rules'
import { ExtractI, ExtractO } from './base'
import { VCore } from './core'

type G1<T extends Record<string, VCore<any>>> = { [K in keyof T]: ExtractI<T[K]> }
type G2<T extends Record<string, VCore<any>>> = { [K in keyof T]: ExtractO<T[K]> }

export class VObject<T extends Record<string, VCore<any, any>>> extends VCore<G1<T>, G2<T>> {
	constructor (schema: T, trim = true, err?: string) {
		super()
		this.addRule(makeRule((value) => {
			const keys = new Set([...Object.keys(value ?? {}), ...Object.keys(schema)])
			const errors: string[] = []
			for (const key of keys) {
				if (!(key in schema)) {
					if (trim) delete value[key]
					continue
				}
				const validity = schema[key].parse(value?.[key])
				const errorStart = schema[key] instanceof VObject ? `${key}.` : `${key}: `
				if (!validity.valid) errors.push(...validity.errors.map((e) => errorStart + e))
				// @ts-ignore
				if (value) value[key] = validity.value
			}
			return errors.length > 0 ? isInvalid(err ? [err] : errors, value) : isValid(value)
		}))
	}
}