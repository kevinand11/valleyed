import { Pipe, PipeInput, PipeOutput } from './base'
import { assert, compileToAssert, standard, validate, compileToValidate, context, schema } from './base/pipes'
import { execValueFunction, getRandomValue, ValueFunction } from '../utils/functions'
import { DeepPartial } from '../utils/types'

const partial = <T extends Pipe<any, any>, P>(
	branch: T,
	partialCondition: (i: unknown) => boolean,
	config: Parameters<typeof standard<PipeInput<T> | P, PipeOutput<T> | P>>[1],
) =>
	standard<PipeInput<T> | P, PipeOutput<T> | P>(
		({ input, context }, rootContext) =>
			compileToAssert(branch, rootContext, input, context, `${input} = ${context}.partialCondition(${input}) ? ${input} :`),
		{
			...config,
			context: { ...config?.context, partialCondition },
		},
	)

export const nullable = <T extends Pipe<any, any>>(branch: T) =>
	partial<T, null>(branch, (i) => i === null, {
		schema: () => ({ oneOf: [schema(branch), { type: 'null' }] }),
	})

export const optional = <T extends Pipe<any, any>>(branch: T) =>
	partial<T, undefined>(branch, (i) => i === undefined, {
		context: { optional: true },
	})

export const nullish = <T extends Pipe<any, any>>(branch: T) =>
	partial<T, null | undefined>(branch, (i) => i === null || i === undefined, {
		schema: () => ({ oneOf: [schema(branch), { type: 'null' }] }),
		context: { ...context(branch), optional: true },
	})

export const conditional = <T extends Pipe<any, any>>(branch: T, condition: () => boolean) =>
	partial<T, never>(branch, () => !condition(), {
		schema: () => schema(branch),
		context: { ...context(branch), optional: true },
	})

type DefaultValue<T> = ValueFunction<T extends object ? DeepPartial<T> : T>

export const defaults = <T extends Pipe<any, any>>(branch: T, def: DefaultValue<PipeInput<T>>) =>
	standard<PipeInput<T> | undefined, Exclude<PipeOutput<T>, undefined>>(
		({ input, context }, rootContext) => [
			`if (${input} === undefined) ${input} = ${context}.execValueFunction(${context}.defaults)`,
			...compileToAssert(branch, rootContext, input, context, `${input} = `),
		],
		{
			schema: (c) => ({ ...schema(branch), default: execValueFunction(c.defaults ?? def) }),
			context: { ...context(branch), defaults: def, optional: true, assert, branch, execValueFunction },
		},
	)

const onCatch = <T extends Pipe<any, any>>(branch: T, def: DefaultValue<PipeInput<T>>) => {
	const varname = `validity_${getRandomValue()}`
	return standard<PipeInput<T>, PipeOutput<T>>(
		({ input, context }, rootContext) => [
			...compileToValidate(branch, rootContext, input, context, `const ${varname} = `),
			`${input} = ${varname}.valid ? ${varname}.value : ${context}.execValueFunction(${context}.catch)`,
		],
		{
			schema: (c) => ({ ...schema(branch), default: execValueFunction(c.catch ?? def) }),
			context: { ...context(branch), catch: def, execValueFunction, validate, branch },
		},
	)
}
export { onCatch as catch }
