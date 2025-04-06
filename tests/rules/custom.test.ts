import { describe, expect, test } from 'vitest'

import { isCustom } from '../../src/rules'

describe('isCustom', () => {
	test('truthy', () => {
		const result = isCustom((c: boolean) => c)(true)
		expect(result.valid).toBe(true)
	})
	test('falsy', () => {
		const result = isCustom((c: boolean) => c)(false)
		expect(result.valid).toBe(false)
	})
})
