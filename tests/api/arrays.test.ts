import { describe, expect, test } from 'vitest'

import { v } from '../../src/api'

describe('array', () => {
	test('array', () => {
		const rules = v.array(v.string())
		expect(rules.parse([]).valid).toBe(true)
		expect(rules.parse(['']).valid).toBe(true)
		expect(rules.parse([2]).valid).toBe(false)
	})

	test('has', () => {
		const rules = v.array(v.any()).has(2)
		expect(rules.parse([1]).valid).toBe(false)
		expect(rules.parse([1, 2]).valid).toBe(true)
		expect(rules.parse([1, 2, 3]).valid).toBe(false)
	})

	test('min', () => {
		const rules = v.array(v.any()).min(2)
		expect(rules.parse([1]).valid).toBe(false)
		expect(rules.parse([1, 2]).valid).toBe(true)
		expect(rules.parse([1, 2, 3]).valid).toBe(true)
	})

	test('max', () => {
		const rules = v.array(v.any()).max(2)
		expect(rules.parse([1]).valid).toBe(true)
		expect(rules.parse([1, 2]).valid).toBe(true)
		expect(rules.parse([1, 2, 3]).valid).toBe(false)
	})

	test('set', () => {
		const rules = v.array(v.number().round()).set()
		expect(rules.parse([1]).value).toEqual([1])
		expect(rules.parse([1, 1]).value).toEqual([1])
		expect(rules.parse([1, 2, 3]).value).toEqual([1, 2, 3])
		expect(rules.parse([1.1, 1.2, 1.3]).value).toEqual([1])
	})
})
