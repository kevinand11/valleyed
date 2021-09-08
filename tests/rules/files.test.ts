import { containsOnlyFiles, isFile, isImage } from '../../src/rules'

describe('IsFile', () => {
	test('null & undefined', () => {
		let result = isFile(null)
		expect(result.valid).toBe(false)
		result = isFile(undefined)
		expect(result.valid).toBe(false)
	})
	test('invalid file', () => {
		let result = isFile({})
		expect(result.valid).toBe(false)
		result = isFile([])
		expect(result.valid).toBe(false)
		result = isFile('')
		expect(result.valid).toBe(false)
		result = isFile(0)
		expect(result.valid).toBe(false)
	})
	test('valid file', () => {
		const result = isFile({ type: 'image/jpeg' })
		expect(result.valid).toBe(true)
	})
})

describe('IsImage', () => {
	test('undefined & null', () => {
		let result = isImage(undefined)
		expect(result.valid).toBe(false)
		result = isImage(null)
		expect(result.valid).toBe(false)
	})
	test('invalid image', () => {
		let result = isImage({ type: 'video/mp4' })
		expect(result.valid).toBe(false)
		result = isImage([])
		expect(result.valid).toBe(false)
		result = isImage('')
		expect(result.valid).toBe(false)
		result = isImage(0)
		expect(result.valid).toBe(false)
	})
	test('valid image', () => {
		const result = isImage({ type: 'image/jpeg' })
		expect(result.valid).toBe(true)
	})
})

describe('ContainsOnlyFiles', () => {
	test('undefined & null', () => {
		let result = containsOnlyFiles([undefined])
		expect(result.valid).toBe(false)
		result = containsOnlyFiles([null])
		expect(result.valid).toBe(false)
	})
	test('invalid files', () => {
		let result = containsOnlyFiles([{}])
		expect(result.valid).toBe(false)
		result = containsOnlyFiles([''])
		expect(result.valid).toBe(false)
		result = containsOnlyFiles([0])
		expect(result.valid).toBe(false)
	})
	test('valid files', () => {
		let result = containsOnlyFiles([])
		expect(result.valid).toBe(true)
		result = containsOnlyFiles([{ type: 'image/jpeg' }])
		expect(result.valid).toBe(true)
	})
})
