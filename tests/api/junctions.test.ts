import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('junctions', () => {
	test('or', () => {
		const rules = v.or([v.string(), v.number()])
		expect(v.validate(rules, '').valid).toBe(true)
		expect(v.validate(rules, 2).valid).toBe(true)
		expect(v.validate(rules, false).valid).toBe(false)
	})

	test('merge', () => {
		const rules1 = v.merge(v.string(), v.number())
		expect(v.validate(rules1, 'ha').valid).toBe(false)
		expect(v.validate(rules1, 2).valid).toBe(false)

		const rules2 = v.merge(v.object({ a: v.string() }), v.object({ b: v.number() }))
		expect(v.validate(rules2, {}).valid).toBe(false)
		expect(v.validate(rules2, { a: '' }).valid).toBe(false)
		expect(v.validate(rules2, { b: 2 }).valid).toBe(false)
		expect(v.validate(rules2, { a: '', b: 2 }).valid).toBe(true)
		expect(v.assert(rules2, { a: '', b: 2 })).toEqual({ a: '', b: 2 })

		const rules3 = v.merge(v.array(v.object({ a: v.string() })), v.array(v.object({ b: v.number() })))
		expect(v.validate(rules3, []).valid).toBe(true)
		expect(v.validate(rules3, [{ a: '' }]).valid).toBe(false)
		expect(v.validate(rules3, [{ b: 2 }]).valid).toBe(false)
		expect(v.validate(rules3, [{ a: '' }, { b: 2 }]).valid).toBe(false)
		expect(v.validate(rules3, [{ a: '', b: 2 }]).valid).toBe(true)
	})

	test('discriminate', () => {
		const rules = v.discriminate((v) => v as any, {
			ha: v.string(),
			make: v.string().pipe(v.has(4)),
		})
		expect(v.validate(rules, 'ha').valid).toBe(true)
		expect(v.validate(rules, 2).valid).toBe(false)
		expect(v.validate(rules, 'make').valid).toBe(true)
		expect(v.validate(rules, 'made').valid).toBe(false)

		const objectRules = v.discriminate((v) => (v as any).status, {
			ha: v.object({ status: v.is('ha'), total: v.number().pipe(v.gt(10)) }),
			name: v.object({ status: v.is('name'), flow: v.boolean() }),
		})
		expect(v.validate(objectRules, { status: 'ha', total: 12 }).valid).toBe(true)
		expect(v.validate(objectRules, { status: 'ha', total: 9 }).valid).toBe(false)
		expect(v.validate(objectRules, { status: 'none' }).valid).toBe(false)
	})

	test('fromJson', () => {
		const rules = v.fromJson(v.number())
		expect(v.validate(rules, 'and').valid).toBe(false)
		expect(v.validate(rules, '"1"').valid).toBe(false)
		expect(v.validate(rules, '1').valid).toBe(true)
	})

	test('recursive', () => {
		const rules = v.recursive(() => v.object({ value: v.number(), left: v.optional(rules) }), 'Node')
		expect(v.validate(rules, { value: 1 }).valid).toBe(true)
		expect(v.validate(rules, { value: 1, left: { value: 2 } }).valid).toBe(true)
		expect(v.validate(rules, { value: 1, left: null }).valid).toBe(false)

		const schema = v.schema(rules)
		expect(schema).toBeDefined()
	})
})
