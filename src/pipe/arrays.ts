import { makePipe, PipeError, type Pipe, type PipeOutput } from './base'

export const array = <T>(schema: Pipe<unknown, T>) =>
	makePipe<unknown, T[]>((input) => {
		if (!Array.isArray(input)) throw new PipeError(['is not an array'], input)
		if (input.length === 0) return input
		return input.map((i, idx) => {
			const value = schema.safeParse(i)
			if ('error' in value) throw value.error.withMessages([`contains an invalid value at index ${idx}`, ...value.error.messages])
			return value.value
		})
	}, {})

export const tuple = <T extends ReadonlyArray<Pipe<unknown, unknown>>>(schemas: readonly [...T], err?: string) =>
	makePipe<unknown, { [K in keyof T]: PipeOutput<T[K]> }>((input) => {
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

export const has = <T>(length: number, err = `must contain ${length} items`) =>
	makePipe<T[]>((input) => {
		if (input.length === length) return input
		throw new PipeError([err], input)
	}, {})

export const min = <T>(length: number, err = `must contain ${length} or more items`) =>
	makePipe<T[]>((input) => {
		if (input.length >= length) return input
		throw new PipeError([err], input)
	}, {})

export const max = <T>(length: number, err = `must contain ${length} or less items`) =>
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
