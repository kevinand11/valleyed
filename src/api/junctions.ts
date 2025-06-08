import { makePipe, Pipe, PipeError, PipeInput, PipeOutput } from './base'
import { wrapInTryCatch } from '../utils/functions'

export const or = <T extends Pipe<any, any>[]>(pipes: T) =>
	makePipe<PipeInput<T[number]>, PipeOutput<T[number]>>(
		(input) => {
			if (pipes.length === 0) return input as any
			const errors: PipeError[] = []
			for (const [idx, pipe] of Object.entries(pipes)) {
				const validity = pipe.safeParse(input)
				if (validity.valid) return validity.value
				errors.push(PipeError.path(idx, validity.error, input))
			}
			throw errors[0]
		},
		{},
		(schema) => ({ ...schema, oneOf: pipes.map((branch) => branch.toJsonSchema()) }),
	)

export const and = <T extends Pipe<any, any>>(pipes: T[]) =>
	makePipe<PipeInput<T>, PipeOutput<T>>(
		(input) => {
			for (const [idx, pipe] of Object.entries(pipes)) {
				const validity = pipe.safeParse(input)
				if (!validity.valid) throw PipeError.path(idx, validity.error, input)
				input = validity.value
			}
			return input as any
		},
		{},
		(schema) => ({ ...schema, allOf: pipes.map((branch) => branch.toJsonSchema()) }),
	)

export const discriminate = <T extends Record<PropertyKey, Pipe<any, any>>>(
	discriminator: (val: PipeInput<T[keyof T]>) => PropertyKey,
	schemas: T,
	err = 'doesnt match any of the schema',
) =>
	makePipe<PipeInput<T[keyof T]>, PipeOutput<T[keyof T]>>(
		(input) => {
			const accessor = wrapInTryCatch(() => discriminator(input as any))!
			if (!schemas[accessor]) throw PipeError.root(err, input)
			return schemas[accessor].parse(input)
		},
		{},
		(schema) => ({ ...schema, oneOf: Object.values(schemas).map((schema) => schema.toJsonSchema()) }),
	)

export const tryJSON = <T extends Pipe<any, any>>(pipe: T) =>
	makePipe<PipeInput<T>, PipeOutput<T>>((input) => {
		const validity = pipe.safeParse(input)
		if (validity.valid) return validity.value
		if (input?.constructor?.name !== 'String') throw validity.error

		const parsed = wrapInTryCatch(() => JSON.parse(input as any), validity.error)
		if (parsed === validity.error) throw validity.error
		return pipe.parse(parsed)
	}, {})
