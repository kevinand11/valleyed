import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('number', () => {
	test('lt', () => {
		const rules = v.number().pipe(v.lt(3))
		expect(rules.validate(3).valid).toBe(false)
		expect(rules.validate(2).valid).toBe(true)
		expect(rules.validate(4).valid).toBe(false)
	})

	test('lte', () => {
		const rules = v.number().pipe(v.lte(3))
		expect(rules.validate(3).valid).toBe(true)
		expect(rules.validate(2).valid).toBe(true)
		expect(rules.validate(4).valid).toBe(false)
	})

	test('gt', () => {
		const rules = v.number().pipe(v.gt(3))
		expect(rules.validate(3).valid).toBe(false)
		expect(rules.validate(4).valid).toBe(true)
		expect(rules.validate(2).valid).toBe(false)
	})

	test('lte', () => {
		const rules = v.number().pipe(v.gte(3))
		expect(rules.validate(3).valid).toBe(true)
		expect(rules.validate(4).valid).toBe(true)
		expect(rules.validate(2).valid).toBe(false)
	})

	test('int', () => {
		const rules = v.number().pipe(v.int())
		expect(rules.validate(3.6).valid).toBe(false)
		expect(rules.validate(3).valid).toBe(true)
	})

	test('asRounded', () => {
		const rules = v.number().pipe(v.asRounded(3))
		expect(rules.parse(3.45678)).toEqual(3.457)
		expect(rules.parse(4)).toEqual(4)
	})
})
