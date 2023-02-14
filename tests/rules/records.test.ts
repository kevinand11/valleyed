import { isMap, isRecord } from '../../src/rules'

const rules = [
	(c: string) => typeof c === 'string',
	(c: number) => typeof c === 'number'
] as const
describe('isRecord', () => {
	test('good record', () => {
		const result = isRecord(rules[1])({ 'a': 2 })
		expect(result.valid).toBe(true)
	})
	test('bad record', () => {
		const result = isRecord(rules[1])({ a: 2, b: true } )
		expect(result.valid).toBe(false)
	})
})

describe('isMap', () => {
	test('good map', () => {
		const result = isMap(...rules)(new Map([['a', 2]]))
		expect(result.valid).toBe(true)
	})
	test('bad map', () => {
		const result = isMap(...rules)(new Map([['a', false], ['b', true] ]))
		expect(result.valid).toBe(false)
	})
})