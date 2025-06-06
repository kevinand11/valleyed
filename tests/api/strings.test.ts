import { describe, expect, test } from 'vitest'

import { v } from '../../src/pipe'

describe('strings', () => {
	test('has', () => {
		const rules = v.string().pipe(v.has(2))
		expect(rules.safeParse('hi').valid).toBe(true)
		expect(rules.safeParse('h').valid).toBe(false)
		expect(rules.safeParse('hi!').valid).toBe(false)
	})

	test('min', () => {
		const rules = v.string().pipe(v.min(2))
		expect(rules.safeParse('1').valid).toBe(false)
		expect(rules.safeParse('12').valid).toBe(true)
		expect(rules.safeParse('123').valid).toBe(true)
	})

	test('max', () => {
		const rules = v.string().pipe(v.max(2))
		expect(rules.safeParse('1').valid).toBe(true)
		expect(rules.safeParse('12').valid).toBe(true)
		expect(rules.safeParse('123').valid).toBe(false)
	})

	test('email', () => {
		const rules = v.string().pipe(v.email())
		expect(rules.safeParse('a@mail.co').valid).toBe(true)
		expect(rules.safeParse('12').valid).toBe(false)
		expect(rules.safeParse(false).valid).toBe(false)
	})

	test('url', () => {
		const rules = v.string().pipe(v.url())
		expect(rules.safeParse('www.a.co').valid).toBe(true)
		expect(rules.safeParse('12').valid).toBe(false)
		expect(rules.safeParse(false).valid).toBe(false)
	})

	test('trim', () => {
		const rules = v.string().pipe(v.asTrim())
		expect(rules.parse(' 12  ')).toEqual('12')
	})

	test('lower', () => {
		const rules = v.string().pipe(v.asLower())
		expect(rules.parse('ABC')).toEqual('abc')
	})

	test('upper', () => {
		const rules = v.string().pipe(v.asUpper())
		expect(rules.parse('abc')).toEqual('ABC')
	})

	test('capitalize', () => {
		const rules = v.string().pipe(v.asCapitalize())
		expect(rules.parse('abc. no. i.')).toEqual('Abc. No. I.')
	})

	test('stripHTML', () => {
		const rules = v.string().pipe(v.asStrippedHTML())
		expect(rules.parse('<p>Hi</p>')).toEqual('Hi')
	})

	test('slice', () => {
		const rules = v.string().pipe(v.asSliced(2))
		expect(rules.parse('Hi!')).toEqual('Hi...')
		expect(rules.parse('Hi')).toEqual('Hi')
		expect(rules.parse('H')).toEqual('H')
	})
})
