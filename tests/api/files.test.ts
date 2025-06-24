import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('file', () => {
	test('file', () => {
		const rules = v.file()
		expect(v.validate(rules, { type: 'image/png' }).valid).toBe(true)
		expect(v.validate(rules, { type: '' }).valid).toBe(false)
		expect(v.validate(rules, false).valid).toBe(false)
	})

	test('image', () => {
		const rules = v.file().pipe(v.image())
		expect(v.validate(rules, { type: 'image/png' }).valid).toBe(true)
		expect(v.validate(rules, { type: '' }).valid).toBe(false)
		expect(v.validate(rules, false).valid).toBe(false)
	})

	test('video', () => {
		const rules = v.file().pipe(v.video())
		expect(v.validate(rules, { type: 'video/mp4' }).valid).toBe(true)
		expect(v.validate(rules, { type: '' }).valid).toBe(false)
		expect(v.validate(rules, false).valid).toBe(false)
	})

	test('audio', () => {
		const rules = v.file().pipe(v.audio())
		expect(v.validate(rules, { type: 'audio/mp3' }).valid).toBe(true)
		expect(v.validate(rules, { type: '' }).valid).toBe(false)
		expect(v.validate(rules, false).valid).toBe(false)
	})

	test('fileType', () => {
		const rules = v.file().pipe(v.fileType('application/pdf'))
		expect(v.validate(rules, { type: 'application/pdf' }).valid).toBe(true)
		expect(v.validate(rules, { type: '' }).valid).toBe(false)
		expect(v.validate(rules, false).valid).toBe(false)
	})
})
