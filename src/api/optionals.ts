import { makeBranchPipe, Pipe, PipeContext, PipeInput, PipeOutput } from './base'
import { DeepPartial } from '../utils/types'

const partial = <T extends Pipe<any, any, any>, P, C>(
	branch: T,
	partialCondition: (i: unknown) => boolean,
	force: boolean,
	config: Parameters<typeof makeBranchPipe<T, PipeInput<T> | P, PipeOutput<T> | P, PipeContext<T> & C>>[2],
) =>
	makeBranchPipe<T, PipeInput<T> | P, PipeOutput<T> | P, PipeContext<T> & C>(
		branch,
		(input) => {
			const isPartial = partialCondition(input)
			if (isPartial) return input as P
			const validity = branch.safeParse(input)
			if (validity.valid) return validity.value as PipeOutput<T>
			if (force) throw validity.error
			return input as P
		},
		config,
	)

export const nullable = <T extends Pipe<any, any, any>>(branch: T) =>
	partial<T, null, any>(branch, (i) => i === null, true, {
		schema: (schema) => ({ oneOf: [schema, { type: 'null' }] }),
		context: (c) => c,
	})

export const optional = <T extends Pipe<any, any, any>>(branch: T) =>
	partial<T, undefined, any>(branch, (i) => i === undefined, true, {
		schema: (schema) => schema,
		context: (c) => ({ ...c, optional: true }),
	})

export const nullish = <T extends Pipe<any, any, any>>(branch: T) =>
	partial<T, null | undefined, any>(branch, (i) => i === null || i === undefined, true, {
		schema: (schema) => ({ oneOf: [schema, { type: 'null' }] }),
		context: (c) => ({ ...c, optional: true }),
	})

export const requiredIf = <T extends Pipe<any, any, any>>(branch: T, condition: () => boolean) =>
	partial<T, never, any>(branch, () => !condition(), condition(), {
		schema: (schema) => schema,
		context: (c) => ({ ...c, optional: true }),
	})

type FunctionOrValue<T> = T | (() => T) | undefined
type DefaultValue<T> = FunctionOrValue<T extends object ? DeepPartial<T> : T>

function runDefault<T>(def: DefaultValue<T>): T {
	return typeof def === 'function' ? (def as Function)() : (def as any)
}

export const defaults = <T extends Pipe<any, any, any>>(branch: T, def: DefaultValue<PipeInput<T>>) =>
	makeBranchPipe<T, PipeInput<T> | undefined, Exclude<PipeOutput<T>, undefined>, any>(
		branch,
		(input) => branch.parse(input !== undefined ? input : runDefault(def)),
		{
			schema: (s) => ({ ...s, default: runDefault(def) }),
			context: (c) => ({ ...c, optional: true }),
		},
	)

export const defaultsOnFail = <T extends Pipe<any, any, any>>(branch: T, def: DefaultValue<PipeInput<T>>) =>
	makeBranchPipe<T, PipeInput<T>, PipeOutput<T>, PipeContext<T>>(
		branch,
		(input) => {
			const validity = branch.safeParse(input)
			if (validity.valid) return validity.value
			return runDefault(def)
		},
		{
			schema: (s) => ({ ...s, default: runDefault(def) }),
			context: (c) => ({ ...c, optional: true }),
		},
	)
