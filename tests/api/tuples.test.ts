import { describe, expect, test } from 'vitest'
import { v } from '../../src/api'

describe('tuples', () => {
	test('tuple', () => {
		const rules = v.tuple([v.string(), v.number()])
		expect(rules.parse([]).valid).toBe(false)
		expect(rules.parse(['']).valid).toBe(false)
		expect(rules.parse([2]).valid).toBe(false)
		expect(rules.parse(['', 2]).valid).toBe(true)
		expect(rules.parse([2, '']).valid).toBe(false)
	})
})