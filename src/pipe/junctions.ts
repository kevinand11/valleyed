import { makePipeFn, Pipe, PipeError, PipeInput, PipeOutput } from './base'
import { wrapInTryCatch } from '../utils/functions'

export const or = <T extends Pipe<any, any>[]>(branches: T, err = 'doesnt match any of the schema') =>
	makePipeFn<PipeInput<T[number]>, PipeOutput<T[number]>>((input) => {
		for (const branch of branches) {
			const value = branch.safeParse(input)
			if ('value' in value) return value.value
		}
		throw new PipeError([err], input)
	})

export const and = <T>(branches: Pipe<T>[], err?: string) =>
	makePipeFn<T>((input) => {
		for (const branch of branches) {
			const value = branch.safeParse(input)
			if ('error' in value) throw err ? value.error.withMessages([err]) : value.error
			input = value.value
		}
		return input as T
	})

export const discriminate = <T extends Record<PropertyKey, Pipe<any, any>>>(
	discriminator: (val: PipeInput<T[keyof T]>) => PropertyKey,
	schemas: T,
	err = 'doesnt match any of the schema',
) =>
	makePipeFn<PipeInput<T[keyof T]>, PipeOutput<T[keyof T]>>((input) => {
		const accessor = wrapInTryCatch(() => discriminator(input as any))!
		if (!schemas[accessor]) throw new PipeError([err], input)
		return schemas[accessor].parse(input)
	})
