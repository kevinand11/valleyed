import { isInvalid, isValid } from '../../src/utils/rules'

test('IsValid', () => {
	expect(isValid(1)).toEqual({ valid: true, error: null, value: 1 })
})

test('IsInvalid', () => {
	expect(isInvalid('test', 1)).toEqual({ valid: false, error: 'test', value: 1 })
})
