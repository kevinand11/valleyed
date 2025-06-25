import { PipeError } from './base'
import { pipe } from './base/pipes'
import { execValueFunction, ValueFunction } from '../utils/functions'

export const gt = (value: ValueFunction<number>, err?: string) =>
	pipe<number, number, any>(
		(input) => {
			const v = execValueFunction(value)
			if (input > v) return input
			throw PipeError.root(err ?? `must be greater than ${v}`, input)
		},
		{ schema: () => ({ exclusiveMinimum: execValueFunction(value) }) },
	)

export const gte = (value: ValueFunction<number>, err?: string) =>
	pipe<number, number, any>(
		(input) => {
			const v = execValueFunction(value)
			if (input >= v) return input
			throw PipeError.root(err ?? `must be greater than or equal to ${v}`, input)
		},
		{ schema: () => ({ minimum: execValueFunction(value) }) },
	)

export const lt = (value: ValueFunction<number>, err?: string) =>
	pipe<number, number, any>(
		(input) => {
			const v = execValueFunction(value)
			if (input < v) return input
			throw PipeError.root(err ?? `must be less than ${v}`, input)
		},
		{ schema: () => ({ exclusiveMaximum: execValueFunction(value) }) },
	)

export const lte = (value: ValueFunction<number>, err?: string) =>
	pipe<number, number, any>(
		(input) => {
			const v = execValueFunction(value)
			if (input <= v) return input
			throw PipeError.root(err ?? `must be less than or equal to ${v}`, input)
		},
		{ schema: () => ({ maximum: execValueFunction(value) }) },
	)

export const int = (err = 'is not an integer') =>
	pipe<number, number, any>(
		(input) => {
			if (input === parseInt(input as any)) return input
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ type: 'integer' }) },
	)

export const asRounded = (dp = 0) => pipe<number, number, any>((input) => Number(input.toFixed(dp)), {})
