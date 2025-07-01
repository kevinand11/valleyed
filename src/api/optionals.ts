import { Pipe, PipeInput, PipeOutput } from './base'
import { assert, compileToAssert, standard, validate, compileToValidate } from './base/pipes'
import { execValueFunction, ValueFunction } from '../utils/functions'
import { DeepPartial } from '../utils/types'

const partial = <T extends Pipe<any, any>, P>(
	branch: T,
	partialCondition: (i: unknown) => boolean,
	config: Parameters<typeof standard<PipeInput<T> | P, PipeOutput<T> | P>>[1],
) =>
	standard<PipeInput<T> | P, PipeOutput<T> | P>(
		({ input, context }, rootContext) =>
			`${context}.partialCondition(${input}) ? ${input} : ${compileToAssert(branch, rootContext, input, context)}`,
		{
			...config,
			context: () => ({ ...config?.context?.(), partialCondition }),
		},
	)

export const nullable = <T extends Pipe<any, any>>(branch: T) =>
	partial<T, null>(branch, (i) => i === null, {
		schema: (c) => ({ oneOf: [branch.schema(c), { type: 'null' }] }),
	})

export const optional = <T extends Pipe<any, any>>(branch: T) =>
	partial<T, undefined>(branch, (i) => i === undefined, {
		context: () => ({ optional: true }),
	})

export const nullish = <T extends Pipe<any, any>>(branch: T) =>
	partial<T, null | undefined>(branch, (i) => i === null || i === undefined, {
		schema: (c) => ({ oneOf: [branch.schema(c), { type: 'null' }] }),
		context: () => ({ ...branch.context(), optional: true }),
	})

export const conditional = <T extends Pipe<any, any>>(branch: T, condition: () => boolean) =>
	partial<T, never>(branch, () => !condition(), {
		schema: (c) => branch.schema(c),
		context: () => ({ ...branch.context(), optional: true }),
	})

type DefaultValue<T> = ValueFunction<T extends object ? DeepPartial<T> : T>

export const defaults = <T extends Pipe<any, any>>(branch: T, def: DefaultValue<PipeInput<T>>) =>
	standard<PipeInput<T> | undefined, Exclude<PipeOutput<T>, undefined>>(
		({ input, context }, rootContext) => `(() => {
	if (${input} === undefined) input = ${context}.execValueFunction(${context}.defaults);
	${compileToAssert(branch, rootContext, input, context)}
})()`,
		{
			schema: (c) => ({ ...branch.schema(c), default: execValueFunction(c.defaults ?? def) }),
			context: () => ({ ...branch.context(), defaults: def, optional: true, assert, branch, execValueFunction }),
		},
	)

const onCatch = <T extends Pipe<any, any>>(branch: T, def: DefaultValue<PipeInput<T>>) =>
	standard<PipeInput<T>, PipeOutput<T>>(
		({ input, context }, rootContext) => `(() => {
	const validity = ${compileToValidate(branch, rootContext, input, context)};
	if (validity.valid) return validity.value;
	return ${context}.execValueFunction(${context}.catch);
})()`,
		{
			schema: (c) => ({ ...branch.schema(c), default: execValueFunction(c.catch ?? def) }),
			context: () => ({ ...branch.context(), catch: def, execValueFunction, validate, branch }),
		},
	)
export { onCatch as catch }
