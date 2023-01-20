import { VCore } from './core'
import { isInvalid, isValid, makeRule } from '../utils/rules'

export type Schema<T extends Record<string, any>> = { [k in keyof T]: VCore<T[k]> }

export class VObject<T extends Record<string, any>> extends VCore<T> {
	schema: Schema<T> = {} as any
	ignTrim: boolean = false

	static create<T extends Record<string, any>> (schema: Schema<T>, ignTrim = false, err = 'doesn\'t match the schema') {
		const v = new VObject<T>()
		v.schema = schema
		v.ignTrim = ignTrim
		v.addSanitizer((value: T) => v.trim(value))
		v.addRule(makeRule<T>((value) => {
			const calculateValidity = (value: T, schema: Schema<T>, path: string[]) => {
				for (const key of Object.keys(schema)) {
					const newPath = [...path, key]
					const scheme = schema[key]
					if (scheme instanceof VObject) {
						const validity = calculateValidity(value?.[key], scheme.schema, newPath)
						if (!validity.valid) return isInvalid(validity.error, value)
					} else {
						const validity = schema[key].parse(value?.[key])
						if (!validity.valid) return isInvalid(`${newPath.join('.')} ${err}`, value)
					}
				}
				return isValid(value)
			}
			return calculateValidity(value, schema, [])
		}))
		return v
	}

	private trim (value: any) {
		if (this.ignTrim) return value
		Object.keys(value).forEach((key) => {
			if (!(key in this.schema)) delete value[key]
			const scheme = this.schema[key]
			if (scheme instanceof VObject) value[key] = scheme.trim(value[key])
		})
		return value
	}
}