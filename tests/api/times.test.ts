import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('times', () => {
	test('time', () => {
		const rules = v.time()
		const date = new Date()
		expect(rules.safeParse(date.toDateString()).valid).toBe(true)
		expect(rules.safeParse(date.getDate()).valid).toBe(true)
		expect(rules.safeParse(date).valid).toBe(true)
		expect(rules.safeParse(false).valid).toBe(false)
	})

	test('min', () => {
		const rules = v.time().pipe(v.after(() => 2))
		expect(rules.safeParse(3).valid).toBe(true)
		expect(rules.safeParse(2).valid).toBe(false)
		expect(rules.safeParse(1).valid).toBe(false)
	})

	test('max', () => {
		const rules = v.time().pipe(v.before(() => 2))
		expect(rules.safeParse(1).valid).toBe(true)
		expect(rules.safeParse(2).valid).toBe(false)
		expect(rules.safeParse(3).valid).toBe(false)
	})

	test('asStamp', () => {
		const rules = v.time().pipe(v.asStamp())
		const date = new Date()
		expect(rules.parse(date)).toEqual(date.getTime())
	})

	test('asISOString', () => {
		const rules = v.time().pipe(v.asISOString())
		const date = new Date()
		expect(rules.parse(date)).toEqual(date.toISOString())
	})
})
