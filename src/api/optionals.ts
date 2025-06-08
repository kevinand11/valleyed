import { JsonSchemaBuilder, makePipe, Pipe, PipeInput, PipeOutput } from './base'

export const optionalTag = '__optional__'

const partial = <T extends Pipe<any, any>, P, C extends object = object>(
	branch: T,
	partialCondition: (i: unknown) => boolean,
	force: boolean,
	schemaBuilder: JsonSchemaBuilder,
	context: C,
) =>
	makePipe<PipeInput<T> | P, PipeOutput<T> | P, C>(
		(input) => {
			const isPartial = partialCondition(input)
			if (isPartial) return input as P
			const validity = branch.safeParse(input)
			if (validity.valid) return validity.value as PipeOutput<T>
			if (force) throw validity.error
			return input as P
		},
		context,
		schemaBuilder,
	)

export const nullable = <T extends Pipe<any, any, any>>(branch: T) =>
	partial<T, null>(branch, (i) => i === null, true, { anyOf: [branch.toJsonSchema(), { type: 'null' }] }, {})

export const optional = <T extends Pipe<any, any, object>>(branch: T) =>
	partial<T, undefined, Record<typeof optionalTag, boolean>>(
		branch,
		(i) => i === undefined,
		true,
		() => ({ anyOf: [branch.toJsonSchema(), { type: 'undefined' }] }),
		{ [optionalTag]: true },
	)

export const nullish = <T extends Pipe<any, any, object>>(branch: T) =>
	partial<T, null | undefined, Record<typeof optionalTag, boolean>>(
		branch,
		(i) => i === null || i === undefined,
		true,
		() => ({ anyOf: [branch.toJsonSchema(), { type: 'null' }, { type: 'undefined' }] }),
		{ [optionalTag]: true },
	)

export const requiredIf = <T extends Pipe<any, any, object>>(branch: T, condition: () => boolean) =>
	partial<T, undefined, Record<typeof optionalTag, boolean>>(
		branch,
		() => !condition(),
		condition(),
		() => ({ anyOf: [branch.toJsonSchema(), { type: 'undefined' }].slice(0, condition() ? 1 : 2) }),
		{ [optionalTag]: true },
	)

type FunctionOrValue<T> = T | (() => T)

function runDefault<T>(def: FunctionOrValue<T>): T {
	return typeof def === 'function' ? (def as Function)() : def
}

export const defaults = <T extends Pipe<any, any, object>>(branch: T, def: FunctionOrValue<PipeInput<T>>) =>
	makePipe<PipeInput<T>, Exclude<PipeOutput<T>, undefined>>(
		(input) => branch.parse(input !== undefined ? input : runDefault(def)) as any,
		{ [optionalTag]: true },
		() => ({ ...branch.toJsonSchema(), default: runDefault(def) }),
	)

export const defaultsOnFail = <T extends Pipe<any, any, object>>(branch: T, def: FunctionOrValue<PipeInput<T>>) =>
	makePipe<PipeInput<T>, PipeOutput<T>>(
		(input) => {
			const validity = branch.safeParse(input)
			if (validity.valid) return validity.value
			return runDefault(def)
		},
		{ [optionalTag]: true },
		() => ({ ...branch.toJsonSchema(), default: runDefault(def) }),
	)
