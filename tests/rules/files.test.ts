import { describe, expect, test } from 'vitest'

import { isAudio, isFile, isImage, isVideo } from '../../src/rules'

describe('IsFile', () => {
	test('null & undefined', () => {
		let result = isFile()(null)
		expect(result.valid).toBe(false)
		result = isFile()(undefined)
		expect(result.valid).toBe(false)
	})
	test('invalid file', () => {
		let result = isFile()({ type: 'image' })
		expect(result.valid).toBe(false)
		result = isFile()([])
		expect(result.valid).toBe(false)
		result = isFile()('')
		expect(result.valid).toBe(false)
		result = isFile()(0)
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
		result = isImage()(undefined)
		expect(result.valid).toBe(false)
		result = isImage()(null)
		expect(result.valid).toBe(false)
	})
	test('invalid image', () => {
		let result = isImage()({ type: 'video/mp4' })
		expect(result.valid).toBe(false)
		result = isImage()([])
		expect(result.valid).toBe(false)
		result = isImage()('')
		expect(result.valid).toBe(false)
		result = isImage()(0)
		expect(result.valid).toBe(false)
	})
	test('valid image', () => {
		const result = isImage()({ type: 'image/jpeg' })
		expect(result.valid).toBe(true)
	})
})

describe('IsVideo', () => {
	test('undefined & null', () => {
		let result = isVideo()(undefined)
		expect(result.valid).toBe(false)
		result = isVideo()(null)
		expect(result.valid).toBe(false)
	})
	test('invalid video', () => {
		let result = isVideo()({ type: 'video' })
		expect(result.valid).toBe(false)
		result = isVideo()([])
		expect(result.valid).toBe(false)
		result = isVideo()('')
		expect(result.valid).toBe(false)
		result = isVideo()(0)
		expect(result.valid).toBe(false)
	})
	test('valid video', () => {
		const result = isVideo()({ type: 'video/mp4' })
		expect(result.valid).toBe(true)
	})
})

describe('IsAudio', () => {
	test('undefined & null', () => {
		let result = isAudio()(undefined)
		expect(result.valid).toBe(false)
		result = isAudio()(null)
		expect(result.valid).toBe(false)
	})
	test('invalid audio', () => {
		let result = isAudio()({ type: 'audio' })
		expect(result.valid).toBe(false)
		result = isAudio()([])
		expect(result.valid).toBe(false)
		result = isAudio()('')
		expect(result.valid).toBe(false)
		result = isAudio()(0)
		expect(result.valid).toBe(false)
	})
	test('valid audio', () => {
		const result = isAudio()({ type: 'audio/mp3' })
		expect(result.valid).toBe(true)
	})
})
