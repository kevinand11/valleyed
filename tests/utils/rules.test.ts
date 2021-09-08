import { isInvalid, isValid } from '../../src/utils/rules'

test('IsValid', () => {
	expect(isValid()).toEqual({ valid: true, error: null })
})

test('IsInvalid', () => {
	expect(isInvalid('test')).toEqual({ valid: false, error: 'test' })
})
