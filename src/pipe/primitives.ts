import { makePipe, PipeError } from './base'

const isString = (err = 'is not a string') =>
	makePipe<unknown, string>((input) => {
		if (typeof input === 'string' || input?.constructor?.name === 'String') return input as string
		throw new PipeError([err], input)
	})

const isNumber = (err = 'is not a number') =>
	makePipe<unknown, number>((input) => {
		if (typeof input === 'number' && !isNaN(input)) return input
		throw new PipeError([err], input)
	})

const isBoolean = (err = 'is not a boolean') =>
	makePipe<unknown, boolean>((input) => {
		if (input === true || input === false) return input
		throw new PipeError([err], input)
	})

const isNull = (err = 'is not null') =>
	makePipe<unknown, null>((input) => {
		if (input === null) return input
		throw new PipeError([err], input)
	})

const isUndefined = (err = 'is not undefined') =>
	makePipe<unknown, undefined>((input) => {
		if (input === undefined) return input
		throw new PipeError([err], input)
	})

export const isInstanceof = <T>(classDef: new () => T, err = `is not an instance of ${classDef.name}`) =>
	makePipe<T>((input) => {
		if (input instanceof classDef) return input as T
		throw new PipeError([err], input)
	})

export {
	isString as string,
	isNumber as number,
	isBoolean as boolean,
	isNull as null,
	isUndefined as undefined,
	isInstanceof as instanceof,
}
