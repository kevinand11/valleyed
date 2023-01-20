import { isTime } from '../../src/rules'

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