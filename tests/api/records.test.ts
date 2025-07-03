import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('records', () => {
	test('object plain', () => {
		const rules = v.object({
			name: v.string(),
		})
		expect(v.validate(rules, []).valid).toBe(false)
		expect(v.validate(rules, '').valid).toBe(false)
		expect(v.validate(rules, {}).valid).toBe(false)
		expect(v.validate(rules, { name: 1 }).valid).toBe(false)
		expect(v.validate(rules, { name: '' }).valid).toBe(true)

		const deepRules = v.object({
			name: v.string(),
			address: v.object({
				city: v.string().pipe(v.min(1)),
				zip: v.string().pipe(v.min(1)),
			}),
		})
		expect(v.validate(deepRules, {}).valid).toBe(false)
		expect(v.validate(deepRules, { name: '', address: {} }).valid).toBe(false)
		expect(v.validate(deepRules, { name: '', address: { city: '', zip: '' } }).valid).toBe(false)
		expect(v.validate(deepRules, { name: '', address: { city: 'c', zip: 'z' } }).valid).toBe(true)
	})

	test('object pick', () => {
		const rules = v.objectPick(
			v.object({
				name: v.string(),
				age: v.number(),
			}),
			['name'],
		)
		expect(v.validate(rules, {}).valid).toBe(false)
		expect(v.validate(rules, { name: '' }).valid).toBe(true)
		expect(v.validate(rules, { name: '', age: '' }).valid).toBe(true)
	})

	test('object omit', () => {
		const rules = v.objectOmit(
			v.object({
				name: v.string(),
				age: v.number(),
			}),
			['age'],
		)
		expect(v.validate(rules, {}).valid).toBe(false)
		expect(v.validate(rules, { name: '' }).valid).toBe(true)
		expect(v.validate(rules, { name: '', age: '' }).valid).toBe(true)
	})

	test('record', () => {
		const rules = v.record(v.string(), v.number())
		expect(v.validate(rules, []).valid).toBe(false)
		expect(v.validate(rules, {}).valid).toBe(true)
		expect(v.validate(rules, { a: 'a' }).valid).toBe(false)
		expect(v.validate(rules, { a: 1 }).valid).toBe(true)
	})

	test('asMap', () => {
		const rules = v.record(v.string(), v.number()).pipe(v.asMap())
		expect(v.validate(rules, []).valid).toBe(false)
		expect(v.validate(rules, {}).valid).toBe(true)
		expect(v.validate(rules, { a: 'a' }).valid).toBe(false)
		expect(v.validate(rules, { a: 1 }).valid).toBe(true)
		expect(v.assert(rules, { a: 1, b: 2 })).toEqual(
			new Map([
				['a', 1],
				['b', 2],
			]),
		)
	})
})
