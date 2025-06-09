import { pipe, PipeError } from './base'

const isString = (err = 'is not a string') =>
	pipe<string>(
		(input: unknown) => {
			if (typeof input === 'string' || input?.constructor?.name === 'String') return input as string
			throw PipeError.root(err, input)
		},
		{ schema: { type: 'string' } },
	)

const isNumber = (err = 'is not a number') =>
	pipe<number>(
		(input: unknown) => {
			if (typeof input === 'number' && !isNaN(input)) return input
			throw PipeError.root(err, input)
		},
		{ schema: { type: 'number' } },
	)

const isBoolean = (err = 'is not a boolean') =>
	pipe<boolean>(
		(input: unknown) => {
			if (input === true || input === false) return input
			throw PipeError.root(err, input)
		},
		{ schema: { type: 'boolean' } },
	)

const isNull = (err = 'is not null') =>
	pipe<null>(
		(input: unknown) => {
			if (input === null) return input
			throw PipeError.root(err, input)
		},
		{ schema: { type: 'null' } },
	)

const isUndefined = (err = 'is not undefined') =>
	pipe<undefined>(
		(input: unknown) => {
			if (input === undefined) return input
			throw PipeError.root(err, input)
		},
		{ schema: { type: 'undefined' } },
	)

const isAny = <T>() => pipe<T>((input) => input)

export { isString as string, isNumber as number, isBoolean as boolean, isNull as null, isUndefined as undefined, isAny as any }
