import { describe, expect, test } from 'vitest'

import { v } from '../../src/api'

describe('maps', () => {
	test('map', () => {
		const rules = v.map(v.string(), v.number())
		expect(rules.parse([]).valid).toBe(false)
		expect(rules.parse({}).valid).toBe(false)
		expect(rules.parse(new Map([['', '']])).valid).toBe(false)
		expect(rules.parse(new Map([])).valid).toBe(true)
		expect(rules.parse(new Map([['', 1]])).valid).toBe(true)
	})
})

describe('records', () => {
	test('record', () => {
		const rules = v.record(v.number())
		expect(rules.parse([]).valid).toBe(false)
		expect(rules.parse({}).valid).toBe(true)
		expect(rules.parse({ a: 'a' }).valid).toBe(false)
		expect(rules.parse({ a: 1 }).valid).toBe(true)
	})
})
