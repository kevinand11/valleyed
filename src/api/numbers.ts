import { standard } from './base/pipes'

export const gt = (value: number, err?: string) =>
	standard<number, number>(
		({ input, context, path }) => [
			`if (${input} <= ${context}.gt) return PipeError.root(\`${err ?? `must be greater than \${${context}.gt}`}\`, ${input}, ${path})`,
		],
		{
			context: { gt: value },
			schema: () => ({ exclusiveMinimum: value }),
		},
	)

export const gte = (value: number, err?: string) =>
	standard<number, number>(
		({ input, context, path }) => [
			`if (${input} < ${context}.gte) return PipeError.root(\`${err ?? `must be greater than or equal to \${${context}.gte}`}\`, ${input}, ${path})`,
		],
		{
			context: { gte: value },
			schema: () => ({ minimum: value }),
		},
	)

export const lt = (value: number, err?: string) =>
	standard<number, number>(
		({ input, context, path }) => [
			`if (${input} >= ${context}.lt) return PipeError.root(\`${err ?? `must be less than \${${context}.lt}`}\`, ${input}, ${path})`,
		],
		{
			context: { lt: value },
			schema: () => ({ exclusiveMaximum: value }),
		},
	)

export const lte = (value: number, err?: string) =>
	standard<number, number>(
		({ input, context, path }) => [
			`if (${input} > ${context}.lte) return PipeError.root(\`${err ?? `must be less than or equal to \${${context}}.lte}`}\`, ${input}, ${path})`,
		],
		{
			context: { lte: value },
			schema: () => ({ maximum: value }),
		},
	)

export const int = (err = 'is not an integer') =>
	standard<number, number>(
		({ input, path }) => [`if (${input} !== parseInt(${input})) return PipeError.root('${err}', ${input}, ${path})`],
		{
			schema: () => ({ type: 'integer' }),
		},
	)

export const asRounded = (dp = 0) =>
	standard<number, number>(({ input, context }) => [`${input} = Number(${input}.toFixed(${context}.dp))`], { context: { dp } })
