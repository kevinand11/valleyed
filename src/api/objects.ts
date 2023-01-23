import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'
import { ExtractI, ExtractO, ExtractTr } from './base'

type G1<T extends Record<string, VCore<any>>> = { [K in keyof T]: ExtractI<T[K]> }
type G2<T extends Record<string, VCore<any>>> = { [K in keyof T]: ExtractO<T[K]> }
type G3<T extends Record<string, VCore<any>>> = { [K in keyof T]: ExtractTr<T[K]> }

export class VObject<T extends Record<string, VCore<any, any, any>>> extends VCore<G1<T>, G2<T>, G3<T>> {
	constructor (schema: T, trim = true, err?: string) {
		super()
		this.addRule(makeRule((value) => {
			const keys = new Set([...Object.keys(value), ...Object.keys(schema)])
			for (const key of keys) {
				if (!(key in schema)) {
					if (trim) delete value[key]
					continue
				}
				const validity = schema[key].parse(value?.[key])
				if (!validity.valid) return isInvalid(err ?? `${key} doesn't match the schema`, value)
				// @ts-ignore
				value[key] = validity.value
			}
			return isValid(value)
		}))
	}
}