import { describe, expect, test } from 'vitest'

import { v } from '../../src/api'
import { isString } from '../../src/rules'

describe('base', () => {
	test('forced', () => {
		expect(v.string().forced).toBe(false)
		expect(v.force.string().forced).toBe(true)
	})

	test('clone', () => {
		const rules = v.force.string()
		// @ts-ignore
		const rules2 = v.any().clone(rules)
		expect(rules.forced === rules2.forced).toBe(true)
	})

	test('addTyping', () => {
		const rules = v.any().addTyping(isString())
		expect(rules.parse('').valid).toBe(true)
		expect(rules.parse(2).valid).toBe(false)
	})

	test('addRule', () => {
		const rules = v.any().addRule(isString())
		expect(rules.parse('').valid).toBe(true)
		expect(rules.parse(2).valid).toBe(false)
	})

	test('addSanitizer', () => {
		const rules = v.any().addSanitizer((val) => val.toString().trim())
		expect(rules.parse(' 28 ').value).toBe('28')
		expect(rules.parse(2).valid).toBe(true)
	})
})
