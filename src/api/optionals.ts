import { Pipe, PipeContext, PipeInput, PipeOutput } from './base'
import { assert, compileToAssert, pipe, validate, compileToValidate } from './base/pipes'
import { execValueFunction, ValueFunction } from '../utils/functions'
import { DeepPartial } from '../utils/types'

const partial = <T extends Pipe<any, any, any>, P>(
	branch: T,
	partialCondition: (i: unknown) => boolean,
	config: Parameters<typeof pipe<PipeInput<T> | P, PipeOutput<T> | P, any>>[1],
) =>
	pipe<PipeInput<T> | P, PipeOutput<T> | P, any>(
		(input) => {
			const isPartial = partialCondition(input)
			if (isPartial) return input as P
			return assert(branch, input)
		},
		{
			...config,
			context: () => ({ ...config?.context?.(), partialCondition }),
			compile: ({ input, context }, rootContext) =>
				`${context}.partialCondition(${input}) ? ${input} : ${compileToAssert(branch, rootContext, input, context)}`,
		},
	)

export const nullable = <T extends Pipe<any, any, any>>(branch: T) =>
	partial<T, null>(branch, (i) => i === null, {
		schema: (c) => ({ oneOf: [branch.schema(c), { type: 'null' }] }),
	})

export const optional = <T extends Pipe<any, any, any>>(branch: T) =>
	partial<T, undefined>(branch, (i) => i === undefined, {
		context: () => ({ optional: true }),
	})

export const nullish = <T extends Pipe<any, any, any>>(branch: T) =>
	partial<T, null | undefined>(branch, (i) => i === null || i === undefined, {
		schema: (c) => ({ oneOf: [branch.schema(c), { type: 'null' }] }),
		context: () => ({ ...branch.context(), optional: true }),
	})

export const conditional = <T extends Pipe<any, any, any>>(branch: T, condition: () => boolean) =>
	partial<T, never>(branch, () => !condition(), {
		schema: (c) => branch.schema(c),
		context: () => ({ ...branch.context(), optional: true }),
	})

type DefaultValue<T> = ValueFunction<T extends object ? DeepPartial<T> : T>

export const defaults = <T extends Pipe<any, any, any>>(branch: T, def: DefaultValue<PipeInput<T>>) =>
	pipe<PipeInput<T> | undefined, Exclude<PipeOutput<T>, undefined>, any>(
		(input, context) => assert(branch, input !== undefined ? input : execValueFunction(context?.defaults ?? def)) as any,
		{
			compile: ({ input, context }, rootContext) =>
				`${compileToAssert(branch, rootContext, `${input} !== undefined ? ${input} : ${context}.execValueFunction(${context}.defaults)`, context)}`,
			schema: (c) => ({ ...branch.schema(c), default: execValueFunction(c.defaults ?? def) }),
			context: () => ({ ...branch.context(), defaults: def, optional: true, assert, branch, execValueFunction }),
		},
	)

const onCatch = <T extends Pipe<any, any, any>>(branch: T, def: DefaultValue<PipeInput<T>>) =>
	pipe<PipeInput<T>, PipeOutput<T>, PipeContext<T>>(
		(input, context) => {
			const validity = validate(branch, input)
			if (validity.valid) return validity.value
			return execValueFunction(context?.catch ?? def) as any
		},
		{
			compile: ({ input, context }, rootContext) => `(() => {
	const validity = ${compileToValidate(branch, rootContext, input, context)};
	if (validity.valid) return validity.value;
	return ${context}.execValueFunction(${context}.catch);
})()`,
			schema: (c) => ({ ...branch.schema(c), default: execValueFunction(c.catch ?? def) }),
			context: () => ({ ...branch.context(), catch: def, execValueFunction, validate, branch }),
		},
	)
export { onCatch as catch }
