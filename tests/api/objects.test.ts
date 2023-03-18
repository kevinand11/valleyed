import { describe, expect, test } from 'vitest'
import { v } from '../../src/api'

describe('objects', () => {
	test('object', () => {
		const rules = v.object({
			name: v.string()
		})
		expect(rules.parse([]).valid).toBe(false)
		expect(rules.parse('').valid).toBe(false)
		expect(rules.parse({}).valid).toBe(false)
		expect(rules.parse({ name: 1 }).valid).toBe(false)
		expect(rules.parse({ name: '' }).valid).toBe(true)

		let res = rules.parse({ name: '', age: 23 })
		expect(res.valid).toBe(true)
		expect(res.value).toEqual({ name: '' })

		res = v.object({
			name: v.string()
		}, false).parse({ name: '', age: 23 })
		expect(res.valid).toBe(true)
		expect(res.value).toEqual({ name: '', age: 23 })
	})
})