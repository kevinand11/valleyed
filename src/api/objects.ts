import { VCore } from './core'
import { check, isInvalid, isValid, makeRule } from '../utils/rules'

export type Schema<T extends Record<string, any>> = { [k in keyof T]: VCore<T[k]> }

export class VObject<T extends Record<string, any>> extends VCore<T> {
	schema: Schema<T>
	ignTrim: boolean

	constructor (schema: Schema<T>, ignTrim = false, err = 'doesn\'t match the schema') {
		super()
		this.schema = schema
		this.ignTrim = ignTrim
		this.addSanitizer((value: T) => this.trim(value))
		this.addRule(makeRule<T>((value) => {
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
	constructor (options: T, err = 'doesnt match any of the schema') {
		super()
		this.addRule(makeRule<T>((value) => {
			const rules = options.map((v) => v.rules)
			if (rules.length === 0) return isValid()
			const valid = rules.some((set) => check(value, set, {}).valid)
			return valid ? isValid() : isInvalid(err)
		}))
	}
}

export class VAnd<T> extends VCore<T> {
	constructor (options: VCore<T>[], err = 'doesnt match the schema') {
		super()
		this.addRule(makeRule<T>((value) => {
			const rules = options.map((v) => v.rules)
			const invalid = rules.find((set) => !check(value, set, {}).valid)
			return invalid ? isInvalid(err) : isValid()
		}))
	}
}