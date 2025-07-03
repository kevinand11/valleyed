import { PipeError } from './base'
import { standard } from './base/pipes'
import { execValueFunction, ValueFunction } from '../utils/functions'

export const gt = (value: ValueFunction<number>, err?: string) =>
	standard<number, number>(
		({ input, context }) => [
			`if (${input} <= ${context}.execValueFunction(${context}.gt)) throw ${context}.PipeError.root(\`${err ?? `must be greater than \${${context}}.execValueFunction(\${${context}}.gt)`}\`, ${input})`,
		],
		{
			context: { gt: value, PipeError, execValueFunction },
			schema: () => ({ exclusiveMinimum: execValueFunction(value) }),
		},
	)

export const gte = (value: ValueFunction<number>, err?: string) =>
	standard<number, number>(
		({ input, context }) => [
			`if (${input} < ${context}.execValueFunction(${context}.gte)) throw ${context}.PipeError.root(\`${err ?? `must be greater than or equal to \${${context}}.execValueFunction(\${${context}}.gte)`}\`, ${input})`,
		],
		{
			context: { gte: value, PipeError, execValueFunction },
			schema: () => ({ minimum: execValueFunction(value) }),
		},
	)

export const lt = (value: ValueFunction<number>, err?: string) =>
	standard<number, number>(
		({ input, context }) => [
			`if (${input} >= ${context}.execValueFunction(${context}.lt)) throw ${context}.PipeError.root(\`${err ?? `must be less than \${${context}}.execValueFunction(\${${context}}.lt)`}\`, ${input})`,
		],
		{
			context: { lt: value, PipeError, execValueFunction },
			schema: () => ({ exclusiveMaximum: execValueFunction(value) }),
		},
	)

export const lte = (value: ValueFunction<number>, err?: string) =>
	standard<number, number>(
		({ input, context }) => [
			`if (${input} > ${context}.execValueFunction(${context}.lte)) throw ${context}.PipeError.root(\`${err ?? `must be less than or equal to \${${context}}.execValueFunction(\${${context}}.lte)`}\`, ${input})`,
		],
		{
			context: { lte: value, PipeError, execValueFunction },
			schema: () => ({ maximum: execValueFunction(value) }),
		},
	)

export const int = (err = 'is not an integer') =>
	standard<number, number>(
		({ input, context }) => [`if (${input} !== parseInt(${input})) throw ${context}.PipeError.root('${err}', ${input})`],
		{
			context: { PipeError },
			schema: () => ({ type: 'integer' }),
		},
	)

export const asRounded = (dp = 0) =>
	standard<number, number>(({ input, context }) => [`${input} = Number(${input}.toFixed(${context}.dp))`], { context: { dp } })
