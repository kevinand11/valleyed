import { isArray, isArrayOf, isBoolean, isNull, isNumber, isString, isUndefined } from '../../src/rules'

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

describe('isString()', () => {
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

describe('isNumber()', () => {
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

describe('isArray()', () => {
	test('empty string', () => {
		const result = isArray()([])
		expect(result.valid).toBe(true)
	})
	test('non-empty string', () => {
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

describe('isArray()Of', () => {
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