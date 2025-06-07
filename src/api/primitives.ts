import { makePipe, PipeError } from './base'

const isString = (err = 'is not a string') =>
	makePipe<string>(
		(input: unknown) => {
			if (typeof input === 'string' || input?.constructor?.name === 'String') return input as string
			throw PipeError.root(err, input)
		},
		{},
		(schema) => ({ ...schema, type: 'string' }),
	)

const isNumber = (err = 'is not a number') =>
	makePipe<number>(
		(input: unknown) => {
			if (typeof input === 'number' && !isNaN(input)) return input
			throw PipeError.root(err, input)
		},
		{},
		(schema) => ({ ...schema, type: 'number' }),
	)

const isBoolean = (err = 'is not a boolean') =>
	makePipe<boolean>(
		(input: unknown) => {
			if (input === true || input === false) return input
			throw PipeError.root(err, input)
		},
		{},
		(schema) => ({ ...schema, type: 'boolean' }),
	)

const isNull = (err = 'is not null') =>
	makePipe<null>(
		(input: unknown) => {
			if (input === null) return input
			throw PipeError.root(err, input)
		},
		{},
		(schema) => ({ ...schema, type: 'null' }),
	)

const isUndefined = (err = 'is not undefined') =>
	makePipe<undefined>(
		(input: unknown) => {
			if (input === undefined) return input
			throw PipeError.root(err, input)
		},
		{},
		(schema) => ({ ...schema, type: 'undefined' }),
	)

export const isAny = <T>() => makePipe<T>((input) => input, {})

export { isString as string, isNumber as number, isBoolean as boolean, isNull as null, isUndefined as undefined, isAny as any }
