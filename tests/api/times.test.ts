import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('times', () => {
	test('time', () => {
		const rules = v.time()
		const date = new Date()
		expect(v.validate(rules, date.toDateString()).valid).toBe(true)
		expect(v.validate(rules, date.getDate()).valid).toBe(true)
		expect(v.validate(rules, date).valid).toBe(true)
		expect(v.validate(rules, false).valid).toBe(false)
	})

	test('min', () => {
		const rules = v.time().pipe(v.after(2))
		expect(v.validate(rules, 3).valid).toBe(true)
		expect(v.validate(rules, 2).valid).toBe(false)
		expect(v.validate(rules, 1).valid).toBe(false)
	})

	test('max', () => {
		const rules = v.time().pipe(v.before(2))
		expect(v.validate(rules, 1).valid).toBe(true)
		expect(v.validate(rules, 2).valid).toBe(false)
		expect(v.validate(rules, 3).valid).toBe(false)
	})

	test('asStamp', () => {
		const rules = v.time().pipe(v.asStamp())
		const date = new Date()
		expect(v.assert(rules, date)).toEqual(date.getTime())
	})

	test('asISOString', () => {
		const rules = v.time().pipe(v.asISOString())
		const date = new Date()
		expect(v.assert(rules, date)).toEqual(date.toISOString())
	})
})
