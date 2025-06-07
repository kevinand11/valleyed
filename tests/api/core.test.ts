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
