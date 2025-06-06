import { describe, expect, test } from 'vitest'

import { v } from '../../src/pipe'

describe('or', () => {
	test('or', () => {
		const rules = v.or([v.string(), v.number()])
		expect(rules.safeParse('').valid).toBe(true)
		expect(rules.safeParse(2).valid).toBe(true)
		expect(rules.safeParse(false).valid).toBe(false)
	})
})

describe('and', () => {
	test('and', () => {
		const rules = v.and([v.string(), v.is('and')])
		expect(rules.safeParse('and').valid).toBe(true)
		expect(rules.safeParse('').valid).toBe(false)
		expect(rules.safeParse(false).valid).toBe(false)
	})
})

describe('discriminate', () => {
	test('discriminate', () => {
		const rules = v.discriminate((v) => v as any, {
			ha: v.string(),
			make: v.string().pipe(v.has(4)),
		})
		expect(rules.safeParse('ha').valid).toBe(true)
		expect(rules.safeParse(2).valid).toBe(false)
		expect(rules.safeParse('make').valid).toBe(true)
		expect(rules.safeParse('made').valid).toBe(false)

		const objectRules = v.discriminate((v) => (v as any).status, {
			ha: v.object({ status: v.is('ha'), total: v.number().pipe(v.gt(10)) }),
			name: v.object({ status: v.is('name'), flow: v.boolean() }),
		})
		expect(objectRules.safeParse({ status: 'ha', total: 12 }).valid).toBe(true)
		expect(objectRules.safeParse({ status: 'ha', total: 9 }).valid).toBe(false)
		expect(objectRules.safeParse({ status: 'none' }).valid).toBe(false)
	})
})
