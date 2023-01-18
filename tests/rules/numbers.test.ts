import { isLessThan, isLessThanOrEqualTo, isMoreThan, isMoreThanOrEqualTo } from '@src/rules'

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