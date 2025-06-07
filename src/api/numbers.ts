import { makePipe, PipeError } from './base'

export const gt = (value: number, err = `must be greater than ${value}`) =>
	makePipe<number>(
		(input) => {
			if (input > value) return input
			throw new PipeError([err], input)
		},
		{},
		(schema) => ({ ...schema, exclusiveMinimum: value }),
	)

export const gte = (value: number, err = `must be greater than or equal to ${value}`) =>
	makePipe<number>(
		(input) => {
			if (input >= value) return input
			throw new PipeError([err], input)
		},
		{},
		(schema) => ({ ...schema, minimum: value }),
	)

export const lt = (value: number, err = `must be less than ${value}`) =>
	makePipe<number>(
		(input) => {
			if (input < value) return input
			throw new PipeError([err], input)
		},
		{},
		(schema) => ({ ...schema, exclusiveMaximum: value }),
	)

export const lte = (value: number, err = `must be less than or equal to ${value}`) =>
	makePipe<number>(
		(input) => {
			if (input <= value) return input
			throw new PipeError([err], input)
		},
		{},
		(schema) => ({ ...schema, maximum: value }),
	)

export const int = (error = 'is not an integer') =>
	makePipe<number>(
		(input) => {
			if (input === parseInt(input as any)) return input
			throw new PipeError([error], input)
		},
		{},
		(schema) => ({ ...schema, type: 'integer' }),
	)

export const asRound = (dp = 0) => makePipe<number>((input) => Number(input.toFixed(dp)), {})
