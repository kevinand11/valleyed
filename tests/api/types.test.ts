import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('types', () => {
	test('string', () => {
		const rules = v.string()
		expect(rules.safeParse('2').valid).toBe(true)
		expect(rules.safeParse(2).valid).toBe(false)
		expect(rules.safeParse(false).valid).toBe(false)
	})

	test('number', () => {
		const rules = v.number()
		expect(rules.safeParse('2').valid).toBe(false)
		expect(rules.safeParse(2).valid).toBe(true)
		expect(rules.safeParse(false).valid).toBe(false)
	})

	test('boolean', () => {
		const rules = v.boolean()
		expect(rules.safeParse(true).valid).toBe(true)
		expect(rules.safeParse(false).valid).toBe(true)
		expect(rules.safeParse([2]).valid).toBe(false)
	})

	test('null', () => {
		const rules = v.null()
		expect(rules.safeParse(null).valid).toBe(true)
		expect(rules.safeParse(1).valid).toBe(false)
		expect(rules.safeParse([2]).valid).toBe(false)
	})

	test('undefined', () => {
		const rules = v.undefined()
		expect(rules.safeParse(undefined).valid).toBe(true)
		expect(rules.safeParse(1).valid).toBe(false)
		expect(rules.safeParse([2]).valid).toBe(false)
	})

	test('any', () => {
		const rules = v.any()
		expect(rules.safeParse('').valid).toBe(true)
		expect(rules.safeParse(1).valid).toBe(true)
		expect(rules.safeParse([2]).valid).toBe(true)
	})

	test('instanceof', () => {
		const rules = v.instanceOf(Date)
		expect(rules.safeParse('').valid).toBe(false)
		expect(rules.safeParse(1).valid).toBe(false)
		expect(rules.safeParse({}).valid).toBe(false)
		expect(rules.safeParse(new Date()).valid).toBe(true)
	})

	test('function', () => {
		const rules = v.function()
		expect(rules.safeParse('').valid).toBe(false)
		expect(rules.safeParse(1).valid).toBe(false)
		expect(rules.safeParse({}).valid).toBe(false)
		expect(rules.safeParse(() => 1).valid).toBe(true)
	})
})
