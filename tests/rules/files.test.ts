import { isAudio, isFile, isImage, isVideo } from '@src/rules'

describe('IsFile', () => {
	test('null & undefined', () => {
		let result = isFile()(null as any)
		expect(result.valid).toBe(false)
		result = isFile()(undefined as any)
		expect(result.valid).toBe(false)
	})
	test('invalid file', () => {
		let result = isFile()({ type: 'image' })
		expect(result.valid).toBe(false)
		result = isFile()([] as any)
		expect(result.valid).toBe(false)
		result = isFile()('' as any)
		expect(result.valid).toBe(false)
		result = isFile()(0 as any)
		expect(result.valid).toBe(false)
	})
	test('valid file', () => {
		const result = isFile()({ type: 'image/jpeg' })
		expect(result.valid).toBe(true)
	})
})

describe('IsImage', () => {
	test('undefined & null', () => {
		let result = isFile()({ type: 'image' })
		expect(result.valid).toBe(false)
		result = isImage()(undefined as any)
		expect(result.valid).toBe(false)
		result = isImage()(null as any)
		expect(result.valid).toBe(false)
	})
	test('invalid image', () => {
		let result = isImage()({ type: 'video/mp4' })
		expect(result.valid).toBe(false)
		result = isImage()([] as any)
		expect(result.valid).toBe(false)
		result = isImage()('' as any)
		expect(result.valid).toBe(false)
		result = isImage()(0 as any)
		expect(result.valid).toBe(false)
	})
	test('valid image', () => {
		const result = isImage()({ type: 'image/jpeg' })
		expect(result.valid).toBe(true)
	})
})

describe('IsVideo', () => {
	test('undefined & null', () => {
		let result = isVideo()(undefined as any)
		expect(result.valid).toBe(false)
		result = isVideo()(null as any)
		expect(result.valid).toBe(false)
	})
	test('invalid video', () => {
		let result = isVideo()({ type: 'video' })
		expect(result.valid).toBe(false)
		result = isVideo()([] as any)
		expect(result.valid).toBe(false)
		result = isVideo()('' as any)
		expect(result.valid).toBe(false)
		result = isVideo()(0 as any)
		expect(result.valid).toBe(false)
	})
	test('valid video', () => {
		const result = isVideo()({ type: 'video/mp4' })
		expect(result.valid).toBe(true)
	})
})

describe('IsAudio', () => {
	test('undefined & null', () => {
		let result = isAudio()(undefined as any)
		expect(result.valid).toBe(false)
		result = isAudio()(null as any)
		expect(result.valid).toBe(false)
	})
	test('invalid audio', () => {
		let result = isAudio()({ type: 'audio' })
		expect(result.valid).toBe(false)
		result = isAudio()([] as any)
		expect(result.valid).toBe(false)
		result = isAudio()('' as any)
		expect(result.valid).toBe(false)
		result = isAudio()(0 as any)
		expect(result.valid).toBe(false)
	})
	test('valid audio', () => {
		const result = isAudio()({ type: 'audio/mp3' })
		expect(result.valid).toBe(true)
	})
})