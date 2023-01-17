import { isInvalid, isValid, makeRule } from '../utils/rules'
import { O, Schema, VObject } from '../refactor/objects'

export const isObject = <T extends O> (schema: Schema<T>, error = 'doesn\'t match the schema') => makeRule<T>((value) => {
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
})