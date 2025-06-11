import { pipe, PipeContext, PipeError, PipeInput, type Pipe, type PipeOutput } from './base'

export const array = <T extends Pipe<any, any, any>>(pipeSchema: T) =>
	pipe<PipeInput<T>[], PipeOutput<T>[], PipeContext<T>[]>(
		(input: unknown) => {
			if (!Array.isArray(input)) throw PipeError.root('is not an array', input)
			if (input.length === 0) return input
			const res = input.map((i, idx) => {
				const validity = pipeSchema.safeParse(i)
				if (!validity.valid) return PipeError.path(idx, validity.error, i)
				return validity.value
			})
			if (res.some((r) => r instanceof PipeError))
				throw PipeError.rootFrom(
					res.filter((r) => r instanceof PipeError),
					input,
				)
			return res
		},
		{ schema: () => ({ type: 'array', items: pipeSchema.toJsonSchema() }) },
	)

export const tuple = <T extends ReadonlyArray<Pipe<any, any, any>>>(pipes: readonly [...T]) =>
	pipe<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }, { [K in keyof T]: PipeContext<T[K]> }>(
		(input: unknown) => {
			if (!Array.isArray(input)) throw PipeError.root('is not an array', input)
			if (pipes.length !== input.length) throw PipeError.root(`expected ${pipes.length} but got ${input.length} items`, input)
			if (input.length === 0) return input as any
			const res = input.map((i, idx) => {
				const validitity = pipes[idx].safeParse(i)
				if ('error' in validitity) return PipeError.path(idx, validitity.error, i)
				return validitity.value
			})
			if (res.some((r) => r instanceof PipeError))
				throw PipeError.rootFrom(
					res.filter((r) => r instanceof PipeError),
					input,
				)
			return res
		},
		{
			schema: () => ({
				type: 'array',
				items: pipes.map((pipe) => pipe.toJsonSchema()),
				minItems: pipes.length,
				maxItems: pipes.length,
			}),
		},
	)

export const asSet = <T>(keyFn: (i: T) => PropertyKey = (v) => v as string) =>
	pipe<T[], T[], any>((input) => {
		const obj: Record<PropertyKey, boolean> = {}
		return input.reduce<T[]>((acc, cur) => {
			const key = keyFn(cur)
			if (!obj[key]) {
				obj[key] = true
				acc.push(cur)
			}
			return acc
		}, [])
	})
