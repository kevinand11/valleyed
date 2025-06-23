import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('times', () => {
	test('time', () => {
		const rules = v.time()
		const date = new Date()
		expect(rules.validate(date.toDateString()).valid).toBe(true)
		expect(rules.validate(date.getDate()).valid).toBe(true)
		expect(rules.validate(date).valid).toBe(true)
		expect(rules.validate(false).valid).toBe(false)
	})

	test('min', () => {
		const rules = v.time().pipe(v.after(() => 2))
		expect(rules.validate(3).valid).toBe(true)
		expect(rules.validate(2).valid).toBe(false)
		expect(rules.validate(1).valid).toBe(false)
	})

	test('max', () => {
		const rules = v.time().pipe(v.before(() => 2))
		expect(rules.validate(1).valid).toBe(true)
		expect(rules.validate(2).valid).toBe(false)
		expect(rules.validate(3).valid).toBe(false)
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
