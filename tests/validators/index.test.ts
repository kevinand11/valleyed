import { describe, expect, test } from 'vitest'
import { isMinOf, isNumber, isString } from '../../src/rules'
import { Validator } from '../../src/validators'

describe('Testing and', () => {
	test('Valid', () => {
		const res = Validator.and('hi', [
			[isString()],
			[isMinOf(1)]
		], {})
		expect(res.valid).toBe(true)
	})
	test('Invalid', () => {
		const res = Validator.and('hi', [
			[isString()],
			[isMinOf(3)]
		], {})
		expect(res.valid).toBe(false)
	})
})

describe('Testing or', () => {
	test('Valid', () => {
		const res = Validator.or('hi', [
			[isNumber()],
			[isMinOf(1)]
		], {})
		expect(res.valid).toBe(true)
	})
	test('Invalid', () => {
		const res = Validator.or('hi', [
			[isNumber()],
			[isMinOf(3)]
		], {})
		expect(res.valid).toBe(false)
	})
})
