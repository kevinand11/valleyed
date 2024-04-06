import { expect, test } from 'vitest'
import { isInvalid, isValid } from '../../src/utils/rules'

test('IsValid', () => {
	expect(isValid(1)).toEqual({ valid: true, errors: [], value: 1, ignored: false })
})

test('IsInvalid', () => {
	expect(isInvalid(['test'], 1)).toEqual({ valid: false, errors: ['test'], value: 1, ignored: false })
})
