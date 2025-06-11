import { pipe, PipeError } from './base'

const isString = (err = 'is not a string') =>
	pipe<unknown, string, any>(
		(input) => {
			if (typeof input === 'string' || input?.constructor?.name === 'String') return input as string
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ type: 'string' }) },
	)

const isNumber = (err = 'is not a number') =>
	pipe<unknown, number, any>(
		(input) => {
			if (typeof input === 'number' && !isNaN(input)) return input
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ type: 'number' }) },
	)

const isBoolean = (err = 'is not a boolean') =>
	pipe<unknown, boolean, any>(
		(input) => {
			if (input === true || input === false) return input
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ type: 'boolean' }) },
	)

const isNull = (err = 'is not null') =>
	pipe<unknown, null, any>(
		(input) => {
			if (input === null) return input
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ type: 'null' }) },
	)

const isUndefined = (err = 'is not undefined') =>
	pipe<unknown, undefined, any>(
		(input) => {
			if (input === undefined) return input
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ type: 'undefined' }) },
	)

const isAny = <T>() => pipe<unknown, T, any>((input) => input as T)

const isInstanceOf = <T>(classDef: abstract new (...args: any[]) => T, err = `is not an instance of ${classDef.name}`) =>
	pipe<unknown, T, any>((input) => {
		if ((input as any)?.constructor === classDef) return input as T
		if (input instanceof classDef) return input
		throw PipeError.root(err, input)
	})

export {
	isString as string,
	isNumber as number,
	isBoolean as boolean,
	isNull as null,
	isUndefined as undefined,
	isAny as any,
	isInstanceOf as instanceOf,
}
