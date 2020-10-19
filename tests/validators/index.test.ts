import { Validator } from '../../src/validators'
import { isEmail } from '../../src/rules'

describe('Testing single ', () => {
	test('Empty rules with presence', () => {
		const res = Validator.single(undefined, [])
		expect(res.isValid).toBe(true)
	})

	test('Empty rules without presence', () => {
		const res = Validator.single(undefined, [], false)
		expect(res.isValid).toBe(true)
	})

	test('Invalid email with presence', () => {
		const res = Validator.single('123', [isEmail])
		expect(res.isValid).toBe(false)
	})

	test('Invalid email without presence', () => {
		const res = Validator.single(undefined, [isEmail], false)
		expect(res.isValid).toBe(true)
	})
})
