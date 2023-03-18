import { describe, expect, test } from 'vitest'
import { v } from '../../src/api'

describe('boolean', () => {
	test('boolean', () => {
		const rules = v.boolean()
		expect(rules.parse(true).valid).toBe(true)
		expect(rules.parse(false).valid).toBe(true)
		expect(rules.parse([2]).valid).toBe(false)
	})
})