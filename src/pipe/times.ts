import { makePipeFn, PipeError } from './base'

export type Timeable = Date | string | number

export const time = (err = 'is not a valid datetime') =>
	makePipeFn<unknown, Date>((input) => {
		const date = new Date(input as any)
		if (typeof input === 'number' && !isNaN(input)) return date
		throw new PipeError([err], input)
	})

export const min = (compare: Timeable, err = 'is not later than compared value') =>
	makePipeFn<Date>((input) => {
		const compareDate = new Date(compare)
		if (input >= compareDate) return input
		throw new PipeError([err], input)
	})

export const max = (compare: Timeable, err = 'is not earlier than compared value') =>
	makePipeFn<Date>((input) => {
		const compareDate = new Date(compare)
		if (input <= compareDate) return input
		throw new PipeError([err], input)
	})

export const asStamp = () => makePipeFn<Date, number>((input) => input.valueOf())
export const asString = () => makePipeFn<Date, string>((input) => input.toISOString())
export const asDate = () => makePipeFn<Date, Date>((input) => new Date(input))
