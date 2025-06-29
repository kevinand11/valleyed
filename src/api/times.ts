import { PipeError } from './base'
import { pipe } from './base/pipes'
import { execValueFunction, ValueFunction } from '../utils/functions'

export type Timeable = Date | string | number

export const time = (err = 'is not a valid datetime') =>
	pipe<Timeable, Date, any>(
		(input) => {
			if (input instanceof Date) return input
			if (typeof input === 'number' || typeof input === 'string') {
				const date = new Date(input)
				if (!isNaN(date.getTime())) return date
			}
			throw PipeError.root(err, input)
		},
		{
			compile: ({ input, context }) =>
				`!isNaN(new Date(${input}).getTime()) ? new Date(${input}) : ${context}.PipeError.root('${err}', ${input})`,
			context: () => ({ PipeError }),
			schema: () => ({ oneOf: [{ type: 'string', format: 'date-time' }, { type: 'integer' }] }),
		},
	)

export const after = (compare: ValueFunction<Timeable>, err?: string) =>
	pipe<Date, Date, any>(
		(input, context) => {
			const compareDate = new Date(execValueFunction(context?.after ?? compare))
			if (input > compareDate) return input
			throw PipeError.root(err ?? `is not later than ${compareDate.toString()}`, input)
		},
		{
			compile: ({ input, context }) =>
				`(() => {
					const compareDate = new Date(${context}.execValueFunction(${context}.after));
					if (${input} > compareDate) return ${input};
					return ${context}.PipeError.root(\`${err ?? 'is not later than ${compareDate.toString()}'}\`, ${input});
				})()`,
			context: () => ({ after: compare, PipeError, execValueFunction }),
		},
	)

export const before = (compare: ValueFunction<Timeable>, err?: string) =>
	pipe<Date, Date, any>(
		(input, context) => {
			const compareDate = new Date(execValueFunction(context?.before ?? compare))
			if (input < compareDate) return input
			throw PipeError.root(err ?? `is not earlier than ${compareDate.toString()}`, input)
		},
		{
			compile: ({ input, context }) =>
				`(() => {
					const compareDate = new Date(${context}.execValueFunction(${context}.before));
					if (${input} < compareDate) return ${input};
					return ${context}.PipeError.root(\`${err ?? 'is not earlier than ${compareDate.toString()}'}\`, ${input});
				})()`,
			context: () => ({ before: compare, PipeError, execValueFunction }),
		},
	)

export const asStamp = () => pipe<Date, number, any>((input) => input.valueOf(), { schema: () => ({ type: 'integer', oneOf: undefined }) })
export const asISOString = () =>
	pipe<Date, string, any>((input) => input.toISOString(), { schema: () => ({ type: 'string', format: 'date-time', oneOf: undefined }) })
