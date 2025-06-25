import { Pipe, PipeContext, PipeInput, PipeOutput } from './base'
import { assert, branch, validate } from './base/pipes'
import { execValueFunction, ValueFunction } from '../utils/functions'
import { DeepPartial } from '../utils/types'

const partial = <T extends Pipe<any, any, any>, P, C>(
	pipe: T,
	partialCondition: (i: unknown) => boolean,
	force: boolean,
	config: Parameters<typeof branch<T, PipeInput<T> | P, PipeOutput<T> | P, PipeContext<T> & C>>[2],
) =>
	branch<T, PipeInput<T> | P, PipeOutput<T> | P, PipeContext<T> & C>(
		pipe,
		(input) => {
			const isPartial = partialCondition(input)
			if (isPartial) return input as P
			const validity = validate(pipe, input)
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

export const conditional = <T extends Pipe<any, any, any>>(branch: T, condition: () => boolean) =>
	partial<T, never, any>(branch, () => !condition(), condition(), {
		schema: (schema) => schema,
		context: (c) => ({ ...c, optional: true }),
	})

type DefaultValue<T> = ValueFunction<T extends object ? DeepPartial<T> : T>

export const defaults = <T extends Pipe<any, any, any>>(pipe: T, def: DefaultValue<PipeInput<T>>) =>
	branch<T, PipeInput<T> | undefined, Exclude<PipeOutput<T>, undefined>, any>(
		pipe,
		(input, context) => assert(pipe, input !== undefined ? input : execValueFunction(context?.defaults ?? def)) as any,
		{
			schema: (s, c) => ({ ...s, default: execValueFunction(c.defaults ?? def) }),
			context: (c) => ({ ...c, defaults: def, optional: true }),
		},
	)

const onCatch = <T extends Pipe<any, any, any>>(pipe: T, def: DefaultValue<PipeInput<T>>) =>
	branch<T, PipeInput<T>, PipeOutput<T>, PipeContext<T>>(
		pipe,
		(input, context) => {
			const validity = validate(pipe, input)
			if (validity.valid) return validity.value
			return execValueFunction(context?.catch ?? def) as any
		},
		{
			schema: (s, c) => ({ ...s, default: execValueFunction(c.catch ?? def) }),
			context: (c) => ({ ...c, catch: def }),
		},
	)
export { onCatch as catch }
