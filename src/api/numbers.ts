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
		{
			compile: ({ input, context }) =>
				`${input} > ${context}.execValueFunction(${context}.gt) ? ${input} : ${context}.PipeError.root(\`${err ?? `must be greater than ${context}.execValueFunction(${context}.gt)`}\`, ${input})`,
			context: () => ({ gt: value, PipeError, execValueFunction }),
			schema: () => ({ exclusiveMinimum: execValueFunction(value) }),
		},
	)

export const gte = (value: ValueFunction<number>, err?: string) =>
	pipe<number, number, any>(
		(input) => {
			const v = execValueFunction(value)
			if (input >= v) return input
			throw PipeError.root(err ?? `must be greater than or equal to ${v}`, input)
		},
		{
			compile: ({ input, context }) =>
				`${input} >= ${context}.execValueFunction(${context}.gte) ? ${input} : ${context}.PipeError.root(\`${err ?? `must be greater than or equal to ${context}.execValueFunction(${context}.gte)`}\`, ${input})`,
			context: () => ({ gte: value, PipeError, execValueFunction }),
			schema: () => ({ minimum: execValueFunction(value) }),
		},
	)

export const lt = (value: ValueFunction<number>, err?: string) =>
	pipe<number, number, any>(
		(input) => {
			const v = execValueFunction(value)
			if (input < v) return input
			throw PipeError.root(err ?? `must be less than ${v}`, input)
		},
		{
			compile: ({ input, context }) =>
				`${input} < ${context}.execValueFunction(${context}.lt) ? ${input} : ${context}.PipeError.root(\`${err ?? `must be less than ${context}.execValueFunction(${context}.lt)`}\`, ${input})`,
			context: () => ({ lt: value, PipeError, execValueFunction }),
			schema: () => ({ exclusiveMaximum: execValueFunction(value) }),
		},
	)

export const lte = (value: ValueFunction<number>, err?: string) =>
	pipe<number, number, any>(
		(input) => {
			const v = execValueFunction(value)
			if (input <= v) return input
			throw PipeError.root(err ?? `must be less than or equal to ${v}`, input)
		},
		{
			compile: ({ input, context }) =>
				`${input} <= ${context}.execValueFunction(${context}.lte) ? ${input} : ${context}.PipeError.root(\`${err ?? `must be less than or equal to ${context}.execValueFunction(${context}.lte)`}\`, ${input})`,
			context: () => ({ lte: value, PipeError, execValueFunction }),
			schema: () => ({ maximum: execValueFunction(value) }),
		},
	)

export const int = (err = 'is not an integer') =>
	pipe<number, number, any>(
		(input) => {
			if (input === parseInt(input as any)) return input
			throw PipeError.root(err, input)
		},
		{
			compile: ({ input, context }) => `(${input} === parseInt(${input})) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
			context: () => ({ PipeError }),
			schema: () => ({ type: 'integer' }),
		},
	)

export const asRounded = (dp = 0) => pipe<number, number, any>((input) => Number(input.toFixed(dp)), {})
