import { pipe, PipeError } from './base'
import { equal } from '../utils/differ'

export const custom = <T>(condition: (input: T) => boolean, err = `doesn't pass custom rule`) =>
	pipe<T>((input) => {
		if (condition(input as any)) return input as T
		throw PipeError.root(err, input)
	}, {})

export const eq = <T>(compare: T, comparer = equal as (val: any, compare: T) => boolean, err = `is not equal ${compare}`) =>
	pipe<T>(
		(input) => {
			if (input === compare || comparer(input, compare)) return input as T
			throw PipeError.root(err, input)
		},
		{ schema: { const: compare } },
	)

export const is = eq

export const ne = <T>(compare: T, comparer = equal as (val: any, compare: T) => boolean, err = `is equal to ${compare}`) =>
	pipe<T>(
		(input) => {
			if (!comparer(input, compare) && input !== compare) return input as T
			throw PipeError.root(err, input)
		},
		{ schema: { not: { const: compare } } },
	)

const inArray = <T>(
	array: Readonly<T[]>,
	comparer = equal as (val: any, arrayItem: T) => boolean,
	err = `is not in the list: [${array.join(',')}]`,
) =>
	pipe<T>(
		(input) => {
			if (array.find((x) => comparer(input, x))) return input as T
			throw PipeError.root(err, input)
		},
		{ schema: { enum: [...array] } },
	)

export const nin = <T>(
	array: Readonly<T[]>,
	comparer = equal as (val: any, arrayItem: T) => boolean,
	err = `is in the list: [${array.join(',')}]`,
) =>
	pipe<T>(
		(input) => {
			if (!array.find((x) => comparer(input, x))) return input as T
			throw PipeError.root(err, input)
		},
		{ schema: { not: { enum: [...array] } } },
	)

export { inArray as in }
