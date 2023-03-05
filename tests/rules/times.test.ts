import { describe, expect, test } from 'vitest'
import { isEarlierThan, isLaterThan, isTime } from '../../src/rules'

describe('isTime', () => {
	test('truthy', () => {
		expect(isTime()(0).valid).toBe(true)
		expect(isTime()('2023').valid).toBe(true)
		expect(isTime()(new Date()).valid).toBe(true)
	})
	test('falsy', () => {
		expect(isTime()(true).valid).toBe(false)
		expect(isTime()([]).valid).toBe(false)
		expect(isTime()({}).valid).toBe(false)
	})
})

describe('isEarlierThan', () => {
	test('truthy', () => {
		expect(isEarlierThan(1)(0).valid).toBe(true)
		expect(isEarlierThan('2024')('2023').valid).toBe(true)
		expect(isEarlierThan(new Date(2024))(new Date(2023)).valid).toBe(true)
	})
	test('falsy', () => {
		expect(isEarlierThan(0)(1).valid).toBe(false)
		expect(isEarlierThan('2023')('2024').valid).toBe(false)
		expect(isEarlierThan(new Date(2023))(new Date(2024)).valid).toBe(false)
	})
})

describe('isLaterThan', () => {
	test('truthy', () => {
		expect(isLaterThan(0)(1).valid).toBe(true)
		expect(isLaterThan('2023')('2024').valid).toBe(true)
		expect(isLaterThan(new Date(2023))(new Date(2024)).valid).toBe(true)
	})
	test('falsy', () => {
		expect(isLaterThan(1)(0).valid).toBe(false)
		expect(isLaterThan('2024')('2023').valid).toBe(false)
		expect(isLaterThan(new Date(2024))(new Date(2023)).valid).toBe(false)
	})
})