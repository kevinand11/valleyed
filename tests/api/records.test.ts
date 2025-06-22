import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('records', () => {
	test('object', () => {
		const rules = v.object({
			name: v.string(),
		})
		expect(rules.validate([]).valid).toBe(false)
		expect(rules.validate('').valid).toBe(false)
		expect(rules.validate({}).valid).toBe(false)
		expect(rules.validate({ name: 1 }).valid).toBe(false)
		expect(rules.validate({ name: '' }).valid).toBe(true)
	})

	test('object pick', () => {
		const rules = v.objectPick(
			v.object({
				name: v.string(),
				age: v.number(),
			}),
			['name'],
		)
		expect(rules.validate({}).valid).toBe(false)
		expect(rules.validate({ name: '' }).valid).toBe(true)
		expect(rules.validate({ name: '', age: '' }).valid).toBe(true)
	})

	test('object omit', () => {
		const rules = v.objectOmit(
			v.object({
				name: v.string(),
				age: v.number(),
			}),
			['age'],
		)
		expect(rules.validate({}).valid).toBe(false)
		expect(rules.validate({ name: '' }).valid).toBe(true)
		expect(rules.validate({ name: '', age: '' }).valid).toBe(true)
	})

	test('object extends', () => {
		const rules = v.objectExtends(
			v.object({
				name: v.string(),
				age: v.number(),
			}),
			{
				old: v.boolean(),
			},
		)
		expect(rules.validate({}).valid).toBe(false)
		expect(rules.validate({ name: '', age: 23 }).valid).toBe(false)
		expect(rules.validate({ name: '', age: 23, old: false }).valid).toBe(true)
	})

	test('object trim', () => {
		const rules = v.object({
			name: v.string(),
		})
		let res = v.objectTrim(rules).validate({ name: '', age: 23 })
		expect(res.valid).toBe(true)
		expect((res as any).value).toEqual({ name: '' })

		res = v.object({ name: v.string() }).validate({ name: '', age: 23 })
		expect(res.valid).toBe(true)
		expect((res as any).value).toEqual({ name: '', age: 23 })
	})

	test('record', () => {
		const rules = v.record(v.string(), v.number())
		expect(rules.validate([]).valid).toBe(false)
		expect(rules.validate({}).valid).toBe(true)
		expect(rules.validate({ a: 'a' }).valid).toBe(false)
		expect(rules.validate({ a: 1 }).valid).toBe(true)
	})

	test('asMap', () => {
		const rules = v.record(v.string(), v.number()).pipe(v.asMap())
		expect(rules.validate([]).valid).toBe(false)
		expect(rules.validate({}).valid).toBe(true)
		expect(rules.validate({ a: 'a' }).valid).toBe(false)
		expect(rules.validate({ a: 1 }).valid).toBe(true)
		expect(rules.parse({ a: 1, b: 2 })).toEqual(
			new Map([
				['a', 1],
				['b', 2],
			]),
		)
	})
})
