import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('junctions', () => {
	test('or', () => {
		const rules = v.or([v.string(), v.number()])
		expect(rules.validate('').valid).toBe(true)
		expect(rules.validate(2).valid).toBe(true)
		expect(rules.validate(false).valid).toBe(false)
	})

	test('and', () => {
		const rules = v.and([v.string(), v.is('and')])
		expect(rules.validate('and').valid).toBe(true)
		expect(rules.validate('').valid).toBe(false)
		expect(rules.validate(false).valid).toBe(false)
	})

	test('discriminate', () => {
		const rules = v.discriminate((v) => v as any, {
			ha: v.string(),
			make: v.string().pipe(v.has(4)),
		})
		expect(rules.validate('ha').valid).toBe(true)
		expect(rules.validate(2).valid).toBe(false)
		expect(rules.validate('make').valid).toBe(true)
		expect(rules.validate('made').valid).toBe(false)

		const objectRules = v.discriminate((v) => (v as any).status, {
			ha: v.object({ status: v.is('ha'), total: v.number().pipe(v.gt(10)) }),
			name: v.object({ status: v.is('name'), flow: v.boolean() }),
		})
		expect(objectRules.validate({ status: 'ha', total: 12 }).valid).toBe(true)
		expect(objectRules.validate({ status: 'ha', total: 9 }).valid).toBe(false)
		expect(objectRules.validate({ status: 'none' }).valid).toBe(false)
	})

	test('tryJSON', () => {
		const rules = v.tryJSON(v.number())
		expect(rules.validate('and').valid).toBe(false)
		expect(rules.validate('"1"').valid).toBe(false)
		expect(rules.validate('1').valid).toBe(true)
	})
})
