import { makePipe, PipeError, PipeInput, type Pipe, type PipeOutput } from './base'

export const array = <T extends Pipe<any, any, object>>(schema: T) =>
	makePipe<PipeInput<T>[], PipeOutput<T>[]>((input: unknown) => {
		if (!Array.isArray(input)) throw new PipeError(['is not an array'], input)
		if (input.length === 0) return input
		return input.map((i, idx) => {
			const validity = schema.safeParse(i)
			if (!validity.valid)
				throw validity.error.withMessages([`contains an invalid value at index ${idx}`, ...validity.error.messages])
			return validity.value
		})
	}, {})

export const tuple = <T extends ReadonlyArray<Pipe<any, any, object>>>(schemas: readonly [...T], err?: string) =>
	makePipe<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }>((input: unknown) => {
		if (!Array.isArray(input)) throw new PipeError(['is not an array'], input)
		if (schemas.length !== input.length) throw new PipeError([`expected ${schemas.length} but got ${input.length} items`], input)
		if (input.length === 0) return input as any
		return input.map((i, idx) => {
			const value = schemas[idx].safeParse(i)
			if ('error' in value)
				throw err
					? value.error.withMessages([err ?? `contains an invalid value at index ${idx}`, ...value.error.messages])
					: value.error
			return value.value
		}) as any
	}, {})

export const contains = <T>(length: number, err = `must contain ${length} items`) =>
	makePipe<T[]>((input) => {
		if (input.length === length) return input
		throw new PipeError([err], input)
	}, {})

export const containsMin = <T>(length: number, err = `must contain ${length} or more items`) =>
	makePipe<T[]>((input) => {
		if (input.length >= length) return input
		throw new PipeError([err], input)
	}, {})

export const containsMax = <T>(length: number, err = `must contain ${length} or less items`) =>
	makePipe<T[]>((input) => {
		if (input.length <= length) return input
		throw new PipeError([err], input)
	}, {})

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
