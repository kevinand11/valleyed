import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('strings', () => {
	test('email', () => {
		const rules = v.string().pipe(v.email())
		expect(v.validate(rules, 'a@mail.co').valid).toBe(true)
		expect(v.validate(rules, '12').valid).toBe(false)
		expect(v.validate(rules, false).valid).toBe(false)
	})

	test('url', () => {
		const rules = v.string().pipe(v.url())
		expect(v.validate(rules, 'www.a.co').valid).toBe(true)
		expect(v.validate(rules, '12').valid).toBe(false)
		expect(v.validate(rules, false).valid).toBe(false)
	})

	test('withStrippedHtml', () => {
		const rules = v.string().pipe(v.withStrippedHtml(v.min(1)))
		expect(v.validate(rules, '<img>').valid).toBe(false)
		expect(v.validate(rules, '<img>1').valid).toBe(true)
		expect(v.validate(rules, '<p></p>').valid).toBe(false)
		expect(v.validate(rules, '<p>Hi</p>').valid).toBe(true)
	})

	test('asTrimmed', () => {
		const rules = v.string().pipe(v.asTrimmed())
		expect(v.assert(rules, ' 12  ')).toEqual('12')
	})

	test('asLowercased', () => {
		const rules = v.string().pipe(v.asLowercased())
		expect(v.assert(rules, 'ABC')).toEqual('abc')
	})

	test('asUppercased', () => {
		const rules = v.string().pipe(v.asUppercased())
		expect(v.assert(rules, 'abc')).toEqual('ABC')
	})

	test('asCapitalized', () => {
		const rules = v.string().pipe(v.asCapitalized())
		expect(v.assert(rules, 'abc. no. i.')).toEqual('Abc. No. I.')
	})

	test('asStrippedHtml', () => {
		const rules = v.string().pipe(v.asStrippedHtml())
		expect(v.assert(rules, '<p>Hi</p>')).toEqual('Hi')
	})

	test('asSliced', () => {
		const rules = v.string().pipe(v.asSliced(2))
		expect(v.assert(rules, 'Hi!')).toEqual('Hi...')
		expect(v.assert(rules, 'Hi')).toEqual('Hi')
		expect(v.assert(rules, 'H')).toEqual('H')
	})
})
