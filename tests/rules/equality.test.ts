import { expect, test } from 'vitest'
import { arrayContains, arrayNotContains, isEqualTo, isNotEqualTo } from '../../src/rules'

test('IsEqualTo', () => {
	expect(isEqualTo(1)(1).valid).toBe(true)
	expect(isEqualTo('1')('1').valid).toBe(true)
	expect(isEqualTo(true)(true).valid).toBe(true)
	expect(isEqualTo(undefined)(undefined).valid).toBe(true)
	expect(isEqualTo(null)(null).valid).toBe(true)

	expect(isEqualTo([])([]).valid).toBe(true)
	expect(isEqualTo({})({}).valid).toBe(true)

	expect(isEqualTo(1, (a, b) => a === b)(1).valid).toBe(true)
	expect(isEqualTo('1', (a, b) => a === b)('1').valid).toBe(true)


	expect(isEqualTo({ id: 1 }, (a, b) => a.id === b.id)({ id: 1 }).valid).toBe(true)
	expect(isEqualTo({ id: 2 }, (a, b) => a.id === b.id)({ id: 1 }).valid).toBe(false)
	expect(isEqualTo([1], (a, b) => a === b)([2]).valid).toBe(false)
})

test('IsNotEqualTo', () => {
	expect(isNotEqualTo(1)(1).valid).toBe(false)
	expect(isNotEqualTo(1)('1').valid).toBe(true)
})

test('ArrayContains', () => {
	expect(arrayContains([5])(5).valid).toBe(true)
	expect(arrayContains([4])(5).valid).toBe(false)

	expect(arrayContains(['1'])('1').valid).toBe(true)
	expect(arrayContains(['2'])('1').valid).toBe(false)

	expect(arrayContains([{ id: 1 }])({ id: 1 }).valid).toBe(true)
	expect(arrayContains([{ id: 2 }])({ id: 1 }).valid).toBe(false)
})

test('ArrayNotContains', () => {
	expect(arrayNotContains([5])(5).valid).toBe(false)
	expect(arrayNotContains([4])(5).valid).toBe(true)

	expect(arrayNotContains(['1'])('1').valid).toBe(false)
	expect(arrayNotContains(['2'])('1').valid).toBe(true)

	expect(arrayNotContains([{ id: 1 }])({ id: 1 }).valid).toBe(false)
	expect(arrayNotContains([{ id: 2 }])({ id: 1 }).valid).toBe(true)
})