import { isTuple } from '@src/rules'

describe('isTuple', () => {
	test('empty tuple', () => {
		const result = isTuple([])([])
		expect(result.valid).toBe(true)
	})
	test('string and number tuple true', () => {
		const result = isTuple([
			(v: string) => typeof v === 'string',
			(v: number) => typeof v === 'number'
		])(['str', 2])
		expect(result.valid).toBe(true)
	})
	test('string and number tuple false', () => {
		const result = isTuple([
			(v: string) => typeof v === 'string',
			(v: number) => typeof v === 'number'
		])([1, 2] as any)
		expect(result.valid).toBe(false)
	})
})