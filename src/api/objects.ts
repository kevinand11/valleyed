import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

type Schema<T extends Record<string, any>> = { [k in keyof T]: VCore<T[k]> }

export class VObject<T extends Record<string, any>> extends VCore<T> {

	static create<T extends Record<string, any>> (schema: Schema<T>, trim = true, err?: string) {
		const v = new VObject<T>()
		v.addRule(makeRule<T>((value) => {
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
		return v
	}
}