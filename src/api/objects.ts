import { VCore } from './core'
import { check, isInvalid, isValid, makeRule } from '../utils/rules'

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
						if (!validity.valid) return isInvalid(validity.error)
					} else {
						const validity = schema[key].parse(value?.[key])
						if (!validity.valid) return isInvalid(`${newPath.join('.')} ${err}`)
					}
				}
				return isValid()
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

type GetVCoreG<C extends VCore<any>> = C extends VCore<infer T> ? T : unknown;

export class VOr<T extends VCore<any>[]> extends VCore<GetVCoreG<T[number]>> {
	static create<T extends VCore<any>[]> (options: T, err = 'doesnt match any of the schema') {
		const v = new VOr<T>()
		v.addRule(makeRule<T>((value) => {
			const rules = options.map((v) => v.rules)
			if (rules.length === 0) return isValid()
			const valid = rules.some((set) => check(value, set, {}).valid)
			return valid ? isValid() : isInvalid(err)
		}))
		return v
	}
}

export class VAnd<T> extends VCore<T> {
	static create<T> (options: VCore<T>[], err = 'doesnt match the schema') {
		const v = new VAnd<T>()
		v.addRule(makeRule<T>((value) => {
			const rules = options.map((v) => v.rules)
			const invalid = rules.find((set) => !check(value, set, {}).valid)
			return invalid ? isInvalid(err) : isValid()
		}))
		return v
	}
}