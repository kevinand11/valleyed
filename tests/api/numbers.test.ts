import { describe, expect, test } from 'vitest'
import { v } from '../../src/api'

describe('number', () => {
	test('number', () => {
		const rules = v.number()
		expect(rules.parse('2').valid).toBe(false)
		expect(rules.parse(2).valid).toBe(true)
		expect(rules.parse(false).valid).toBe(false)
	})

	test('lt', () => {
		const rules = v.number().lt(3)
		expect(rules.parse(3).valid).toBe(false)
		expect(rules.parse(2).valid).toBe(true)
		expect(rules.parse(4).valid).toBe(false)
	})

	test('lte', () => {
		const rules = v.number().lte(3)
		expect(rules.parse(3).valid).toBe(true)
		expect(rules.parse(2).valid).toBe(true)
		expect(rules.parse(4).valid).toBe(false)
	})

	test('gt', () => {
		const rules = v.number().gt(3)
		expect(rules.parse(3).valid).toBe(false)
		expect(rules.parse(4).valid).toBe(true)
		expect(rules.parse(2).valid).toBe(false)
	})

	test('lte', () => {
		const rules = v.number().gte(3)
		expect(rules.parse(3).valid).toBe(true)
		expect(rules.parse(4).valid).toBe(true)
		expect(rules.parse(2).valid).toBe(false)
	})

	test('int', () => {
		const rules = v.number().int()
		expect(rules.parse(3.6).valid).toBe(false)
		expect(rules.parse(3).valid).toBe(true)
	})

	test('round', () => {
		const rules = v.number().round(3)
		expect(rules.parse(3.45678).value).toEqual(3.457)
		expect(rules.parse(4).value).toEqual(4)
	})
})