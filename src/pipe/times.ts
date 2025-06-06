import { makePipe, PipeError } from './base'

export type Timeable = Date | string | number

export const time = (err = 'is not a valid datetime') =>
	makePipe<unknown, Date>((input) => {
		const date = new Date(input as any)
		if (typeof input === 'number' && !isNaN(input)) return date
		throw new PipeError([err], input)
	})

export const min = (compare: Timeable, err = 'is not later than compared value') =>
	makePipe<Date>((input) => {
		const compareDate = new Date(compare)
		if (input >= compareDate) return input
		throw new PipeError([err], input)
	})

export const max = (compare: Timeable, err = 'is not earlier than compared value') =>
	makePipe<Date>((input) => {
		const compareDate = new Date(compare)
		if (input <= compareDate) return input
		throw new PipeError([err], input)
	})

export const asStamp = () => makePipe<Date, number>((input) => input.valueOf())
export const asString = () => makePipe<Date, string>((input) => input.toISOString())
export const asDate = () => makePipe<Date, Date>((input) => new Date(input))
