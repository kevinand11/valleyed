import { describe, expect, test } from 'vitest'

import { v } from '../../src'

describe('file', () => {
	test('file', () => {
		const rules = v.file()
		expect(rules.safeParse({ type: 'image/png' }).valid).toBe(true)
		expect(rules.safeParse({ type: '' }).valid).toBe(false)
		expect(rules.safeParse(false).valid).toBe(false)
	})

	test('image', () => {
		const rules = v.file().pipe(v.image())
		expect(rules.safeParse({ type: 'image/png' }).valid).toBe(true)
		expect(rules.safeParse({ type: '' }).valid).toBe(false)
		expect(rules.safeParse(false).valid).toBe(false)
	})

	test('video', () => {
		const rules = v.file().pipe(v.video())
		expect(rules.safeParse({ type: 'video/mp4' }).valid).toBe(true)
		expect(rules.safeParse({ type: '' }).valid).toBe(false)
		expect(rules.safeParse(false).valid).toBe(false)
	})

	test('audio', () => {
		const rules = v.file().pipe(v.audio())
		expect(rules.safeParse({ type: 'audio/mp3' }).valid).toBe(true)
		expect(rules.safeParse({ type: '' }).valid).toBe(false)
		expect(rules.safeParse(false).valid).toBe(false)
	})
})
