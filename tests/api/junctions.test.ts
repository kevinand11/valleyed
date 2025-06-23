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

	test('merge', () => {
		const rules1 = v.merge(v.string(), v.number())
		expect(rules1.validate('ha').valid).toBe(false)
		expect(rules1.validate(2).valid).toBe(false)

		const rules2 = v.merge(v.object({ a: v.string() }), v.object({ b: v.number() }))
		expect(rules2.validate({}).valid).toBe(false)
		expect(rules2.validate({ a: '' }).valid).toBe(false)
		expect(rules2.validate({ b: 2 }).valid).toBe(false)
		expect(rules2.validate({ a: '', b: 2 }).valid).toBe(true)
		expect(rules2.parse({ a: '', b: 2 })).toEqual({ a: '', b: 2 })

		const rules3 = v.merge(v.array(v.object({ a: v.string() })), v.array(v.object({ b: v.number() })))
		expect(rules3.validate([]).valid).toBe(true)
		expect(rules3.validate([{ a: '' }]).valid).toBe(false)
		expect(rules3.validate([{ b: 2 }]).valid).toBe(false)
		expect(rules3.validate([{ a: '' }, { b: 2 }]).valid).toBe(false)
		expect(rules3.validate([{ a: '', b: 2 }]).valid).toBe(true)
	})

	test('fromJson', () => {
		const rules = v.fromJson(v.number())
		expect(rules.validate('and').valid).toBe(false)
		expect(rules.validate('"1"').valid).toBe(false)
		expect(rules.validate('1').valid).toBe(true)
	})
})
