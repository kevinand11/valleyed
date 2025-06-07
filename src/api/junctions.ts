import { makePipe, Pipe, PipeError, PipeInput, PipeOutput } from './base'
import { wrapInTryCatch } from '../utils/functions'

export const or = <T extends Pipe<any, any>[]>(branches: T, err = 'doesnt match any of the schema') =>
	makePipe<PipeInput<T[number]>, PipeOutput<T[number]>>((input) => {
		for (const branch of branches) {
			const validity = branch.safeParse(input)
			if (validity.valid) return validity.value
		}
		throw new PipeError([err], input)
	}, {})

export const and = <T extends Pipe<any, any>>(branches: T[], err?: string) =>
	makePipe<PipeInput<T>, PipeOutput<T>>((input) => {
		for (const branch of branches) {
			const validity = branch.safeParse(input)
			if (!validity.valid) throw err ? validity.error.withMessages([err]) : validity.error
			input = validity.value
		}
		return input as any
	}, {})

export const discriminate = <T extends Record<PropertyKey, Pipe<any, any>>>(
	discriminator: (val: PipeInput<T[keyof T]>) => PropertyKey,
	schemas: T,
	err = 'doesnt match any of the schema',
) =>
	makePipe<PipeInput<T[keyof T]>, PipeOutput<T[keyof T]>>((input) => {
		const accessor = wrapInTryCatch(() => discriminator(input as any))!
		if (!schemas[accessor]) throw new PipeError([err], input)
		return schemas[accessor].parse(input)
	}, {})
