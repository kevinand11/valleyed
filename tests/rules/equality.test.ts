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
	expect(isLongerThan('test', 3).valid).toBe(true)
	expect(isLongerThan('test', 4).valid).toBe(false)

	expect(isLongerThan(undefined as unknown as string, 5).valid).toBe(false)
	expect(isLongerThan(null as unknown as string, 5).valid).toBe(false)
	expect(isLongerThan([] as unknown as string, 5).valid).toBe(false)
	expect(isLongerThan({} as unknown as string, 5).valid).toBe(false)
})

test('IsLongerThanOrEqualTo', () => {
	expect(isLongerThanOrEqualTo('test', 4).valid).toBe(true)
	expect(isLongerThanOrEqualTo('test', 5).valid).toBe(false)

	expect(isLongerThanOrEqualTo(undefined as unknown as string, 5).valid).toBe(false)
	expect(isLongerThanOrEqualTo(null as unknown as string, 5).valid).toBe(false)
	expect(isLongerThanOrEqualTo([] as unknown as string, 5).valid).toBe(false)
	expect(isLongerThanOrEqualTo({} as unknown as string, 5).valid).toBe(false)
})

test('IsShorterThan', () => {
	expect(isShorterThan('test', 5).valid).toBe(true)
	expect(isShorterThan('test', 4).valid).toBe(false)

	expect(isShorterThan(undefined as unknown as string, 5).valid).toBe(false)
	expect(isShorterThan(null as unknown as string, 5).valid).toBe(false)
	expect(isShorterThan([] as unknown as string, 5).valid).toBe(false)
	expect(isShorterThan({} as unknown as string, 5).valid).toBe(false)
})

test('IsShorterThanOrEqualTo', () => {
	expect(isShorterThanOrEqualTo('test', 4).valid).toBe(true)
	expect(isShorterThanOrEqualTo('test', 3).valid).toBe(false)

	expect(isShorterThanOrEqualTo(undefined as unknown as string, 5).valid).toBe(false)
	expect(isShorterThanOrEqualTo(null as unknown as string, 5).valid).toBe(false)
	expect(isShorterThanOrEqualTo([] as unknown as string, 5).valid).toBe(false)
	expect(isShorterThanOrEqualTo({} as unknown as string, 5).valid).toBe(false)
})

test('IsExtractedHTMLLongerThan', () => {
	expect(isExtractedHTMLLongerThan('<p>test</p>', 3).valid).toBe(true)
	expect(isExtractedHTMLLongerThan('<p>test</p>', 4).valid).toBe(false)

	expect(isExtractedHTMLLongerThan(undefined as unknown as string, 5).valid).toBe(false)
	expect(isExtractedHTMLLongerThan(null as unknown as string, 5).valid).toBe(false)
	expect(isExtractedHTMLLongerThan([] as unknown as string, 5).valid).toBe(false)
	expect(isExtractedHTMLLongerThan({} as unknown as string, 25).valid).toBe(false)
})

test('HasMoreThan', () => {
	expect(hasMoreThan([1, 2, 3, 4], 3).valid).toBe(true)
	expect(hasMoreThan([1, 2, 3, 4], 4).valid).toBe(false)

	expect(hasMoreThan(undefined as unknown as any[], 5).valid).toBe(false)
	expect(hasMoreThan(null as unknown as any[], 5).valid).toBe(false)
	expect(hasMoreThan({} as unknown as any[], 25).valid).toBe(false)
})

test('HasMoreThanOrEqualTo', () => {
	expect(hasMoreThanOrEqualTo([1, 2, 3, 4], 4).valid).toBe(true)
	expect(hasMoreThanOrEqualTo([1, 2, 3, 4], 5).valid).toBe(false)

	expect(hasMoreThanOrEqualTo(undefined as unknown as any[], 5).valid).toBe(false)
	expect(hasMoreThanOrEqualTo(null as unknown as any[], 5).valid).toBe(false)
	expect(hasMoreThanOrEqualTo({} as unknown as any[], 25).valid).toBe(false)
})

test('HasLessThan', () => {
	expect(hasLessThan([1, 2, 3, 4], 5).valid).toBe(true)
	expect(hasLessThan([1, 2, 3, 4], 4).valid).toBe(false)

	expect(hasLessThan(undefined as unknown as any[], 5).valid).toBe(false)
	expect(hasLessThan(null as unknown as any[], 5).valid).toBe(false)
	expect(hasLessThan({} as unknown as any[], 25).valid).toBe(false)
})

test('HasLessThanOrEqualTo', () => {
	expect(hasLessThanOrEqualTo([1, 2, 3, 4], 4).valid).toBe(true)
	expect(hasLessThanOrEqualTo([1, 2, 3, 4], 3).valid).toBe(false)

	expect(hasLessThanOrEqualTo(undefined as unknown as any[], 5).valid).toBe(false)
	expect(hasLessThanOrEqualTo(null as unknown as any[], 5).valid).toBe(false)
	expect(hasLessThanOrEqualTo({} as unknown as any[], 25).valid).toBe(false)
})

test('IsShallowEqualTo', () => {
	expect(isShallowEqualTo(1, 1).valid).toBe(true)
	expect(isShallowEqualTo('1', '1').valid).toBe(true)
	expect(isShallowEqualTo(true, true).valid).toBe(true)
	expect(isShallowEqualTo(undefined, undefined).valid).toBe(true)
	expect(isShallowEqualTo(null, null).valid).toBe(true)

	expect(isShallowEqualTo([], []).valid).toBe(false)
	expect(isShallowEqualTo({}, {}).valid).toBe(false)
})

