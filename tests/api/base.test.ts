import { describe, expect, test } from 'vitest'

import { PipeError, v } from '../../src'

describe('base', () => {
	test('assert', () => {
		const pipe = v.pipe((x: number) => x + 1, {}).pipe((x) => x * 2)
		expect(v.assert(pipe, 5)).toEqual(12)
		const errPipe = pipe.pipe((i) => {
			if (i < 1000) throw PipeError.root('pipe error', 0)
			return i
		})
		expect(() => v.assert(errPipe, 5)).toThrow(PipeError)
	})

	test('validate', () => {
		const pipe = v.pipe((x: number) => x + 1, {}).pipe((x) => x * 2)
		expect(v.validate(pipe, 5)).toEqual({ value: 12, valid: true })
		const err = PipeError.root('pipe error', 0)
		const errPipe = pipe.pipe((i) => {
			if (i < 1000) throw err
			return i
		})
		expect(v.validate(errPipe, 5)).toEqual({ error: err, valid: false })
	})

	test('compile', () => {
		const pipe = v.array(v.string().pipe(v.is('kevinfizu@gmail.com'), v.email(), v.min(2), v.max(100)))
		expect(true).toBe(true)
		v.compile(pipe)
		v.assert(pipe, ['kevinfizu@gmail.com'])
	})
})
