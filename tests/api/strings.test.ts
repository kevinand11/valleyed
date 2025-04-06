import { describe, expect, test } from 'vitest'

import { v } from '../../src/api'

describe('strings', () => {
	test('string', () => {
		const rules = v.string()
		expect(rules.parse('2').valid).toBe(true)
		expect(rules.parse(2).valid).toBe(false)
		expect(rules.parse(false).valid).toBe(false)
	})

	test('has', () => {
		const rules = v.string().has(2)
		expect(rules.parse('hi').valid).toBe(true)
		expect(rules.parse('h').valid).toBe(false)
		expect(rules.parse('hi!').valid).toBe(false)
	})

	test('min', () => {
		const rules = v.string().min(2)
		expect(rules.parse('1').valid).toBe(false)
		expect(rules.parse('12').valid).toBe(true)
		expect(rules.parse('123').valid).toBe(true)
	})

	test('max', () => {
		const rules = v.string().max(2)
		expect(rules.parse('1').valid).toBe(true)
		expect(rules.parse('12').valid).toBe(true)
		expect(rules.parse('123').valid).toBe(false)
	})

	test('email', () => {
		const rules = v.string().email()
		expect(rules.parse('a@mail.co').valid).toBe(true)
		expect(rules.parse('12').valid).toBe(false)
		expect(rules.parse(false).valid).toBe(false)
	})

	test('url', () => {
		const rules = v.string().url()
		expect(rules.parse('www.a.co').valid).toBe(true)
		expect(rules.parse('12').valid).toBe(false)
		expect(rules.parse(false).valid).toBe(false)
	})

	test('trim', () => {
		const rules = v.string().trim()
		expect(rules.parse(' 12  ').value).toEqual('12')
	})

	test('lower', () => {
		const rules = v.string().lower()
		expect(rules.parse('ABC').value).toEqual('abc')
	})

	test('upper', () => {
		const rules = v.string().upper()
		expect(rules.parse('abc').value).toEqual('ABC')
	})

	test('capitalize', () => {
		const rules = v.string().capitalize()
		expect(rules.parse('abc. no. i.').value).toEqual('Abc. No. I.')
	})

	test('stripHTML', () => {
		const rules = v.string().stripHTML()
		expect(rules.parse('<p>Hi</p>').value).toEqual('Hi')
	})

	test('slice', () => {
		const rules = v.string().slice(2)
		expect(rules.parse('Hi!').value).toEqual('Hi...')
		expect(rules.parse('Hi').value).toEqual('Hi')
		expect(rules.parse('H').value).toEqual('H')
	})
})
