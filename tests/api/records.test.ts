import { describe, expect, test } from 'vitest'

import { v } from '../../src/pipe'

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

		let res = rules.safeParse({ name: '', age: 23 })
		expect(rules.safeParse({ name: '', age: 23 }).valid).toBe(true)
		expect((res as any).value).toEqual({ name: '' })

		res = v
			.object(
				{
					name: v.string(),
				},
				false,
			)
			.safeParse({ name: '', age: 23 })
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
