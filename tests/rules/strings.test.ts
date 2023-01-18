import { hasMinOf, isMaxOf, isMinOf } from '@src/rules'

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