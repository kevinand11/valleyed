import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

type Schema<T extends Record<string, any>> = { [k in keyof T]: VCore<T[k]> }

export class VObject<I extends Record<string, any>> extends VCore<I> {
	constructor (schema: Schema<I>, trim = true, err?: string) {
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