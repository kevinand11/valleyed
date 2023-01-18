import { arrayContains, isDeepEqualTo, isShallowEqualTo } from '@src/rules'

test('IsShallowEqualTo', () => {
	expect(isShallowEqualTo(1)(1).valid).toBe(true)
	expect(isShallowEqualTo('1')('1').valid).toBe(true)
	expect(isShallowEqualTo(true)(true).valid).toBe(true)
	expect(isShallowEqualTo(undefined)(undefined).valid).toBe(true)
	expect(isShallowEqualTo(null)(null).valid).toBe(true)

	expect(isShallowEqualTo([])([]).valid).toBe(false)
	expect(isShallowEqualTo({})({}).valid).toBe(false)
})

test('IsDeepEqualTo', () => {
	expect(isDeepEqualTo(1, (a, b) => a === b)(1).valid).toBe(true)
	expect(isDeepEqualTo('1', (a, b) => a === b)('1').valid).toBe(true)
	expect(isDeepEqualTo({ id: 1 }, (a, b) => a.id === b.id)({ id: 1 }).valid).toBe(true)
	expect(isDeepEqualTo({ id: 2 }, (a, b) => a.id === b.id)({ id: 1 }).valid).toBe(false)
	expect(isDeepEqualTo([], (a, b) => a === b)([]).valid).toBe(false)
})

test('ArrayContains', () => {
	expect(arrayContains([5], (cur, val) => cur === val)(5).valid).toBe(true)
	expect(arrayContains([4], (cur, val) => cur === val)(5).valid).toBe(false)

	expect(arrayContains(['1'], (cur, val) => cur === val)('1').valid).toBe(true)
	expect(arrayContains(['2'], (cur, val) => cur === val)('1').valid).toBe(false)

	expect(arrayContains([{ id: 1 }], (cur, val) => cur.id === val.id)({ id: 1 }).valid).toBe(true)
	expect(arrayContains([{ id: 2 }], (cur, val) => cur === val)({ id: 1 }).valid).toBe(false)
})