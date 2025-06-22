import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('strings', () => {
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

	test('withStrippedHtml', () => {
		const rules = v.string().pipe(v.withStrippedHtml(v.min(1)))
		expect(rules.safeParse('<img>').valid).toBe(false)
		expect(rules.safeParse('<img>1').valid).toBe(true)
		expect(rules.safeParse('<p></p>').valid).toBe(false)
		expect(rules.safeParse('<p>Hi</p>').valid).toBe(true)
	})

	test('asTrimmed', () => {
		const rules = v.string().pipe(v.asTrimmed())
		expect(rules.parse(' 12  ')).toEqual('12')
	})

	test('asLowercased', () => {
		const rules = v.string().pipe(v.asLowercased())
		expect(rules.parse('ABC')).toEqual('abc')
	})

	test('asUppercased', () => {
		const rules = v.string().pipe(v.asUppercased())
		expect(rules.parse('abc')).toEqual('ABC')
	})

	test('asCapitalized', () => {
		const rules = v.string().pipe(v.asCapitalized())
		expect(rules.parse('abc. no. i.')).toEqual('Abc. No. I.')
	})

	test('asStrippedHtml', () => {
		const rules = v.string().pipe(v.asStrippedHtml())
		expect(rules.parse('<p>Hi</p>')).toEqual('Hi')
	})

	test('asSliced', () => {
		const rules = v.string().pipe(v.asSliced(2))
		expect(rules.parse('Hi!')).toEqual('Hi...')
		expect(rules.parse('Hi')).toEqual('Hi')
		expect(rules.parse('H')).toEqual('H')
	})
})
