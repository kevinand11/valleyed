import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

type ExtractI<T extends Record<string, VCore<any>>> =
	{ [K in keyof T]: T[K] extends VCore<infer I, any, any> ? I : never }
type ExtractO<T extends Record<string, VCore<any>>> =
	{ [K in keyof T]: T[K] extends VCore<any, infer O, any> ? O : never }
type ExtractTr<T extends Record<string, VCore<any>>> =
	{ [K in keyof T]: T[K] extends VCore<any, any, infer Tr> ? Tr : never }

export class VObject<T extends Record<string, VCore<any, any, any>>> extends VCore<ExtractI<T>, ExtractO<T>, ExtractTr<T>> {
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