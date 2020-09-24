import { isNotRequired, isRequired, isRequiredIf } from '../../src/rules'

describe('IsRequired', () => {
	test('undefined', () => {
		const result = isRequired(undefined)
		expect(result.valid).toBe(false)
	})
	test('null', () => {
		const result = isRequired(null)
		expect(result.valid).toBe(false)
	})
	test('empty string', () => {
		const result = isRequired(undefined)
		expect(result.valid).toBe(false)
	})
	test('any truthy value', () => {
		let result = isRequired('any')
		expect(result.valid).toBe(true)

		result = isRequired(0)
		expect(result.valid).toBe(true)

		result = isRequired([])
		expect(result.valid).toBe(true)

		result = isRequired({})
		expect(result.valid).toBe(true)
	})
})

describe('IsNotRequired', () => {
	test('undefined', () => {
		const result = isNotRequired(undefined)
		expect(result.valid).toBe(true)
	})
	test('null', () => {
		const result = isNotRequired(null)
		expect(result.valid).toBe(false)
	})
	test('any non-null value', () => {
		let result = isNotRequired('any')
		expect(result.valid).toBe(true)

		result = isNotRequired(0)
		expect(result.valid).toBe(true)

		result = isNotRequired([])
		expect(result.valid).toBe(true)

		result = isNotRequired({})
		expect(result.valid).toBe(true)
	})
})

describe('IsRequiredIf', () => {
	test('undefined with false', () => {
		const result = isRequiredIf(undefined, false)
		expect(result.valid).toBe(true)
	})
	test('null with false', () => {
		const result = isRequiredIf(null, false)
		expect(result.valid).toBe(false)
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
