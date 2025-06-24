import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('array', () => {
	test('array', () => {
		const rules = v.array(v.string())
		expect(v.validate(rules, []).valid).toBe(true)
		expect(v.validate(rules, ['']).valid).toBe(true)
		expect(v.validate(rules, [2]).valid).toBe(false)
	})

	test('tuple', () => {
		const rules = v.tuple([v.string(), v.number()])
		expect(v.validate(rules, []).valid).toBe(false)
		expect(v.validate(rules, ['']).valid).toBe(false)
		expect(v.validate(rules, [2]).valid).toBe(false)
		expect(v.validate(rules, ['', 2]).valid).toBe(true)
		expect(v.validate(rules, [2, '']).valid).toBe(false)
	})

	test('set', () => {
		const rules = v.array(v.number().pipe(v.asRounded())).pipe(v.asSet())
		expect(v.assert(rules, [1])).toEqual([1])
		expect(v.assert(rules, [1, 1])).toEqual([1])
		expect(v.assert(rules, [1, 2, 3])).toEqual([1, 2, 3])
		expect(v.assert(rules, [1.1, 1.2, 1.3])).toEqual([1])
	})
})
