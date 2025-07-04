import { standard } from './base/pipes'

export const gt = (value: number, err?: string) =>
	standard<number, number>(
		({ input, context }) => [
			`if (${input} <= ${context}.gt) return PipeError.root(\`${err ?? `must be greater than \${${context}.gt}`}\`, ${input})`,
		],
		{
			context: { gt: value },
			schema: () => ({ exclusiveMinimum: value }),
		},
	)

export const gte = (value: number, err?: string) =>
	standard<number, number>(
		({ input, context }) => [
			`if (${input} < ${context}.gte) return PipeError.root(\`${err ?? `must be greater than or equal to \${${context}.gte}`}\`, ${input})`,
		],
		{
			context: { gte: value },
			schema: () => ({ minimum: value }),
		},
	)

export const lt = (value: number, err?: string) =>
	standard<number, number>(
		({ input, context }) => [
			`if (${input} >= ${context}.lt) return PipeError.root(\`${err ?? `must be less than \${${context}.lt}`}\`, ${input})`,
		],
		{
			context: { lt: value },
			schema: () => ({ exclusiveMaximum: value }),
		},
	)

export const lte = (value: number, err?: string) =>
	standard<number, number>(
		({ input, context }) => [
			`if (${input} > ${context}.lte) return PipeError.root(\`${err ?? `must be less than or equal to \${${context}}.lte}`}\`, ${input})`,
		],
		{
			context: { lte: value },
			schema: () => ({ maximum: value }),
		},
	)

export const int = (err = 'is not an integer') =>
	standard<number, number>(({ input }) => [`if (${input} !== parseInt(${input})) return PipeError.root('${err}', ${input})`], {
		schema: () => ({ type: 'integer' }),
	})

export const asRounded = (dp = 0) =>
	standard<number, number>(({ input, context }) => [`${input} = Number(${input}.toFixed(${context}.dp))`], { context: { dp } })
