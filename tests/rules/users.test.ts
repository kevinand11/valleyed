import { isEmail } from '../../src/rules'

describe('isEmail', () => {
	test('valid email', () => {
		const result = isEmail('email@example.com')
		expect(result.valid).toBe(true)
	})
	test('email without @', () => {
		const result = isEmail('email-example.com')
		expect(result.valid).toBe(false)
	})
	test('email without .', () => {
		const result = isEmail('email@examplecom')
		expect(result.valid).toBe(false)
	})
})
