import { makePipeFn, PipeError } from './base'
import { Differ } from '../utils/differ'

export const custom = <T>(condition: (input: T) => boolean, err = `doesn't pass custom rule`) =>
	makePipeFn<T>((input) => {
		if (condition(input as any)) return input as T
		throw new PipeError([err], input)
	})

export const eq = <T>(compare: T, comparer = Differ.equal as (val: any, compare: T) => boolean, err = `is not equal ${compare}`) =>
	makePipeFn<T>((input) => {
		if (input === compare || comparer(input, compare)) return input as T
		throw new PipeError([err], input)
	})

export const is = eq

export const ne = <T>(compare: T, comparer = Differ.equal as (val: any, compare: T) => boolean, err = `is equal to ${compare}`) =>
	makePipeFn<T>((input) => {
		if (!comparer(input, compare) && input !== compare) return input as T
		throw new PipeError([err], input)
	})

const inArray = <T>(
	array: Readonly<T[]>,
	comparer = Differ.equal as (val: any, arrayItem: T) => boolean,
	err = `is not in the list: [${array.join(',')}]`,
) =>
	makePipeFn<T>((input) => {
		if (array.find((x) => comparer(input, x))) return input as T
		throw new PipeError([err], input)
	})

export const nin = <T>(
	array: Readonly<T[]>,
	comparer = Differ.equal as (val: any, arrayItem: T) => boolean,
	err = `is in the list: [${array.join(',')}]`,
) =>
	makePipeFn<T>((input) => {
		if (!array.find((x) => comparer(input, x))) return input as T
		throw new PipeError([err], input)
	})

export { inArray as in }
