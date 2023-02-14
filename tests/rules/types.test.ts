import { isBoolean, isNull, isUndefined } from '../../src/rules'

describe('isUndefined', () => {
	test('undefined', () => {
		const result = isUndefined()(undefined)
		expect(result.valid).toBe(true)
	})
	test('boolean', () => {
		const result = isUndefined()(true)
		expect(result.valid).toBe(false)
	})
	test('string', () => {
		const result = isUndefined()('hello')
		expect(result.valid).toBe(false)
	})
	test('number', () => {
		const result = isUndefined()(1)
		expect(result.valid).toBe(false)
	})
	test('object', () => {
		const result = isUndefined()({})
		expect(result.valid).toBe(false)
	})
	test('array', () => {
		const result = isUndefined()([])
		expect(result.valid).toBe(false)
	})
})

describe('isNull', () => {
	test('null', () => {
		const result = isNull()(null)
		expect(result.valid).toBe(true)
	})
	test('boolean', () => {
		const result = isNull()(true)
		expect(result.valid).toBe(false)
	})
	test('string', () => {
		const result = isNull()('hello')
		expect(result.valid).toBe(false)
	})
	test('number', () => {
		const result = isNull()(1)
		expect(result.valid).toBe(false)
	})
	test('object', () => {
		const result = isNull()({})
		expect(result.valid).toBe(false)
	})
	test('array', () => {
		const result = isNull()([])
		expect(result.valid).toBe(false)
	})
})

describe('IsBoolean', () => {
	test('false', () => {
		const result = isBoolean()(false)
		expect(result.valid).toBe(true)
	})
	test('true', () => {
		const result = isBoolean()(true)
		expect(result.valid).toBe(true)
	})
	test('truthy string', () => {
		const result = isBoolean()('hello')
		expect(result.valid).toBe(false)
	})
	test('falsy string', () => {
		const result = isBoolean()('')
		expect(result.valid).toBe(false)
	})
	test('truthy number', () => {
		const result = isBoolean()(1)
		expect(result.valid).toBe(false)
	})
	test('falsy number', () => {
		const result = isBoolean()(0)
		expect(result.valid).toBe(false)
	})
	test('object', () => {
		const result = isBoolean()({})
		expect(result.valid).toBe(false)
	})
	test('array', () => {
		const result = isBoolean()([])
		expect(result.valid).toBe(false)
	})
})