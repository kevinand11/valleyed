import { pipe, PipeError } from './base'

export type Timeable = Date | string | number

export const time = (err = 'is not a valid datetime') =>
	pipe<Date, Date, any>(
		(input) => {
			if (input instanceof Date) return input
			if (typeof input === 'number' || typeof input === 'string') {
				const date = new Date(input)
				if (!isNaN(date.getTime())) return date
			}
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ oneOf: [{ type: 'string', format: 'date-time' }, { type: 'int' }] }) },
	)

export const after = (compare: Timeable, err = 'is not later than compared value') =>
	pipe<Date, Date, any>((input) => {
		const compareDate = new Date(compare)
		if (input > compareDate) return input
		throw PipeError.root(err, input)
	})

export const before = (compare: Timeable, err = 'is not earlier than compared value') =>
	pipe<Date, Date, any>((input) => {
		const compareDate = new Date(compare)
		if (input < compareDate) return input
		throw PipeError.root(err, input)
	})

export const asStamp = () => pipe<Date, number, any>((input) => input.valueOf())
export const asISOString = () => pipe<Date, string, any>((input) => input.toISOString())
