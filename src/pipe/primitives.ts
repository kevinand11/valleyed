import { makePipeFn, PipeError } from './base'

const isString = (err = 'is not a string') =>
	makePipeFn<unknown, string>((input) => {
		if (input?.constructor?.name === 'String') return input as string
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

export { isString as string, isNumber as number, isBoolean as boolean }
