import {
	arrayContains,
	hasLessThan,
	hasLessThanOrEqualTo,
	hasMoreThan,
	hasMoreThanOrEqualTo,
	isDeepEqualTo,
	isExtractedHTMLLongerThan,
	isLessThan,
	isLessThanOrEqualTo,
	isLongerThan,
	isLongerThanOrEqualTo,
	isMoreThan,
	isMoreThanOrEqualTo,
	isShallowEqualTo,
	isShorterThan,
	isShorterThanOrEqualTo
} from '../../src/rules'

test('IsLongerThan', () => {
	expect(isLongerThan(3)('test').valid).toBe(true)
	expect(isLongerThan(4)('test').valid).toBe(false)
})

test('IsLongerThanOrEqualTo', () => {
	expect(isLongerThanOrEqualTo(4)('test').valid).toBe(true)
	expect(isLongerThanOrEqualTo(5)('test').valid).toBe(false)
})

test('IsShorterThan', () => {
	expect(isShorterThan(5)('test').valid).toBe(true)
	expect(isShorterThan(4)('test').valid).toBe(false)
})

test('IsShorterThanOrEqualTo', () => {
	expect(isShorterThanOrEqualTo(4)('test').valid).toBe(true)
	expect(isShorterThanOrEqualTo(3)('test').valid).toBe(false)
})

test('IsExtractedHTMLLongerThan', () => {
	expect(isExtractedHTMLLongerThan(3)('<p>test</p>').valid).toBe(true)
	expect(isExtractedHTMLLongerThan(4)('<p>test</p>').valid).toBe(false)
})

test('HasMoreThan', () => {
	expect(hasMoreThan(3)([1, 2, 3, 4]).valid).toBe(true)
	expect(hasMoreThan(4)([1, 2, 3, 4]).valid).toBe(false)
})

test('HasMoreThanOrEqualTo', () => {
	expect(hasMoreThanOrEqualTo(4)([1, 2, 3, 4]).valid).toBe(true)
	expect(hasMoreThanOrEqualTo(5)([1, 2, 3, 4]).valid).toBe(false)
})

test('HasLessThan', () => {
	expect(hasLessThan(5)([1, 2, 3, 4]).valid).toBe(true)
	expect(hasLessThan(4)([1, 2, 3, 4]).valid).toBe(false)
})

test('HasLessThanOrEqualTo', () => {
	expect(hasLessThanOrEqualTo(4)([1, 2, 3, 4]).valid).toBe(true)
	expect(hasLessThanOrEqualTo(3)([1, 2, 3, 4]).valid).toBe(false)
})

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

test('ArrayContains', () => {
	expect(arrayContains([5], (cur, val) => cur === val)(5).valid).toBe(true)
	expect(arrayContains([4], (cur, val) => cur === val)(5).valid).toBe(false)

	expect(arrayContains(['1'], (cur, val) => cur === val)('1').valid).toBe(true)
	expect(arrayContains(['2'], (cur, val) => cur === val)('1').valid).toBe(false)

	expect(arrayContains([{ id: 1 }], (cur, val) => cur.id === val.id)({ id: 1 }).valid).toBe(true)
	expect(arrayContains([{ id: 2 }], (cur, val) => cur === val)({ id: 1 }).valid).toBe(false)
})