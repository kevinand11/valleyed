import { Validator } from '../../src/validators'
import { isEmail } from '../../src/rules'

describe('Testing single ', () => {
	test('Empty rules with presence', () => {
		const res = Validator.single(undefined, [], {})
		expect(res.isValid).toBe(true)
	})

	test('Empty rules without presence', () => {
		const res = Validator.single(undefined, [], { required: false })
		expect(res.isValid).toBe(true)
	})

	test('Invalid email with presence', () => {
		const res = Validator.single('123', [isEmail()], {})
		expect(res.isValid).toBe(false)
	})

	test('Invalid email without presence', () => {
		expect(Validator.single(undefined as any, [isEmail()], { required: false }).isValid).toBe(true)
		expect(Validator.single(null as any, [isEmail()], { required: false }).isValid).toBe(true)
		expect(Validator.single(null as any, [isEmail()], { required: true }).isValid).toBe(false)
		expect(Validator.single(null as any, [isEmail()], { required: false, nullable: true }).isValid).toBe(true)
		expect(Validator.single(null as any, [isEmail()], { required: true, nullable: true }).isValid).toBe(true)
		expect(Validator.single('', [isEmail()], { required: false }).isValid).toBe(true)
		expect(Validator.single('sddss', [isEmail()], { required: false }).isValid).toBe(true)
	})
})
