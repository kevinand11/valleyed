import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('core', () => {
	test('custom', () => {
		const rules = v.custom((val) => val !== '')
		expect(v.validate(rules, 'hi').valid).toBe(true)
		expect(v.validate(rules, '').valid).toBe(false)
	})

	test('eq', () => {
		const rules = v.eq('hi')
		expect(v.validate(rules, 'hi').valid).toBe(true)
		expect(v.validate(rules, '').valid).toBe(false)
	})

	test('is', () => {
		const rules = v.is('hi')
		expect(v.validate(rules, 'hi').valid).toBe(true)
		expect(v.validate(rules, '').valid).toBe(false)
	})

	test('ne', () => {
		const rules = v.ne('')
		expect(v.validate(rules, 'hi').valid).toBe(true)
		expect(v.validate(rules, '').valid).toBe(false)
	})

	test('has', () => {
		const stringRules = v.string().pipe(v.has(2))
		expect(v.validate(stringRules, 'hi').valid).toBe(true)
		expect(v.validate(stringRules, 'h').valid).toBe(false)
		expect(v.validate(stringRules, 'hi!').valid).toBe(false)
		const arrayRules = v.array(v.any()).pipe(v.has(2))
		expect(v.validate(arrayRules, [1]).valid).toBe(false)
		expect(v.validate(arrayRules, [1, 2]).valid).toBe(true)
		expect(v.validate(arrayRules, [1, 2, 3]).valid).toBe(false)
	})

	test('min array', () => {
		const stringRules = v.string().pipe(v.min(2))
		expect(v.validate(stringRules, '1').valid).toBe(false)
		expect(v.validate(stringRules, '12').valid).toBe(true)
		expect(v.validate(stringRules, '123').valid).toBe(true)
		const arrayRules = v.array(v.any()).pipe(v.min(2))
		expect(v.validate(arrayRules, [1]).valid).toBe(false)
		expect(v.validate(arrayRules, [1, 2]).valid).toBe(true)
		expect(v.validate(arrayRules, [1, 2, 3]).valid).toBe(true)
	})

	test('max array', () => {
		const stringRules = v.string().pipe(v.max(2))
		expect(v.validate(stringRules, '1').valid).toBe(true)
		expect(v.validate(stringRules, '12').valid).toBe(true)
		expect(v.validate(stringRules, '123').valid).toBe(false)
		const arrayRules = v.array(v.any()).pipe(v.max(2))
		expect(v.validate(arrayRules, [1]).valid).toBe(true)
		expect(v.validate(arrayRules, [1, 2]).valid).toBe(true)
		expect(v.validate(arrayRules, [1, 2, 3]).valid).toBe(false)
	})

	test('in', () => {
		const rules = v.in([1, 2, 3])
		expect(v.validate(rules, '1').valid).toBe(false)
		expect(v.validate(rules, 4).valid).toBe(false)
		expect(v.validate(rules, true).valid).toBe(false)
		expect(v.validate(rules, 1).valid).toBe(true)
	})

	test('nin', () => {
		const rules = v.nin([1, 2, 3])
		expect(v.validate(rules, '1').valid).toBe(true)
		expect(v.validate(rules, 4).valid).toBe(true)
		expect(v.validate(rules, true).valid).toBe(true)
		expect(v.validate(rules, 1).valid).toBe(false)
	})
})
