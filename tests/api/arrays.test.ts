import { describe, expect, test } from 'vitest'

import { v } from '../../src/pipe'

describe('array', () => {
	test('array', () => {
		const rules = v.array(v.string())
		expect(rules.safeParse([]).valid).toBe(true)
		expect(rules.safeParse(['']).valid).toBe(true)
		expect(rules.safeParse([2]).valid).toBe(false)
	})

	test('tuple', () => {
		const rules = v.tuple([v.string(), v.number()])
		expect(rules.safeParse([]).valid).toBe(false)
		expect(rules.safeParse(['']).valid).toBe(false)
		expect(rules.safeParse([2]).valid).toBe(false)
		expect(rules.safeParse(['', 2]).valid).toBe(true)
		expect(rules.safeParse([2, '']).valid).toBe(false)
	})

	test('contains', () => {
		const rules = v.array(v.any()).pipe(v.contains(2))
		expect(rules.safeParse([1]).valid).toBe(false)
		expect(rules.safeParse([1, 2]).valid).toBe(true)
		expect(rules.safeParse([1, 2, 3]).valid).toBe(false)
	})

	test('containsMin', () => {
		const rules = v.array(v.any()).pipe(v.containsMin(2))
		expect(rules.safeParse([1]).valid).toBe(false)
		expect(rules.safeParse([1, 2]).valid).toBe(true)
		expect(rules.safeParse([1, 2, 3]).valid).toBe(true)
	})

	test('containsMax', () => {
		const rules = v.array(v.any()).pipe(v.containsMax(2))
		expect(rules.safeParse([1]).valid).toBe(true)
		expect(rules.safeParse([1, 2]).valid).toBe(true)
		expect(rules.safeParse([1, 2, 3]).valid).toBe(false)
	})

	test('set', () => {
		const rules = v.array(v.number().pipe(v.asRound())).pipe(v.asSet())
		expect(rules.parse([1])).toEqual([1])
		expect(rules.parse([1, 1])).toEqual([1])
		expect(rules.parse([1, 2, 3])).toEqual([1, 2, 3])
		expect(rules.parse([1.1, 1.2, 1.3])).toEqual([1])
	})
})
