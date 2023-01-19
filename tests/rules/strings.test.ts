import { hasMinOf, isMaxOf, isMinOf, isString } from '@src/rules'

describe('isString', () => {
	test('truthy string', () => {
		const result = isString()('1')
		expect(result.valid).toBe(true)
	})
	test('falsy string', () => {
		const result = isString()('')
		expect(result.valid).toBe(true)
	})
	test('number', () => {
		const result = isString()(1)
		expect(result.valid).toBe(false)
	})
	test('array', () => {
		const result = isString()([])
		expect(result.valid).toBe(false)
	})
	test('object', () => {
		const result = isString()({})
		expect(result.valid).toBe(false)
	})
	test('function', () => {
		const result = isString()(() => {
		})
		expect(result.valid).toBe(false)
	})
	test('set', () => {
		const result = isString()(new Set())
		expect(result.valid).toBe(false)
	})
	test('symbol', () => {
		const result = isString()(Symbol())
		expect(result.valid).toBe(false)
	})
})

test('isMinOf', () => {
	expect(isMinOf(4)('test').valid).toBe(true)
	expect(isMinOf(5)('test').valid).toBe(false)
})

test('isMaxOf', () => {
	expect(isMaxOf(4)('test').valid).toBe(true)
	expect(isMaxOf(3)('test').valid).toBe(false)
})

test('hasMinOf', () => {
	expect(hasMinOf(4)([1, 2, 3, 4]).valid).toBe(true)
	expect(hasMinOf(5)([1, 2, 3, 4]).valid).toBe(false)
})