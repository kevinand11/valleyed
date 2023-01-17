import { check, isInvalid, isValid, makeRule, Rule } from '../utils/rules'
import { Schema, VObject } from '../api/objects'

export const isObject = <T extends Record<string, any>> (schema: Schema<T>, error = 'doesn\'t match the schema') => makeRule<T>((value) => {
	const calculateValidity = (value: T, schema: Schema<T>, path: string[]) => {
		for (const key of Object.keys(schema)) {
			const newPath = [...path, key]
			const scheme = schema[key]
			if (scheme instanceof VObject) {
				const validity = calculateValidity(value?.[key], scheme.schema, newPath)
				if (!validity.valid) return isInvalid(validity.error)
			} else {
				const validity = schema[key].parse(value?.[key])
				if (!validity.valid) return isInvalid(`${newPath.join('.')} ${error}`)
			}
		}
		return isValid()
	}
	return calculateValidity(value, schema, [])
})

export const or = <T> (rules: Rule<T>[][], error = 'doesnt match any of the schema') => makeRule<T>((value) => {
	if (rules.length === 0) return isValid()
	const valid = rules.some((set) => check(value, set, {}).valid)
	return valid ? isValid() : isInvalid(error)
})

export const and = <T> (rules: Rule<T>[][], error = 'doesnt match the schema') => makeRule<T>((value) => {
	const invalid = rules.find((set) => !check(value, set, {}).valid)
	return invalid ? isInvalid(error) : isValid()
})