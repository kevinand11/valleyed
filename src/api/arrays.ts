import { makePipe, PipeError, PipeInput, type Pipe, type PipeOutput } from './base'

export const array = <T extends Pipe<any, any, object>>(pipe: T) =>
	makePipe<PipeInput<T>[], PipeOutput<T>[]>(
		(input: unknown) => {
			if (!Array.isArray(input)) throw PipeError.root('is not an array', input)
			if (input.length === 0) return input
			const res = input.map((i, idx) => {
				const validity = pipe.safeParse(i)
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
		{},
		(schema) => ({ ...schema, type: 'array', items: pipe.toJsonSchema() }),
	)

export const tuple = <T extends ReadonlyArray<Pipe<any, any, object>>>(pipes: readonly [...T]) =>
	makePipe<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }>(
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
		{},
		(schema) => ({
			...schema,
			type: 'array',
			items: pipes.map((pipe) => pipe.toJsonSchema()),
			minItems: pipes.length,
			maxItems: pipes.length,
		}),
	)

export const contains = <T>(length: number, err = `must contain ${length} items`) =>
	makePipe<T[]>(
		(input) => {
			if (input.length === length) return input
			throw PipeError.root(err, input)
		},
		{},
		(schema) => ({ ...schema, minItems: length, maxItems: length }),
	)

export const containsMin = <T>(length: number, err = `must contain ${length} or more items`) =>
	makePipe<T[]>(
		(input) => {
			if (input.length >= length) return input
			throw PipeError.root(err, input)
		},
		{},
		(schema) => ({ ...schema, minItems: length }),
	)

export const containsMax = <T>(length: number, err = `must contain ${length} or less items`) =>
	makePipe<T[]>(
		(input) => {
			if (input.length <= length) return input
			throw PipeError.root(err, input)
		},
		{},
		(schema) => ({ ...schema, maxItems: length }),
	)

export const asSet = <T>(keyFn: (i: T) => PropertyKey = (v) => v as string) =>
	makePipe<T[]>((input) => {
		const obj: Record<PropertyKey, boolean> = {}
		return input.reduce<T[]>((acc, cur) => {
			const key = keyFn(cur)
			if (!obj[key]) {
				obj[key] = true
				acc.push(cur)
			}
			return acc
		}, [])
	}, {})
