import { describe, expect, test } from 'vitest'
import { v } from '../../src/api'

describe('core', () => {
	test('original', () => {
		const rules = v.string().trim().original()
		expect(rules.parse('').value).toBe('')
		expect(rules.parse(' ha ').value).toBe(' ha ')
	})

	test('requiredIf', () => {
		const rules = v.string().requiredIf(() => false)
		expect(rules.parse('').valid).toBe(true)
		expect(rules.parse(undefined).valid).toBe(true)
		expect(rules.parse(2).valid).toBe(true)
	})

	test('optional', () => {
		const rules = v.string().optional()
		expect(rules.parse('').valid).toBe(true)
		expect(rules.parse(undefined).valid).toBe(true)
		expect(rules.parse(null).valid).toBe(true)
		expect(rules.parse(2).valid).toBe(true)
		expect(rules.parse(2, false).valid).toBe(false)
	})

	test('nullable', () => {
		const rules = v.string().nullable()
		expect(rules.parse('').valid).toBe(true)
		expect(rules.parse(null).valid).toBe(true)
		expect(rules.parse(undefined).valid).toBe(false)
		expect(rules.parse(2).valid).toBe(false)
	})

	test('nullish', () => {
		const rules = v.string().nullish()
		expect(rules.parse('').valid).toBe(true)
		expect(rules.parse(null).valid).toBe(true)
		expect(rules.parse(undefined).valid).toBe(true)
		expect(rules.parse(2).valid).toBe(true)
		expect(rules.parse(2, false).valid).toBe(false)
	})

	test('default', () => {
		const rules = v.string().default(() => '')
		expect(rules.parse('hi').valid).toBe(true)
		expect(rules.parse(null).valid).toBe(false)
		expect(rules.parse(undefined).valid).toBe(true)
		expect(v.string().default('def').parse(undefined).valid).toBe(true)
		expect(rules.parse(2).valid).toBe(false)
	})

	test('custom', () => {
		const rules = v.string().custom((val) => val !== '')
		expect(rules.parse('hi').valid).toBe(true)
		expect(rules.parse('').valid).toBe(false)
	})

	test('eq', () => {
		const rules = v.string().eq('hi')
		expect(rules.parse('hi').valid).toBe(true)
		expect(rules.parse('').valid).toBe(false)
	})

	test('ne', () => {
		const rules = v.string().ne('')
		expect(rules.parse('hi').valid).toBe(true)
		expect(rules.parse('').valid).toBe(false)
	})

	test('in', () => {
		const rules = v.any().in([1, 2, 3])
		expect(rules.parse('1').valid).toBe(false)
		expect(rules.parse(4).valid).toBe(false)
		expect(rules.parse(true).valid).toBe(false)
		expect(rules.parse(1).valid).toBe(true)
	})

	test('nin', () => {
		const rules = v.any().nin([1, 2, 3])
		expect(rules.parse('1').valid).toBe(true)
		expect(rules.parse(4).valid).toBe(true)
		expect(rules.parse(true).valid).toBe(true)
		expect(rules.parse(1).valid).toBe(false)
	})

	test('transform', () => {
		const rules = v.string().transform((val) => val.split(''))
			.transform((val) => val.length)
			.custom((val) => val > 3)
		expect(rules.parse('1').valid).toBe(false)
		expect(rules.parse(4).valid).toBe(false)
		expect(rules.parse(true).valid).toBe(false)
		expect(rules.parse('1234').valid).toBe(true)
	})
})