import { PipeError } from './base'
import { standard } from './base/pipes'
import { getRandomValue } from '../utils/functions'

export type Timeable = Date | string | number

export const time = (err = 'is not a valid datetime') => {
	const varName = `date_${getRandomValue()}`
	return standard<Timeable, Date>(
		({ input, context }) => [
			`const ${varName} = new Date(${input})`,
			`if ((${input} instanceof Date || typeof ${input} === 'number' || typeof ${input} === 'string') && !isNaN(${varName}.getTime())) ${input} = ${varName}`,
			`else throw ${context}.PipeError.root('${err}', ${input})`,
		],
		{
			context: { PipeError },
			schema: () => ({ oneOf: [{ type: 'string', format: 'date-time' }, { type: 'integer' }] }),
		},
	)
}

export const after = (compare: Timeable, err?: string) => {
	const varName = `compare_${getRandomValue()}`
	return standard<Date, Date>(
		({ input, context }) => [
			`const ${varName} = new Date(${context}.after)`,
			`if (${input} <= ${varName}) throw ${context}.PipeError.root(\`${err ?? `is not later than \${${varName}.toString()}`}\`, ${input})`,
		],
		{
			context: { after: compare, PipeError },
		},
	)
}

export const before = (compare: Timeable, err?: string) => {
	const varName = `compare_${getRandomValue()}`
	return standard<Date, Date>(
		({ input, context }) => [
			`const ${varName} = new Date(${context}.after)`,
			`if (${input} >= ${varName}) throw ${context}.PipeError.root(\`${err ?? `is not later than \${${varName}.toString()}`}\`, ${input})`,
		],
		{
			context: { after: compare, PipeError },
		},
	)
}

export const asStamp = () =>
	standard<Date, number>(({ input }) => [`${input} = ${input}.valueOf()`], { schema: () => ({ type: 'integer', oneOf: undefined }) })
export const asISOString = () =>
	standard<Date, string>(({ input }) => [`${input} = ${input}.toISOString()`], {
		schema: () => ({ type: 'string', format: 'date-time', oneOf: undefined }),
	})
