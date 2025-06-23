import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('types', () => {
	test('string', () => {
		const rules = v.string()
		expect(rules.validate('2').valid).toBe(true)
		expect(rules.validate(2).valid).toBe(false)
		expect(rules.validate(false).valid).toBe(false)
	})

	test('number', () => {
		const rules = v.number()
		expect(rules.validate('2').valid).toBe(false)
		expect(rules.validate(2).valid).toBe(true)
		expect(rules.validate(false).valid).toBe(false)
	})

	test('boolean', () => {
		const rules = v.boolean()
		expect(rules.validate(true).valid).toBe(true)
		expect(rules.validate(false).valid).toBe(true)
		expect(rules.validate([2]).valid).toBe(false)
	})

	test('null', () => {
		const rules = v.null()
		expect(rules.validate(null).valid).toBe(true)
		expect(rules.validate(1).valid).toBe(false)
		expect(rules.validate([2]).valid).toBe(false)
	})

	test('undefined', () => {
		const rules = v.undefined()
		expect(rules.validate(undefined).valid).toBe(true)
		expect(rules.validate(1).valid).toBe(false)
		expect(rules.validate([2]).valid).toBe(false)
	})

	test('any', () => {
		const rules = v.any()
		expect(rules.validate('').valid).toBe(true)
		expect(rules.validate(1).valid).toBe(true)
		expect(rules.validate([2]).valid).toBe(true)
	})

	test('instanceof', () => {
		const rules = v.instanceOf(Date)
		expect(rules.validate('').valid).toBe(false)
		expect(rules.validate(1).valid).toBe(false)
		expect(rules.validate({}).valid).toBe(false)
		expect(rules.validate(new Date()).valid).toBe(true)
	})
})
