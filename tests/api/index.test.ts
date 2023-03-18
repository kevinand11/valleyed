import { describe, expect, test } from 'vitest'
import { v } from '../../src/api'

describe('index', () => {
	test('is', () => {
		const rules = v.is(1)
		expect(rules.parse('1').valid).toBe(false)
		expect(rules.parse(2).valid).toBe(false)
		expect(rules.parse(true).valid).toBe(false)
		expect(rules.parse(1).valid).toBe(true)
	})

	test('in', () => {
		const rules = v.in([1, 2, 3])
		expect(rules.parse('1').valid).toBe(false)
		expect(rules.parse(4).valid).toBe(false)
		expect(rules.parse(true).valid).toBe(false)
		expect(rules.parse(1).valid).toBe(true)
	})

	test('null', () => {
		const rules = v.null()
		expect(rules.parse('1').valid).toBe(false)
		expect(rules.parse(4).valid).toBe(false)
		expect(rules.parse(true).valid).toBe(false)
		expect(rules.parse(null).valid).toBe(true)
	})

	test('undefined', () => {
		const rules = v.undefined()
		expect(rules.parse('1').valid).toBe(false)
		expect(rules.parse(4).valid).toBe(false)
		expect(rules.parse(true).valid).toBe(false)
		expect(rules.parse(undefined).valid).toBe(true)
	})

	test('any', () => {
		const rules = v.any()
		expect(rules.parse('1').valid).toBe(true)
		expect(rules.parse(4).valid).toBe(true)
		expect(rules.parse(true).valid).toBe(true)
		expect(rules.parse(undefined).valid).toBe(true)
	})

	test('instanceof', () => {
		const rules = v.instanceof(String)
		expect(rules.parse('abc').valid).toBe(true)
		expect(rules.parse(4).valid).toBe(false)
		expect(rules.parse(true).valid).toBe(false)
		expect(rules.parse(undefined).valid).toBe(false)
	})
})

describe('force', () => {
	test('string', () => {
		const rules = v.force.string()
		expect(rules.parse('').valid).toBe(true)
		expect(rules.parse(2).valid).toBe(true)
		expect(rules.parse(false).valid).toBe(true)
		expect(rules.parse({}).valid).toBe(true)
	})

	test('number', () => {
		const rules = v.force.number()
		expect(rules.parse('23').valid).toBe(true)
		expect(rules.parse(2).valid).toBe(true)
		expect(rules.parse(false).valid).toBe(true)
		expect(rules.parse({}).valid).toBe(false)
	})

	test('boolean', () => {
		const rules = v.force.boolean()
		expect(rules.parse('23').valid).toBe(true)
		expect(rules.parse(2).valid).toBe(true)
		expect(rules.parse(false).valid).toBe(true)
		expect(rules.parse({}).valid).toBe(true)
	})

	test('time', () => {
		const rules = v.force.time()
		expect(rules.parse('2023').valid).toBe(true)
		expect(rules.parse(2).valid).toBe(true)
		expect(rules.parse(false).valid).toBe(true)
		expect(rules.parse({}).valid).toBe(false)
	})
})
