import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('records', () => {
	test('object', () => {
		const rules = v.object({
			name: v.string(),
		})
		expect(rules.safeParse([]).valid).toBe(false)
		expect(rules.safeParse('').valid).toBe(false)
		expect(rules.safeParse({}).valid).toBe(false)
		expect(rules.safeParse({ name: 1 }).valid).toBe(false)
		expect(rules.safeParse({ name: '' }).valid).toBe(true)
	})

	test('object pick', () => {
		const rules = v.objectPick(
			v.object({
				name: v.string(),
				age: v.number(),
			}),
			['name'],
		)
		expect(rules.safeParse({}).valid).toBe(false)
		expect(rules.safeParse({ name: '' }).valid).toBe(true)
		expect(rules.safeParse({ name: '', age: '' }).valid).toBe(true)
	})

	test('object omit', () => {
		const rules = v.objectOmit(
			v.object({
				name: v.string(),
				age: v.number(),
			}),
			['age'],
		)
		expect(rules.safeParse({}).valid).toBe(false)
		expect(rules.safeParse({ name: '' }).valid).toBe(true)
		expect(rules.safeParse({ name: '', age: '' }).valid).toBe(true)
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
		expect(rules.safeParse({}).valid).toBe(false)
		expect(rules.safeParse({ name: '', age: 23 }).valid).toBe(false)
		expect(rules.safeParse({ name: '', age: 23, old: false }).valid).toBe(true)
	})

	test('object trim', () => {
		const rules = v.object({
			name: v.string(),
		})
		let res = v.objectTrim(rules).safeParse({ name: '', age: 23 })
		expect(res.valid).toBe(true)
		expect((res as any).value).toEqual({ name: '' })

		res = v.object({ name: v.string() }).safeParse({ name: '', age: 23 })
		expect(res.valid).toBe(true)
		expect((res as any).value).toEqual({ name: '', age: 23 })
	})

	test('record', () => {
		const rules = v.record(v.string(), v.number())
		expect(rules.safeParse([]).valid).toBe(false)
		expect(rules.safeParse({}).valid).toBe(true)
		expect(rules.safeParse({ a: 'a' }).valid).toBe(false)
		expect(rules.safeParse({ a: 1 }).valid).toBe(true)
	})

	test('asMap', () => {
		const rules = v.record(v.string(), v.number()).pipe(v.asMap())
		expect(rules.safeParse([]).valid).toBe(false)
		expect(rules.safeParse({}).valid).toBe(true)
		expect(rules.safeParse({ a: 'a' }).valid).toBe(false)
		expect(rules.safeParse({ a: 1 }).valid).toBe(true)
		expect(rules.parse({ a: 1, b: 2 })).toEqual(
			new Map([
				['a', 1],
				['b', 2],
			]),
		)
	})
})
