import { pipe, PipeError } from './base'
import { equal } from '../utils/differ'

export const custom = <T>(condition: (input: T) => boolean, err = `doesn't pass custom rule`) =>
	pipe<T, T, any>((input) => {
		if (condition(input)) return input as T
		throw PipeError.root(err, input)
	}, {})

export const eq = <T>(compare: T, comparer = equal as (val: T, compare: T) => boolean, err = `is not equal ${compare}`) =>
	pipe<T, T, any>(
		(input) => {
			if (input === compare || comparer(input, compare)) return input as T
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ const: compare }) },
	)

export const is = eq

export const ne = <T>(compare: T, comparer = equal as (val: T, compare: T) => boolean, err = `is equal to ${compare}`) =>
	pipe<T, T, any>(
		(input) => {
			if (!comparer(input, compare) && input !== compare) return input as T
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ not: { const: compare } }) },
	)

const inArray = <T>(
	array: Readonly<T[]>,
	comparer = equal as (val: T, arrayItem: T) => boolean,
	err = `is not in the list: [${array.join(',')}]`,
) =>
	pipe<T, T, any>(
		(input) => {
			if (array.find((x) => comparer(input, x))) return input as T
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ enum: [...array] }) },
	)

export const nin = <T>(
	array: Readonly<T[]>,
	comparer = equal as (val: T, arrayItem: T) => boolean,
	err = `is in the list: [${array.join(',')}]`,
) =>
	pipe<T, T, any>(
		(input) => {
			if (!array.find((x) => comparer(input, x))) return input as T
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ not: { enum: [...array] } }) },
	)

function itemType(input: unknown) {
	return input?.constructor?.name === 'String' ? 'characters' : 'items'
}

export const has = <T extends { length: number }>(length: number, err?: string) =>
	pipe<T, T, any>(
		(input) => {
			if (input.length === length) return input
			throw PipeError.root(err ?? `must contain ${length} ${itemType(input)}`, input)
		},
		{ schema: () => ({ minItems: length, maxItems: length, minLength: length, maxLength: length }) },
	)

export const min = <T extends { length: number }>(length: number, err?: string) =>
	pipe<T, T, any>(
		(input) => {
			if (input.length >= length) return input
			throw PipeError.root(err ?? `must contain ${length} or more ${itemType(input)}`, input)
		},
		{ schema: () => ({ minItems: length, minLength: length }) },
	)

export const max = <T extends { length: number }>(length: number, err?: string) =>
	pipe<T, T, any>(
		(input) => {
			if (input.length <= length) return input
			throw PipeError.root(err ?? `must contain ${length} or less ${itemType(input)}`, input)
		},
		{ schema: () => ({ maxItems: length, maxLength: length }) },
	)

export { inArray as in }
