import { Pipe, PipeInput, PipeOutput } from './base'
import { assert, standard, validate, compileNested, context, schema } from './base/pipes'
import { getRandomValue } from '../utils/functions'
import { DeepPartial } from '../utils/types'

const partial = <T extends Pipe<any, any>, P>(
	branch: T,
	partialCondition: (i: unknown) => boolean,
	config: Parameters<typeof standard<PipeInput<T> | P, PipeOutput<T> | P>>[1],
) => {
	const varname = `validity_${getRandomValue()}`
	return standard<PipeInput<T> | P, PipeOutput<T> | P>(
		({ input, context }, rootContext) => [
			`if (!${context}.partialCondition(${input})) {`,
			...compileNested({
				pipe: branch,
				rootContext,
				input,
				context,
				prefix: `const ${varname} = `,
			}).map((l) => `  ${l}`),
			`	if (${varname} instanceof PipeError) return ${varname}`,
			`	${input} = ${varname}`,
			`}`,
		],
		{
			...config,
			context: { ...config?.context, partialCondition },
		},
	)
}

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

type DefaultValue<T> = T extends object ? DeepPartial<T> : T

export const defaults = <T extends Pipe<any, any>>(branch: T, def: DefaultValue<PipeInput<T>>) =>
	standard<PipeInput<T> | undefined, Exclude<PipeOutput<T>, undefined>>(
		({ input, context }, rootContext) => [
			`if (${input} === undefined) ${input} = ${context}.defaults`,
			...compileNested({ pipe: branch, rootContext, input, context, prefix: `${input} = ` }),
			`if (${input} instanceof PipeError) return ${input}`,
		],
		{
			schema: (c) => ({ ...schema(branch), default: c.defaults ?? def }),
			context: { ...context(branch), defaults: def, optional: true, assert, branch },
		},
	)

const onCatch = <T extends Pipe<any, any>>(branch: T, def: DefaultValue<PipeInput<T>>) =>
	standard<PipeInput<T>, PipeOutput<T>>(
		({ input, context }, rootContext) => [
			...compileNested({ pipe: branch, rootContext, input, context, prefix: `${input} = ` }),
			`if (${input} instanceof PipeError) ${input} = ${context}.catch`,
		],
		{
			schema: (c) => ({ ...schema(branch), default: c.catch ?? def }),
			context: { ...context(branch), catch: def, validate, branch },
		},
	)

export { onCatch as catch }
