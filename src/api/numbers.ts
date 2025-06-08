import { makePipe, PipeError } from './base'

export const gt = (value: number, err = `must be greater than ${value}`) =>
	makePipe<number>(
		(input) => {
			if (input > value) return input
			throw PipeError.root(err, input)
		},
		{},
		{ exclusiveMinimum: value },
	)

export const gte = (value: number, err = `must be greater than or equal to ${value}`) =>
	makePipe<number>(
		(input) => {
			if (input >= value) return input
			throw PipeError.root(err, input)
		},
		{},
		{ minimum: value },
	)

export const lt = (value: number, err = `must be less than ${value}`) =>
	makePipe<number>(
		(input) => {
			if (input < value) return input
			throw PipeError.root(err, input)
		},
		{},
		{ exclusiveMaximum: value },
	)

export const lte = (value: number, err = `must be less than or equal to ${value}`) =>
	makePipe<number>(
		(input) => {
			if (input <= value) return input
			throw PipeError.root(err, input)
		},
		{},
		{ maximum: value },
	)

export const int = (err = 'is not an integer') =>
	makePipe<number>(
		(input) => {
			if (input === parseInt(input as any)) return input
			throw PipeError.root(err, input)
		},
		{},
		{ type: 'integer' },
	)

export const asRound = (dp = 0) => makePipe<number>((input) => Number(input.toFixed(dp)), {})
