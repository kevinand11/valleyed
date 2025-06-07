import { makePipe, PipeError } from './base'

export type Timeable = Date | string | number

export const time = (err = 'is not a valid datetime') =>
	makePipe<Date>((input: unknown) => {
		if (input instanceof Date) return input
		if (typeof input === 'number' || typeof input === 'string') {
			const date = new Date(input as any)
			if (!isNaN(date.getTime())) return date
		}
		throw new PipeError([err], input)
	}, {})

export const after = (compare: Timeable, err = 'is not later than compared value') =>
	makePipe<Date>((input) => {
		const compareDate = new Date(compare)
		if (input > compareDate) return input
		throw new PipeError([err], input)
	}, {})

export const before = (compare: Timeable, err = 'is not earlier than compared value') =>
	makePipe<Date>((input) => {
		const compareDate = new Date(compare)
		if (input < compareDate) return input
		throw new PipeError([err], input)
	}, {})

export const asStamp = () => makePipe<Date, number>((input) => input.valueOf(), {})
export const asISOString = () => makePipe<Date, string>((input) => input.toISOString(), {})
