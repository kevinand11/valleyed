import { makePipeFn, PipeError } from './base'

export const gt = (value: number, err = `must be greater than ${value}`) =>
	makePipeFn<number>((input) => {
		if (input > value) return input
		throw new PipeError([err], input)
	})

export const gte = (value: number, err = `must be greater than or equal to ${value}`) =>
	makePipeFn<number>((input) => {
		if (input >= value) return input
		throw new PipeError([err], input)
	})

export const lt = (value: number, err = `must be less than ${value}`) =>
	makePipeFn<number>((input) => {
		if (input < value) return input
		throw new PipeError([err], input)
	})

export const lte = (value: number, err = `must be less than or equal to ${value}`) =>
	makePipeFn<number>((input) => {
		if (input <= value) return input
		throw new PipeError([err], input)
	})

export const int = (error = 'is not an integer') =>
	makePipeFn<number>((input) => {
		if (input === parseInt(input as any)) return input
		throw new PipeError([error], input)
	})

export const asRound = () => makePipeFn<number>((input) => Number(input.toFixed(0)))
