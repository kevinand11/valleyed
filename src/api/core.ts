import { pipe, PipeError } from './base'
import { equal } from '../utils/differ'
import { execValueFunction, ValueFunction } from '../utils/functions'

export const custom = <T>(condition: (input: T) => boolean, err = `doesn't pass custom rule`) =>
	pipe<T, T, any>((input) => {
		if (condition(input)) return input as T
		throw PipeError.root(err, input)
	}, {})

export const eq = <T>(compare: ValueFunction<T>, err?: string) =>
	pipe<T, T, any>(
		(input) => {
			const comp = execValueFunction(compare)
			if (input === comp || equal(input, comp)) return input as T
			throw PipeError.root(err ?? `is not equal to ${comp}`, input)
		},
		{ schema: () => ({ const: execValueFunction(compare) }) },
	)

export const is = eq

export const ne = <T>(compare: ValueFunction<T>, err?: string) =>
	pipe<T, T, any>(
		(input) => {
			const comp = execValueFunction(compare)
			if (!equal(input, comp) && input !== comp) return input as T
			throw PipeError.root(err ?? `is equal to ${comp}`, input)
		},
		{ schema: () => ({ not: { const: execValueFunction(compare) } }) },
	)

const inArray = <T>(array: ValueFunction<Readonly<T[]>>, err?: string) =>
	pipe<T, T, any>(
		(input) => {
			const arr = execValueFunction(array)
			if (arr.find((x) => equal(input, x))) return input as T
			throw PipeError.root(err ?? `is not in the list: [${arr.join(',')}]`, input)
		},
		{ schema: () => ({ enum: [...execValueFunction(array)] }) },
	)

export const nin = <T>(array: ValueFunction<Readonly<T[]>>, err?: string) =>
	pipe<T, T, any>(
		(input) => {
			const arr = execValueFunction(array)
			if (!arr.find((x) => equal(input, x))) return input as T
			throw PipeError.root(err ?? `is in the list: [${arr.join(',')}]`, input)
		},
		{ schema: () => ({ not: { enum: [...execValueFunction(array)] } }) },
	)

function itemType(input: unknown) {
	return input?.constructor?.name === 'String' ? 'characters' : 'items'
}

export const has = <T extends { length: number }>(length: ValueFunction<number>, err?: string) =>
	pipe<T, T, any>(
		(input) => {
			if (input.length === execValueFunction(length)) return input
			throw PipeError.root(err ?? `must contain ${length} ${itemType(input)}`, input)
		},
		{
			schema: () => ({
				minItems: execValueFunction(length),
				maxItems: execValueFunction(length),
				minLength: execValueFunction(length),
				maxLength: execValueFunction(length),
			}),
		},
	)

export const min = <T extends { length: number }>(length: ValueFunction<number>, err?: string) =>
	pipe<T, T, any>(
		(input) => {
			const len = execValueFunction(length)
			if (input.length >= len) return input
			throw PipeError.root(err ?? `must contain ${len} or more ${itemType(input)}`, input)
		},
		{ schema: () => ({ minItems: execValueFunction(execValueFunction(length)), minLength: execValueFunction(length) }) },
	)

export const max = <T extends { length: number }>(length: ValueFunction<number>, err?: string) =>
	pipe<T, T, any>(
		(input) => {
			const len = execValueFunction(length)
			if (input.length <= len) return input
			throw PipeError.root(err ?? `must contain ${len} or less ${itemType(input)}`, input)
		},
		{ schema: () => ({ maxItems: execValueFunction(length), maxLength: execValueFunction(length) }) },
	)

export { inArray as in }
