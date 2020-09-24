import {
	isLongerThan, isShorterThan, isExtractedHTMLLongerThan,
	hasMoreThan, hasLessThan, isShallowEqualTo, isMoreThan, isLessThan
} from '../../src/rules'

test('IsLongerThan', () => {
	expect(isLongerThan('test', 3).valid).toBe(true)
	expect(isLongerThan('test', 4).valid).toBe(false)

	expect(isLongerThan(undefined as unknown as string, 5).valid).toBe(false)
	expect(isLongerThan(null as unknown as string, 5).valid).toBe(false)
	expect(isLongerThan([] as unknown as string, 5).valid).toBe(false)
	expect(isLongerThan({} as unknown as string, 5).valid).toBe(false)
})

test('IsShorterThan', () => {
	expect(isShorterThan('test', 5).valid).toBe(true)
	expect(isShorterThan('test', 4).valid).toBe(false)

	expect(isShorterThan(undefined as unknown as string, 5).valid).toBe(false)
	expect(isShorterThan(null as unknown as string, 5).valid).toBe(false)
	expect(isShorterThan([] as unknown as string, 5).valid).toBe(false)
	expect(isShorterThan({} as unknown as string, 5).valid).toBe(false)
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
	expect(hasMoreThan([1,2,3,4], 3).valid).toBe(true)
	expect(hasMoreThan([1,2,3,4], 4).valid).toBe(false)

	expect(hasMoreThan(undefined as unknown as any[], 5).valid).toBe(false)
	expect(hasMoreThan(null as unknown as any[], 5).valid).toBe(false)
	expect(hasMoreThan({} as unknown as any[], 25).valid).toBe(false)
})

test('HasLessThan', () => {
	expect(hasLessThan([1,2,3,4], 5).valid).toBe(true)
	expect(hasLessThan([1,2,3,4], 4).valid).toBe(false)

	expect(hasLessThan(undefined as unknown as any[], 5).valid).toBe(false)
	expect(hasLessThan(null as unknown as any[], 5).valid).toBe(false)
	expect(hasLessThan({} as unknown as any[], 25).valid).toBe(false)
})

test('IsShallowEqualTo', () => {
	expect(isShallowEqualTo(1,1).valid).toBe(true)
	expect(isShallowEqualTo('1', '1').valid).toBe(true)
	expect(isShallowEqualTo(true, true).valid).toBe(true)
	expect(isShallowEqualTo(undefined, undefined).valid).toBe(true)
	expect(isShallowEqualTo(null, null).valid).toBe(true)

	expect(isShallowEqualTo([], []).valid).toBe(false)
	expect(isShallowEqualTo({}, {}).valid).toBe(false)
})

test('IsMoreThan', () => {
	expect(isMoreThan(5,3).valid).toBe(true)
	expect(isMoreThan(2,5).valid).toBe(false)

	expect(isMoreThan('c' as unknown as number, 'a' as unknown as number).valid).toBe(true)
	expect(isMoreThan('a' as unknown as number, 'c' as unknown as number).valid).toBe(false)

	expect(isMoreThan(undefined as unknown as number, undefined as unknown as number).valid).toBe(false)
	expect(isMoreThan(null as unknown as number, null as unknown as number).valid).toBe(false)

	expect(isMoreThan([] as unknown as number, [] as unknown as number).valid).toBe(false)
	expect(isMoreThan(['1'] as unknown as number, ['2'] as unknown as number).valid).toBe(false)
	expect(isMoreThan(['2'] as unknown as number, ['1'] as unknown as number).valid).toBe(true)

	expect(isMoreThan({} as unknown as number, {} as unknown as number).valid).toBe(false)
})

test('IsLessThan', () => {
	expect(isLessThan(5,3).valid).toBe(false)
	expect(isLessThan(2,5).valid).toBe(true)

	expect(isLessThan('c' as unknown as number, 'a' as unknown as number).valid).toBe(false)
	expect(isLessThan('a' as unknown as number, 'c' as unknown as number).valid).toBe(true)

	expect(isLessThan(undefined as unknown as number, undefined as unknown as number).valid).toBe(false)
	expect(isLessThan(null as unknown as number, null as unknown as number).valid).toBe(false)

	expect(isLessThan([] as unknown as number, [] as unknown as number).valid).toBe(false)
	expect(isLessThan(['2'] as unknown as number, ['1'] as unknown as number).valid).toBe(false)
	expect(isLessThan(['1'] as unknown as number, ['2'] as unknown as number).valid).toBe(true)

	expect(isLessThan({} as unknown as number, {} as unknown as number).valid).toBe(false)
})
