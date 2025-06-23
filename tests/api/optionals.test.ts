import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('optionals', () => {
	test('conditional', () => {
		const rules = v.conditional(v.string(), () => false)
		expect(rules.validate('').valid).toBe(true)
		expect(rules.validate(undefined).valid).toBe(true)
		expect(rules.validate(2).valid).toBe(true)
	})

	test('optional', () => {
		const rules = v.optional(v.string())
		expect(rules.validate('').valid).toBe(true)
		expect(rules.validate(undefined).valid).toBe(true)
		expect(rules.validate(null).valid).toBe(false)
		expect(rules.validate(2).valid).toBe(false)
	})

	test('nullable', () => {
		const rules = v.nullable(v.string())
		expect(rules.validate('').valid).toBe(true)
		expect(rules.validate(null).valid).toBe(true)
		expect(rules.validate(undefined).valid).toBe(false)
		expect(rules.validate(2).valid).toBe(false)
	})

	test('nullish', () => {
		const rules = v.nullish(v.string())
		expect(rules.validate('').valid).toBe(true)
		expect(rules.validate(null).valid).toBe(true)
		expect(rules.validate(undefined).valid).toBe(true)
		expect(rules.validate(2).valid).toBe(false)
	})

	test('defaults', () => {
		const rules = v.defaults(v.string(), () => '')
		expect(rules.validate('hi').valid).toBe(true)
		expect(rules.validate(null).valid).toBe(false)
		expect(rules.validate(undefined).valid).toBe(true)
	})

	test('defaultsOnFail', () => {
		const defaultValue = 'default'
		const rules = v.defaultsOnFail(v.string(), () => defaultValue)
		expect(rules.validate('hi').valid).toBe(true)
		expect(rules.validate(null).valid).toBe(true)
		expect(rules.parse(null)).toBe(defaultValue)
		expect(rules.validate(undefined).valid).toBe(true)
	})
})
