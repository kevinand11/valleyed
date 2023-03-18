import { describe, expect, test } from 'vitest'
import { v } from '../../src/api'

describe('file', () => {
	test('file', () => {
		const rules = v.file()
		expect(rules.parse({ type: 'image/png' }).valid).toBe(true)
		expect(rules.parse({ type: '' }).valid).toBe(false)
		expect(rules.parse(false).valid).toBe(false)
	})

	test('image', () => {
		const rules = v.file().image()
		expect(rules.parse({ type: 'image/png' }).valid).toBe(true)
		expect(rules.parse({ type: '' }).valid).toBe(false)
		expect(rules.parse(false).valid).toBe(false)
	})

	test('video', () => {
		const rules = v.file().video()
		expect(rules.parse({ type: 'video/mp4' }).valid).toBe(true)
		expect(rules.parse({ type: '' }).valid).toBe(false)
		expect(rules.parse(false).valid).toBe(false)
	})

	test('audio', () => {
		const rules = v.file().audio()
		expect(rules.parse({ type: 'audio/mp3' }).valid).toBe(true)
		expect(rules.parse({ type: '' }).valid).toBe(false)
		expect(rules.parse(false).valid).toBe(false)
	})
})