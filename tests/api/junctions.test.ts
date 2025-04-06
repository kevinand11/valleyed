import { describe, expect, test } from 'vitest'

import { v } from '../../src/api'

describe('or', () => {
	test('or', () => {
		const rules = v.or([v.string(), v.number()])
		expect(rules.parse('').valid).toBe(true)
		expect(rules.parse(2).valid).toBe(true)
		expect(rules.parse(false).valid).toBe(false)
	})
})

describe('and', () => {
	test('and', () => {
		const rules = v.and([v.string(), v.any().eq('and')])
		expect(rules.parse('and').valid).toBe(true)
		expect(rules.parse('').valid).toBe(false)
		expect(rules.parse(false).valid).toBe(false)
	})
})

describe('discriminate', () => {
	test('discriminate', () => {
		const rules = v.discriminate((v) => v, {
			ha: v.string(),
			make: v.string().has(4),
		})
		expect(rules.parse('ha').valid).toBe(true)
		expect(rules.parse(2).valid).toBe(false)
		expect(rules.parse('make').valid).toBe(true)
		expect(rules.parse('made').valid).toBe(false)

		const objectRules = v.discriminate((v) => v.status, {
			ha: v.object({ status: v.is('ha'), total: v.number().gt(10) }),
			name: v.object({ status: v.is('name'), flow: v.boolean() }),
		})
		expect(objectRules.parse({ status: 'ha', total: 12 }).valid).toBe(true)
		expect(objectRules.parse({ status: 'ha', total: 9 }).valid).toBe(false)
		expect(objectRules.parse({ status: 'none' }).valid).toBe(false)
	})
})
