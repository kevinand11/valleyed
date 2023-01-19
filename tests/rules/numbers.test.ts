import { isLessThan, isLessThanOrEqualTo, isMoreThan, isMoreThanOrEqualTo, isNumber } from '@src/rules'

describe('isNumber', () => {
	test('truthy number', () => {
		const result = isNumber()(1)
		expect(result.valid).toBe(true)
	})
	test('falsy number', () => {
		const result = isNumber()(0)
		expect(result.valid).toBe(true)
	})
	test('NaN', () => {
		const result = isNumber()(NaN)
		expect(result.valid).toBe(false)
	})
	test('string', () => {
		const result = isNumber()('')
		expect(result.valid).toBe(false)
	})
	test('array', () => {
		const result = isNumber()([])
		expect(result.valid).toBe(false)
	})
	test('object', () => {
		const result = isNumber()({})
		expect(result.valid).toBe(false)
	})
	test('function', () => {
		const result = isNumber()(() => {
		})
		expect(result.valid).toBe(false)
	})
	test('set', () => {
		const result = isNumber()(new Set())
		expect(result.valid).toBe(false)
	})
	test('symbol', () => {
		const result = isNumber()(Symbol())
		expect(result.valid).toBe(false)
	})
})

test('IsMoreThan', () => {
	expect(isMoreThan(3)(5).valid).toBe(true)
	expect(isMoreThan(5)(2).valid).toBe(false)
})

test('IsMoreThanOrEqualTo', () => {
	expect(isMoreThanOrEqualTo(5)(6).valid).toBe(true)
	expect(isMoreThanOrEqualTo(5)(5).valid).toBe(true)
	expect(isMoreThanOrEqualTo(5)(4).valid).toBe(false)
})

test('IsLessThan', () => {
	expect(isLessThan(3)(5).valid).toBe(false)
	expect(isLessThan(5)(2).valid).toBe(true)
})

test('IsLessThanOrEqualTo', () => {
	expect(isLessThanOrEqualTo(5)(4).valid).toBe(true)
	expect(isLessThanOrEqualTo(5)(5).valid).toBe(true)
	expect(isLessThanOrEqualTo(5)(6).valid).toBe(false)
})