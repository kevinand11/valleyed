import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('file', () => {
	test('file', () => {
		const rules = v.file()
		expect(rules.validate({ type: 'image/png' }).valid).toBe(true)
		expect(rules.validate({ type: '' }).valid).toBe(false)
		expect(rules.validate(false).valid).toBe(false)
	})

	test('image', () => {
		const rules = v.file().pipe(v.image())
		expect(rules.validate({ type: 'image/png' }).valid).toBe(true)
		expect(rules.validate({ type: '' }).valid).toBe(false)
		expect(rules.validate(false).valid).toBe(false)
	})

	test('video', () => {
		const rules = v.file().pipe(v.video())
		expect(rules.validate({ type: 'video/mp4' }).valid).toBe(true)
		expect(rules.validate({ type: '' }).valid).toBe(false)
		expect(rules.validate(false).valid).toBe(false)
	})

	test('audio', () => {
		const rules = v.file().pipe(v.audio())
		expect(rules.validate({ type: 'audio/mp3' }).valid).toBe(true)
		expect(rules.validate({ type: '' }).valid).toBe(false)
		expect(rules.validate(false).valid).toBe(false)
	})

	test('fileType', () => {
		const rules = v.file().pipe(v.fileType('application/pdf'))
		expect(rules.validate({ type: 'application/pdf' }).valid).toBe(true)
		expect(rules.validate({ type: '' }).valid).toBe(false)
		expect(rules.validate(false).valid).toBe(false)
	})
})
