import { describe, expect, test } from 'vitest'
import { isEmail, isUrl } from '../../src/rules'

describe('isEmail()', () => {
	test('valid email', () => {
		const result = isEmail()('email@example.com')
		expect(result.valid).toBe(true)
	})
	test('email without @', () => {
		const result = isEmail()('email-example.com')
		expect(result.valid).toBe(false)
	})
	test('email without .', () => {
		const result = isEmail()('email@examplecom')
		expect(result.valid).toBe(false)
	})
})


describe('isUrl()', () => {
	test('valid url', () => {
		const result = isUrl()('google.com')
		expect(result.valid).toBe(true)
	})
	test('invalid url', () => {
		const result = isUrl()('google-com')
		expect(result.valid).toBe(false)
	})
})
