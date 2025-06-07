import { makePipe, PipeError } from './base'
import { equal } from '../utils/differ'
import { Primitive } from '../utils/types'

export const custom = <T>(condition: (input: T) => boolean, err = `doesn't pass custom rule`) =>
	makePipe<T>((input) => {
		if (condition(input as any)) return input as T
		throw new PipeError([err], input)
	}, {})

export const eq = <T extends Primitive>(
	compare: T,
	comparer = equal as (val: any, compare: T) => boolean,
	err = `is not equal ${compare}`,
) =>
	makePipe<T>((input) => {
		if (input === compare || comparer(input, compare)) return input as T
		throw new PipeError([err], input)
	}, {}, (schema) => ({ ...schema, const: compare }))

export const is = eq

export const ne = <T>(compare: T, comparer = equal as (val: any, compare: T) => boolean, err = `is equal to ${compare}`) =>
	makePipe<T>((input) => {
		if (!comparer(input, compare) && input !== compare) return input as T
		throw new PipeError([err], input)
	}, {}, (schema) => ({ ...schema, not: { const: compare } }))

const inArray = <T extends Primitive>(
	array: Readonly<T[]>,
	comparer = equal as (val: any, arrayItem: T) => boolean,
	err = `is not in the list: [${array.join(',')}]`,
) =>
	makePipe<T>((input) => {
		if (array.find((x) => comparer(input, x))) return input as T
		throw new PipeError([err], input)
	}, {}, (schema) => ({ ...schema, enum: [...array] }))

export const nin = <T>(
	array: Readonly<T[]>,
	comparer = equal as (val: any, arrayItem: T) => boolean,
	err = `is in the list: [${array.join(',')}]`,
) =>
	makePipe<T>((input) => {
		if (!array.find((x) => comparer(input, x))) return input as T
		throw new PipeError([err], input)
	}, {}, (schema) => ({ ...schema, not: { enum: [...array] } }))

export { inArray as in }
