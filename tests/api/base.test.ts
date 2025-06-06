import { describe, expect, test } from 'vitest'

import { makePipe, PipeError } from '../../src/pipe/base'

describe('base', () => {
	test('flow', () => {
		const a = (x: number) => x + 1
		const b = (x: number) => x * 2
		let pipe = makePipe(a, {})
		expect(pipe.flow.length).toBe(1)
		pipe = pipe.pipe(b)
		expect(pipe.flow.length).toBe(2)
		expect(pipe.flow[0]).toBe(a)
		expect(pipe.flow[1]).toBe(b)
	})

	test('parse', () => {
		const pipe = makePipe((x: number) => x + 1, {}).pipe((x) => x * 2)
		expect(pipe.parse(5)).toEqual(12)
		const errPipe = pipe.pipe((i) => {
			if (i < 1000) throw new PipeError(['pipe error'], 0)
			return i
		})
		expect(() => errPipe.parse(5)).toThrow(PipeError)
	})

	test('safeParse', () => {
		const pipe = makePipe((x: number) => x + 1, {}).pipe((x) => x * 2)
		expect(pipe.safeParse(5)).toEqual({ value: 12, valid: true })
		const err = new PipeError(['pipe error'], 0)
		const errPipe = pipe.pipe((i) => {
			if (i < 1000) throw err
			return i
		})
		expect(errPipe.safeParse(5)).toEqual({ error: err, valid: false })
	})
})
