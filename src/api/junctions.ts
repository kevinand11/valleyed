import { makeBranchPipe, pipe, Pipe, PipeContext, PipeError, PipeInput, PipeOutput } from './base'
import { merge as differMerge } from '../utils/differ'
import { wrapInTryCatch } from '../utils/functions'

export const or = <T extends Pipe<any, any, any>[]>(pipes: T) =>
	pipe<PipeInput<T[number]>, PipeOutput<T[number]>, PipeContext<T[number]>>(
		(input) => {
			if (pipes.length === 0) return input as any
			const errors: PipeError[] = []
			for (const [idx, pipe] of Object.entries(pipes)) {
				const validity = pipe.validate(input)
				if (validity.valid) return validity.value
				errors.push(PipeError.path(idx, validity.error, input))
			}
			throw errors[0]
		},
		{ schema: () => ({ oneOf: pipes.map((branch) => branch.toJsonSchema()) }) },
	)

export const and = <T extends Pipe<any, any, any>>(pipes: T[]) =>
	pipe<PipeInput<T>, PipeOutput<T>, PipeContext<T>>(
		(input) => {
			for (const [idx, pipe] of Object.entries(pipes)) {
				const validity = pipe.validate(input)
				if (!validity.valid) throw PipeError.path(idx, validity.error, input)
				input = validity.value
			}
			return input as any
		},
		{ schema: () => ({ allOf: pipes.map((branch) => branch.toJsonSchema()) }) },
	)

export const merge = <T1 extends Pipe<any, any, any>, T2 extends Pipe<any, any, any>>(branch1: T1, branch2: T2) =>
	pipe<PipeInput<T1> & PipeInput<T2>, PipeOutput<T1> & PipeOutput<T2>, PipeContext<T1> & PipeContext<T2>>(
		(input) => {
			const validity1 = branch1.validate(input)
			if (!validity1.valid) throw validity1.error
			const validity2 = branch2.validate(input)
			if (!validity2.valid) throw validity2.error
			return differMerge(validity1.value, validity2.value)
		},
		{ schema: () => ({ allOf: [branch1.toJsonSchema(), branch2.toJsonSchema()] }) },
	)

export const discriminate = <T extends Record<PropertyKey, Pipe<any, any, any>>>(
	discriminator: (val: PipeInput<T[keyof T]>) => PropertyKey,
	schemas: T,
	err = 'doesnt match any of the schema',
) =>
	pipe<PipeInput<T[keyof T]>, PipeOutput<T[keyof T]>, PipeContext<T[keyof T]>>(
		(input) => {
			const accessor = wrapInTryCatch(() => discriminator(input))!
			if (!schemas[accessor]) throw PipeError.root(err, input)
			return schemas[accessor].parse(input)
		},
		{
			schema: () => ({ oneOf: Object.values(schemas).map((schema) => schema.toJsonSchema()) }),
		},
	)

export const fromJson = <T extends Pipe<any, any, any>>(branch: T) =>
	makeBranchPipe<T, PipeInput<T>, PipeOutput<T>, PipeContext<T>>(
		branch,
		(input) => {
			const validity = branch.validate(input)
			if (validity.valid) return validity.value
			if (input?.constructor?.name !== 'String') throw validity.error

			const parsed = wrapInTryCatch(() => JSON.parse(input), validity.error)
			if (parsed === validity.error) throw validity.error
			return branch.parse(parsed)
		},
		{
			context: (c) => c,
			schema: (s) => s,
		},
	)