test('IsDeepEqualTo', () => {
	expect(isDeepEqualTo(1, 1, (a, b) => a === b).valid).toBe(true)
	expect(isDeepEqualTo('1', '1', (a, b) => a === b).valid).toBe(true)
	expect(isDeepEqualTo({ id: 1 }, { id: 1 }, (a, b) => a.id === b.id).valid).toBe(true)
	expect(isDeepEqualTo({ id: 1 }, { id: 2 }, (a, b) => a.id === b.id).valid).toBe(false)
	expect(isDeepEqualTo([], [], (a, b) => a === b).valid).toBe(false)
})

test('IsMoreThan', () => {
	expect(isMoreThan(5, 3).valid).toBe(true)
	expect(isMoreThan(2, 5).valid).toBe(false)

	expect(isMoreThan('c' as unknown as number, 'a' as unknown as number).valid).toBe(true)
	expect(isMoreThan('a' as unknown as number, 'c' as unknown as number).valid).toBe(false)

	expect(isMoreThan(undefined as unknown as number, undefined as unknown as number).valid).toBe(false)
	expect(isMoreThan(null as unknown as number, null as unknown as number).valid).toBe(false)

	expect(isMoreThan([] as unknown as number, [] as unknown as number).valid).toBe(false)
	expect(isMoreThan(['1'] as unknown as number, ['2'] as unknown as number).valid).toBe(false)
	expect(isMoreThan(['2'] as unknown as number, ['1'] as unknown as number).valid).toBe(true)

	expect(isMoreThan({} as unknown as number, {} as unknown as number).valid).toBe(false)
})

test('IsMoreThanOrEqualTo', () => {
	expect(isMoreThanOrEqualTo(6, 5).valid).toBe(true)
	expect(isMoreThanOrEqualTo(5, 5).valid).toBe(true)
	expect(isMoreThanOrEqualTo(4, 5).valid).toBe(false)

	expect(isMoreThanOrEqualTo('c' as unknown as number, 'a' as unknown as number).valid).toBe(true)
	expect(isMoreThanOrEqualTo('a' as unknown as number, 'c' as unknown as number).valid).toBe(false)
	expect(isMoreThanOrEqualTo('b' as unknown as number, 'b' as unknown as number).valid).toBe(true)

	expect(isMoreThanOrEqualTo(undefined as unknown as number, undefined as unknown as number).valid).toBe(false)
	expect(isMoreThanOrEqualTo(null as unknown as number, null as unknown as number).valid).toBe(true)

	expect(isMoreThanOrEqualTo([] as unknown as number, [] as unknown as number).valid).toBe(true)
	expect(isMoreThanOrEqualTo(['1'] as unknown as number, ['2'] as unknown as number).valid).toBe(false)
	expect(isMoreThanOrEqualTo(['2'] as unknown as number, ['2'] as unknown as number).valid).toBe(true)

	expect(isMoreThanOrEqualTo({} as unknown as number, {} as unknown as number).valid).toBe(true)
})

test('IsLessThan', () => {
	expect(isLessThan(5, 3).valid).toBe(false)
	expect(isLessThan(2, 5).valid).toBe(true)

	expect(isLessThan('c' as unknown as number, 'a' as unknown as number).valid).toBe(false)
	expect(isLessThan('a' as unknown as number, 'c' as unknown as number).valid).toBe(true)

	expect(isLessThan(undefined as unknown as number, undefined as unknown as number).valid).toBe(false)
	expect(isLessThan(null as unknown as number, null as unknown as number).valid).toBe(false)

	expect(isLessThan([] as unknown as number, [] as unknown as number).valid).toBe(false)
	expect(isLessThan(['2'] as unknown as number, ['1'] as unknown as number).valid).toBe(false)
	expect(isLessThan(['1'] as unknown as number, ['2'] as unknown as number).valid).toBe(true)

	expect(isLessThan({} as unknown as number, {} as unknown as number).valid).toBe(false)
})

test('IsLessThanOrEqualTo', () => {
	expect(isLessThanOrEqualTo(4, 5).valid).toBe(true)
	expect(isLessThanOrEqualTo(5, 5).valid).toBe(true)
	expect(isLessThanOrEqualTo(6, 5).valid).toBe(false)

	expect(isLessThanOrEqualTo('c' as unknown as number, 'a' as unknown as number).valid).toBe(false)
	expect(isLessThanOrEqualTo('a' as unknown as number, 'c' as unknown as number).valid).toBe(true)
	expect(isLessThanOrEqualTo('b' as unknown as number, 'b' as unknown as number).valid).toBe(true)

	expect(isLessThanOrEqualTo(undefined as unknown as number, undefined as unknown as number).valid).toBe(false)
	expect(isLessThanOrEqualTo(null as unknown as number, null as unknown as number).valid).toBe(true)

	expect(isLessThanOrEqualTo([] as unknown as number, [] as unknown as number).valid).toBe(true)
	expect(isLessThanOrEqualTo(['3'] as unknown as number, ['2'] as unknown as number).valid).toBe(false)
	expect(isLessThanOrEqualTo(['2'] as unknown as number, ['2'] as unknown as number).valid).toBe(true)

	expect(isLessThanOrEqualTo({} as unknown as number, {} as unknown as number).valid).toBe(true)
})

test('ArrayContains', () => {
	expect(arrayContains(5, [5], (cur, val) => cur === val).valid).toBe(true)
	expect(arrayContains(5, [4], (cur, val) => cur === val).valid).toBe(false)

	expect(arrayContains('1', ['1'], (cur, val) => cur === val).valid).toBe(true)
	expect(arrayContains('1', ['2'], (cur, val) => cur === val).valid).toBe(false)

	expect(arrayContains({ id: 1 }, [{ id: 1 }], (cur, val) => cur.id === val.id).valid).toBe(true)
	expect(arrayContains({ id: 1 }, [{ id: 2 }], (cur, val) => cur === val).valid).toBe(false)
})