import { describe, expect, test } from 'vitest'

import { pipe as makePipe, PipeError } from '../../src/api/base'

describe('base', () => {
	test('parse', () => {
		const pipe = makePipe((x: number) => x + 1, {}).pipe((x) => x * 2)
		expect(pipe.parse(5)).toEqual(12)
		const errPipe = pipe.pipe((i) => {
			if (i < 1000) throw PipeError.root('pipe error', 0)
			return i
		})
		expect(() => errPipe.parse(5)).toThrow(PipeError)
	})

	test('validate', () => {
		const pipe = makePipe((x: number) => x + 1, {}).pipe((x) => x * 2)
		expect(pipe.validate(5)).toEqual({ value: 12, valid: true })
		const err = PipeError.root('pipe error', 0)
		const errPipe = pipe.pipe((i) => {
			if (i < 1000) throw err
			return i
		})
		expect(errPipe.validate(5)).toEqual({ error: err, valid: false })
	})
})
