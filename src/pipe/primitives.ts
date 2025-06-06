import { makePipeFn, PipeError } from './base'

const isString = (err = 'is not a string') =>
	makePipeFn<unknown, string>((input) => {
		if (typeof input === 'string' || input?.constructor?.name === 'String') return input as string
		throw new PipeError([err], input)
	})

const isNumber = (err = 'is not a number') =>
	makePipeFn<unknown, number>((input) => {
		if (typeof input === 'number' && !isNaN(input)) return input
		throw new PipeError([err], input)
	})

const isBoolean = (err = 'is not a boolean') =>
	makePipeFn<unknown, boolean>((input) => {
		if (input === true || input === false) return input
		throw new PipeError([err], input)
	})

const isNull = (err = 'is not null') =>
	makePipeFn<unknown, null>((input) => {
		if (input === null) return input
		throw new PipeError([err], input)
	})

const isUndefined = (err = 'is not undefined') =>
	makePipeFn<unknown, undefined>((input) => {
		if (input === undefined) return input
		throw new PipeError([err], input)
	})

export const isInstanceof = <T>(classDef: new () => T, err = `is not an instance of ${classDef.name}`) =>
	makePipeFn<T>((input) => {
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
