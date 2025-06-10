import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('core', () => {
	test('custom', () => {
		const rules = v.custom((val) => val !== '')
		expect(rules.safeParse('hi').valid).toBe(true)
		expect(rules.safeParse('').valid).toBe(false)
	})

	test('eq', () => {
		const rules = v.eq('hi')
		expect(rules.safeParse('hi').valid).toBe(true)
		expect(rules.safeParse('').valid).toBe(false)
	})

	test('is', () => {
		const rules = v.is('hi')
		expect(rules.safeParse('hi').valid).toBe(true)
		expect(rules.safeParse('').valid).toBe(false)
	})

	test('ne', () => {
		const rules = v.ne('')
		expect(rules.safeParse('hi').valid).toBe(true)
		expect(rules.safeParse('').valid).toBe(false)
	})

	test('has', () => {
		const stringRules = v.string().pipe(v.has(2))
		expect(stringRules.safeParse('hi').valid).toBe(true)
		expect(stringRules.safeParse('h').valid).toBe(false)
		expect(stringRules.safeParse('hi!').valid).toBe(false)
		const arrayRules = v.array(v.any()).pipe(v.has(2))
		expect(arrayRules.safeParse([1]).valid).toBe(false)
		expect(arrayRules.safeParse([1, 2]).valid).toBe(true)
		expect(arrayRules.safeParse([1, 2, 3]).valid).toBe(false)
	})

	test('min array', () => {
		const strinRules = v.string().pipe(v.min(2))
		expect(strinRules.safeParse('1').valid).toBe(false)
		expect(strinRules.safeParse('12').valid).toBe(true)
		expect(strinRules.safeParse('123').valid).toBe(true)
		const arrayRules = v.array(v.any()).pipe(v.min(2))
		expect(arrayRules.safeParse([1]).valid).toBe(false)
		expect(arrayRules.safeParse([1, 2]).valid).toBe(true)
		expect(arrayRules.safeParse([1, 2, 3]).valid).toBe(true)
	})

	test('max array', () => {
		const stringRules = v.string().pipe(v.max(2))
		expect(stringRules.safeParse('1').valid).toBe(true)
		expect(stringRules.safeParse('12').valid).toBe(true)
		expect(stringRules.safeParse('123').valid).toBe(false)
		const arrayRules = v.array(v.any()).pipe(v.max(2))
		expect(arrayRules.safeParse([1]).valid).toBe(true)
		expect(arrayRules.safeParse([1, 2]).valid).toBe(true)
		expect(arrayRules.safeParse([1, 2, 3]).valid).toBe(false)
	})

	test('in', () => {
		const rules = v.in([1, 2, 3])
		expect(rules.safeParse('1').valid).toBe(false)
		expect(rules.safeParse(4).valid).toBe(false)
		expect(rules.safeParse(true).valid).toBe(false)
		expect(rules.safeParse(1).valid).toBe(true)
	})

	test('nin', () => {
		const rules = v.nin([1, 2, 3])
		expect(rules.safeParse('1').valid).toBe(true)
		expect(rules.safeParse(4).valid).toBe(true)
		expect(rules.safeParse(true).valid).toBe(true)
		expect(rules.safeParse(1).valid).toBe(false)
	})
})
