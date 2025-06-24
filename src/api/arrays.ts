import { pipe, PipeError, PipeInput, schema, validate, type Pipe, type PipeOutput } from './base'

export const array = <T extends Pipe<any, any, any>>(pipeSchema: T, err = 'is not an array') =>
	pipe<PipeInput<T>[], PipeOutput<T>[], any>(
		(input: unknown) => {
			if (!Array.isArray(input)) throw PipeError.root(err, input)
			if (input.length === 0) return input
			const res = input.map((i, idx) => {
				const validity = validate(pipeSchema, i)
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
		{ schema: () => ({ type: 'array', items: schema(pipeSchema) }) },
	)

export const tuple = <T extends ReadonlyArray<Pipe<any, any, any>>>(pipes: readonly [...T], err = 'is not an array') =>
	pipe<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }, any>(
		(input: unknown) => {
			if (!Array.isArray(input)) throw PipeError.root(err, input)
			if (pipes.length === 0) return input as any
			const res = pipes.map((pipe, idx) => {
				const validitity = validate(pipe, input[idx])
				if ('error' in validitity) return PipeError.path(idx, validitity.error, input[idx])
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
				items: pipes.map((pipe) => schema(pipe)),
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
