import { describe, expect, test } from 'vitest'
import { v } from '../../src/api'

describe('or', () => {
	test('or', () => {
		const rules = v.or([
			v.string(),
			v.number(),
		])
		expect(rules.parse('').valid).toBe(true)
		expect(rules.parse(2).valid).toBe(true)
		expect(rules.parse(false).valid).toBe(false)
	})
})

describe('and', () => {
	test('and', () => {
		const rules = v.and([
			v.string(),
			v.any().eq('and'),
		])
		expect(rules.parse('and').valid).toBe(true)
		expect(rules.parse('').valid).toBe(false)
		expect(rules.parse(false).valid).toBe(false)
	})
})