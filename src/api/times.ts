import { PipeError } from './base'
import { standard } from './base/pipes'
import { execValueFunction, ValueFunction } from '../utils/functions'

export type Timeable = Date | string | number

export const time = (err = 'is not a valid datetime') =>
	standard<Timeable, Date>(
		({ input, context }) =>
			`(${input} instanceof Date || typeof ${input} === 'number' || typeof ${input} === 'string') && !isNaN(new Date(${input}).getTime()) ? new Date(${input}) : ${context}.PipeError.root('${err}', ${input})`,
		{
			context: () => ({ PipeError }),
			schema: () => ({ oneOf: [{ type: 'string', format: 'date-time' }, { type: 'integer' }] }),
		},
	)

export const after = (compare: ValueFunction<Timeable>, err?: string) =>
	standard<Date, Date>(
		({ input, context }) =>
			`(() => {
				const compareDate = new Date(${context}.execValueFunction(${context}.after));
				if (${input} > compareDate) return ${input};
				return ${context}.PipeError.root(\`${err ?? 'is not later than ${compareDate.toString()}'}\`, ${input});
			})()`,
		{
			context: () => ({ after: compare, PipeError, execValueFunction }),
		},
	)

export const before = (compare: ValueFunction<Timeable>, err?: string) =>
	standard<Date, Date>(
		({ input, context }) =>
			`(() => {
				const compareDate = new Date(${context}.execValueFunction(${context}.before));
				if (${input} < compareDate) return ${input};
				return ${context}.PipeError.root(\`${err ?? 'is not earlier than ${compareDate.toString()}'}\`, ${input});
			})()`,
		{
			context: () => ({ before: compare, PipeError, execValueFunction }),
		},
	)

export const asStamp = () =>
	standard<Date, number>(({ input }) => `${input}.valueOf()`, { schema: () => ({ type: 'integer', oneOf: undefined }) })
export const asISOString = () =>
	standard<Date, string>(({ input }) => `${input}.toISOString()`, {
		schema: () => ({ type: 'string', format: 'date-time', oneOf: undefined }),
	})
