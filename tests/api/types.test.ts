import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('types', () => {
	test('string', () => {
		const rules = v.string()
		expect(v.validate(rules, '2').valid).toBe(true)
		expect(v.validate(rules, 2).valid).toBe(false)
		expect(v.validate(rules, false).valid).toBe(false)
	})

	test('number', () => {
		const rules = v.number()
		expect(v.validate(rules, '2').valid).toBe(false)
		expect(v.validate(rules, 2).valid).toBe(true)
		expect(v.validate(rules, false).valid).toBe(false)
	})

	test('boolean', () => {
		const rules = v.boolean()
		expect(v.validate(rules, true).valid).toBe(true)
		expect(v.validate(rules, false).valid).toBe(true)
		expect(v.validate(rules, [2]).valid).toBe(false)
	})

	test('null', () => {
		const rules = v.null()
		expect(v.validate(rules, null).valid).toBe(true)
		expect(v.validate(rules, 1).valid).toBe(false)
		expect(v.validate(rules, [2]).valid).toBe(false)
	})

	test('undefined', () => {
		const rules = v.undefined()
		expect(v.validate(rules, undefined).valid).toBe(true)
		expect(v.validate(rules, 1).valid).toBe(false)
		expect(v.validate(rules, [2]).valid).toBe(false)
	})

	test('any', () => {
		const rules = v.any()
		expect(v.validate(rules, '').valid).toBe(true)
		expect(v.validate(rules, 1).valid).toBe(true)
		expect(v.validate(rules, [2]).valid).toBe(true)
	})

	test('instanceof', () => {
		const rules = v.instanceOf(Date)
		expect(v.validate(rules, '').valid).toBe(false)
		expect(v.validate(rules, 1).valid).toBe(false)
		expect(v.validate(rules, {}).valid).toBe(false)
		expect(v.validate(rules, new Date()).valid).toBe(true)
	})
})
