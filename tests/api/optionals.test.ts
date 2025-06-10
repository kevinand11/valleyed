import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('optionals', () => {
	test('requiredIf', () => {
		const rules = v.requiredIf(v.string(), () => false)
		expect(rules.safeParse('').valid).toBe(true)
		expect(rules.safeParse(undefined).valid).toBe(true)
		expect(rules.safeParse(2).valid).toBe(true)
	})

	test('optional', () => {
		const rules = v.optional(v.string())
		expect(rules.safeParse('').valid).toBe(true)
		expect(rules.safeParse(undefined).valid).toBe(true)
		expect(rules.safeParse(null).valid).toBe(false)
		expect(rules.safeParse(2).valid).toBe(false)
	})

	test('nullable', () => {
		const rules = v.nullable(v.string())
		expect(rules.safeParse('').valid).toBe(true)
		expect(rules.safeParse(null).valid).toBe(true)
		expect(rules.safeParse(undefined).valid).toBe(false)
		expect(rules.safeParse(2).valid).toBe(false)
	})

	test('nullish', () => {
		const rules = v.nullish(v.string())
		expect(rules.safeParse('').valid).toBe(true)
		expect(rules.safeParse(null).valid).toBe(true)
		expect(rules.safeParse(undefined).valid).toBe(true)
		expect(rules.safeParse(2).valid).toBe(false)
	})

	test('defaults', () => {
		const rules = v.defaults(v.string(), () => '')
		expect(rules.safeParse('hi').valid).toBe(true)
		expect(rules.safeParse(null).valid).toBe(false)
		expect(rules.safeParse(undefined).valid).toBe(true)
	})

	test('defaultsOnFail', () => {
		const defaultValue = 'default'
		const rules = v.defaultsOnFail(v.string(), () => defaultValue)
		expect(rules.safeParse('hi').valid).toBe(true)
		expect(rules.safeParse(null).valid).toBe(true)
		expect(rules.parse(null)).toBe(defaultValue)
		expect(rules.safeParse(undefined).valid).toBe(true)
	})
})
