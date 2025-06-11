import { pipe, PipeError } from './base'

export const gt = (value: number, err = `must be greater than ${value}`) =>
	pipe<number, number, any>(
		(input) => {
			if (input > value) return input
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ exclusiveMinimum: value }) },
	)

export const gte = (value: number, err = `must be greater than or equal to ${value}`) =>
	pipe<number, number, any>(
		(input) => {
			if (input >= value) return input
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ minimum: value }) },
	)

export const lt = (value: number, err = `must be less than ${value}`) =>
	pipe<number, number, any>(
		(input) => {
			if (input < value) return input
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ exclusiveMaximum: value }) },
	)

export const lte = (value: number, err = `must be less than or equal to ${value}`) =>
	pipe<number, number, any>(
		(input) => {
			if (input <= value) return input
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ maximum: value }) },
	)

export const int = (err = 'is not an integer') =>
	pipe<number, number, any>(
		(input) => {
			if (input === parseInt(input as any)) return input
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ type: 'integer' }) },
	)

export const asRound = (dp = 0) => pipe<number, number, any>((input) => Number(input.toFixed(dp)), {})
