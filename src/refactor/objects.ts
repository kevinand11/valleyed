import { VCore } from './core'
import { isInvalid, isValid } from '../utils/rules'

export type O = { [K in string]: any }
// @ts-ignore
export type Schema<T extends O> = { [K in T]: Schema<T> | VCore<any> }

export class VObject<T extends O> extends VCore<T> {
	schema: Schema<T>

	constructor (schema: Schema<T>, err?: string) {
		super()
		this.schema = schema
		this.addRule((val: T) => isObject(val, schema, err))
	}
}

const isObject = <T extends O> (value: T, schema: Schema<T>, error = 'doesn\'t match the schema') => {
	const calculateValidity = (value: T, schema: Schema<T>, path: string[]) => {
		for (const key of Object.keys(schema)) {
			const newPath = [...path, key]
			if (schema[key] instanceof VObject) {
				const validity = calculateValidity(value?.[key], schema[key].schema, newPath)
				if (!validity.valid) return isInvalid(validity.error)
			} else {
				const validity = schema[key].parse(value?.[key])
				if (!validity.isValid) return isInvalid(`${newPath.join('.')} ${error}`)
			}
		}
		return isValid()
	}
	return calculateValidity(value, schema, [])
}