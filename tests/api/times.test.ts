import { describe, expect, test } from 'vitest'
import { v } from '../../src/api'

describe('times', () => {
	test('time', () => {
		const rules = v.time()
		const date = new Date()
		expect(rules.parse(date.toDateString()).valid).toBe(true)
		expect(rules.parse(date.getDate()).valid).toBe(true)
		expect(rules.parse(date).valid).toBe(true)
		expect(rules.parse(false).valid).toBe(false)
	})

	test('min', () => {
		const rules = v.time().min(2)
		expect(rules.parse(3).valid).toBe(true)
		expect(rules.parse(2).valid).toBe(false)
		expect(rules.parse(1).valid).toBe(false)
	})

	test('max', () => {
		const rules = v.time().max(2)
		expect(rules.parse(1).valid).toBe(true)
		expect(rules.parse(2).valid).toBe(false)
		expect(rules.parse(3).valid).toBe(false)
	})

	test('asStamp', () => {
		const rules = v.time().asStamp()
		const date = new Date()
		expect(rules.parse(date).value).toEqual(date.getTime())
	})

	test('asString', () => {
		const rules = v.time().asString()
		const date = new Date()
		expect(rules.parse(date).value).toEqual(date.toString())
	})

	test('asDate', () => {
		const rules = v.time().asDate()
		const date = new Date()
		expect(rules.parse(date).value).toEqual(date)
	})
})