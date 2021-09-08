import { isRequiredIf } from '../../src/rules'

describe('IsRequiredIf', () => {
	test('undefined with false', () => {
		const result = isRequiredIf(undefined, false)
		expect(result.valid).toBe(true)
	})
	test('null with false', () => {
		const result = isRequiredIf(null, false)
		expect(result.valid).toBe(true)
	})
	test('undefined with true', () => {
		const result = isRequiredIf(undefined, true)
		expect(result.valid).toBe(false)
	})
	test('null with true', () => {
		const result = isRequiredIf(null, true)
		expect(result.valid).toBe(false)
	})
	test('any non-null value with false', () => {
		const result = isRequiredIf('any', false)
		expect(result.valid).toBe(true)
	})
	test('any non-null value with true', () => {
		const result = isRequiredIf('any', true)
		expect(result.valid).toBe(true)
	})
})
