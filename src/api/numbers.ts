import { PipeError } from './base'
import { standard } from './base/pipes'

export const gt = (value: number, err?: string) =>
	standard<number, number>(
		({ input, context }) => [
			`if (${input} <= ${context}.gt) return ${context}.PipeError.root(\`${err ?? `must be greater than \${${context}.gt}`}\`, ${input})`,
		],
		{
			context: { gt: value, PipeError },
			schema: () => ({ exclusiveMinimum: value }),
		},
	)

export const gte = (value: number, err?: string) =>
	standard<number, number>(
		({ input, context }) => [
			`if (${input} < ${context}.gte) return ${context}.PipeError.root(\`${err ?? `must be greater than or equal to \${${context}.gte}`}\`, ${input})`,
		],
		{
			context: { gte: value, PipeError },
			schema: () => ({ minimum: value }),
		},
	)

export const lt = (value: number, err?: string) =>
	standard<number, number>(
		({ input, context }) => [
			`if (${input} >= ${context}.lt) return ${context}.PipeError.root(\`${err ?? `must be less than \${${context}.lt}`}\`, ${input})`,
		],
		{
			context: { lt: value, PipeError },
			schema: () => ({ exclusiveMaximum: value }),
		},
	)

export const lte = (value: number, err?: string) =>
	standard<number, number>(
		({ input, context }) => [
			`if (${input} > ${context}.lte) return ${context}.PipeError.root(\`${err ?? `must be less than or equal to \${${context}}.lte}`}\`, ${input})`,
		],
		{
			context: { lte: value, PipeError },
			schema: () => ({ maximum: value }),
		},
	)

export const int = (err = 'is not an integer') =>
	standard<number, number>(
		({ input, context }) => [`if (${input} !== parseInt(${input})) return ${context}.PipeError.root('${err}', ${input})`],
		{
			context: { PipeError },
			schema: () => ({ type: 'integer' }),
		},
	)

export const asRounded = (dp = 0) =>
	standard<number, number>(({ input, context }) => [`${input} = Number(${input}.toFixed(${context}.dp))`], { context: { dp } })
