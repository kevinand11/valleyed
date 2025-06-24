import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('number', () => {
	test('lt', () => {
		const rules = v.number().pipe(v.lt(3))
		expect(v.validate(rules, 3).valid).toBe(false)
		expect(v.validate(rules, 2).valid).toBe(true)
		expect(v.validate(rules, 4).valid).toBe(false)
	})

	test('lte', () => {
		const rules = v.number().pipe(v.lte(3))
		expect(v.validate(rules, 3).valid).toBe(true)
		expect(v.validate(rules, 2).valid).toBe(true)
		expect(v.validate(rules, 4).valid).toBe(false)
	})

	test('gt', () => {
		const rules = v.number().pipe(v.gt(3))
		expect(v.validate(rules, 3).valid).toBe(false)
		expect(v.validate(rules, 4).valid).toBe(true)
		expect(v.validate(rules, 2).valid).toBe(false)
	})

	test('lte', () => {
		const rules = v.number().pipe(v.gte(3))
		expect(v.validate(rules, 3).valid).toBe(true)
		expect(v.validate(rules, 4).valid).toBe(true)
		expect(v.validate(rules, 2).valid).toBe(false)
	})

	test('int', () => {
		const rules = v.number().pipe(v.int())
		expect(v.validate(rules, 3.6).valid).toBe(false)
		expect(v.validate(rules, 3).valid).toBe(true)
	})

	test('asRounded', () => {
		const rules = v.number().pipe(v.asRounded(3))
		expect(v.assert(rules, 3.45678)).toEqual(3.457)
		expect(v.assert(rules, 4)).toEqual(4)
	})
})
