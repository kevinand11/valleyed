import { hasMaxOf, hasMinOf, isArray, isArrayOf, isBoolean, isNumber, isString } from '../../src/rules'

describe('isArray', () => {
	test('empty array', () => {
		const result = isArray()([])
		expect(result.valid).toBe(true)
	})
	test('non-empty array', () => {
		const result = isArray()([1, '2', [], {}, Symbol()])
		expect(result.valid).toBe(true)
	})
	test('number', () => {
		const result = isArray()(1)
		expect(result.valid).toBe(false)
	})
	test('string', () => {
		const result = isArray()('array')
		expect(result.valid).toBe(false)
	})
	test('object', () => {
		const result = isArray()({})
		expect(result.valid).toBe(false)
	})
	test('function', () => {
		const result = isArray()(() => {
		})
		expect(result.valid).toBe(false)
	})
	test('set', () => {
		const result = isArray()(new Set())
		expect(result.valid).toBe(false)
	})
	test('symbol', () => {
		const result = isArray()(Symbol())
		expect(result.valid).toBe(false)
	})
})

describe('hasMinOf', () => {
	test('valid', () => {
		expect(hasMinOf(4)([1, 2, 3, 4]).valid).toBe(true)
	})
	test('invalid', () => {
		expect(hasMinOf(5)([1, 2, 3, 4]).valid).toBe(false)
	})
})

describe('hasMaxOf', () => {
	test('valid', () => {
		expect(hasMaxOf(4)([1, 2, 3, 4]).valid).toBe(true)
	})
	test('invalid', () => {
		expect(hasMaxOf(3)([1, 2, 3, 4]).valid).toBe(false)
	})
})

describe('isArrayOf', () => {
	test('array of string', () => {
		const result = isArrayOf((val) => isString()(val).valid, 'string')(['a', 'b'])
		expect(result.valid).toBe(true)
	})
	test('array of number', () => {
		const result = isArrayOf((val) => isNumber()(val).valid, 'number')([1, 2])
		expect(result.valid).toBe(true)
	})
	test('array of boolean', () => {
		const result = isArrayOf((val) => isBoolean()(val).valid, 'boolean')([true, false])
		expect(result.valid).toBe(true)
	})
	test('array of array', () => {
		const result = isArrayOf((val) => isArray()(val).valid, 'array')([[], []])
		expect(result.valid).toBe(true)
	})
	test('array of objects', () => {
		const result = isArrayOf((val: { id: number }) => isNumber()(val.id).valid, 'objects')([{ id: 1 }, { id: 2 }])
		expect(result.valid).toBe(true)
	})
	test('mixed array', () => {
		const result = isArrayOf((val) => isNumber()(val).valid, 'number')(['1', 2, true, [], { id: 1 }])
		expect(result.valid).toBe(false)
	})
	test('not an array', () => {
		const result = isArrayOf((val) => isNumber()(val).valid, 'number')(1 as any)
		expect(result.valid).toBe(false)
	})
})