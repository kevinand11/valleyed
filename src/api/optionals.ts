import { pipe, Pipe, PipeInput, PipeOutput } from './base'
import { DeepPartial } from '../utils/types'

const partial = <T extends Pipe<any, any>, P>(
	branch: T,
	partialCondition: (i: unknown) => boolean,
	force: boolean,
	config?: Parameters<typeof pipe>[1],
) =>
	pipe<PipeInput<T> | P, PipeOutput<T> | P>((input) => {
		const isPartial = partialCondition(input)
		if (isPartial) return input as P
		const validity = branch.safeParse(input)
		if (validity.valid) return validity.value as PipeOutput<T>
		if (force) throw validity.error
		return input as P
	}, config)

export const nullable = <T extends Pipe<any, any>>(branch: T) =>
	partial<T, null>(branch, (i) => i === null, true, {
		schema: () => {
			const branchSchema = branch.toJsonSchema()
			const type = branchSchema.type
			const newType = Array.isArray(type) ? type : type ? [type] : []
			if (!newType.includes('null')) newType.push('null')
			return { ...branchSchema, type: newType }
		},
	})

export const optional = <T extends Pipe<any, any>>(branch: T) =>
	partial<T, undefined>(branch, (i) => i === undefined, true, {
		schema: () => branch.toJsonSchema(),
		context: { optional: true },
	})

export const nullish = <T extends Pipe<any, any>>(branch: T) =>
	partial<T, null | undefined>(branch, (i) => i === null || i === undefined, true, {
		schema: () => {
			const branchSchema = branch.toJsonSchema()
			const type = branchSchema.type
			const newType = Array.isArray(type) ? type : type ? [type] : []
			if (!newType.includes('null')) newType.push('null')
			return { ...branchSchema, type: newType }
		},
		context: { optional: true },
	})

export const requiredIf = <T extends Pipe<any, any>>(branch: T, condition: () => boolean) =>
	partial<T, undefined>(branch, () => !condition(), condition(), {
		schema: () => branch.toJsonSchema(),
		context: { optional: true },
	})

type FunctionOrValue<T> = T | (() => T) | undefined
type DefaultValue<T> = FunctionOrValue<T extends object ? DeepPartial<T> : T>

function runDefault<T>(def: DefaultValue<T>): T {
	return typeof def === 'function' ? (def as Function)() : (def as any)
}

export const defaults = <T extends Pipe<any, any>>(branch: T, def: DefaultValue<PipeInput<T>>) =>
	pipe<PipeInput<T>, Exclude<PipeOutput<T>, undefined>>((input) => branch.parse(input !== undefined ? input : runDefault(def)) as any, {
		schema: () => ({ ...branch.toJsonSchema(), default: runDefault(def) }),
		context: { optional: true },
	})

export const defaultsOnFail = <T extends Pipe<any, any>>(branch: T, def: DefaultValue<PipeInput<T>>) =>
	pipe<PipeInput<T>, PipeOutput<T>>(
		(input) => {
			const validity = branch.safeParse(input)
			if (validity.valid) return validity.value
			return runDefault(def)
		},
		{
			schema: () => ({ ...branch.toJsonSchema(), default: runDefault(def) }),
			context: { optional: true },
		},
	)
