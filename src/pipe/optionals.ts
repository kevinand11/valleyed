import { makePipe, Pipe, PipeInput, PipeOutput } from './base'

const partial = <T extends Pipe<unknown, unknown>, P>(branch: T, partialCondition: (i: unknown) => boolean, force: boolean) =>
	makePipe<PipeInput<T>, PipeOutput<T> | P>((input) => {
		const isPartial = partialCondition(input)
		if (isPartial) return input as P
		const value = branch.safeParse(input)
		if ('value' in value) return value.value as PipeOutput<T>
		if (force) throw value.error
		return input as P
	})

export const nullable = <T extends Pipe<unknown, unknown>>(branch: T) => partial<T, null>(branch, (i) => i === null, true)
export const optional = <T extends Pipe<unknown, unknown>>(branch: T) => partial<T, undefined>(branch, (i) => i === undefined, true)
export const requiredIf = <T extends Pipe<unknown, unknown>>(branch: T, condition: () => boolean) =>
	partial<T, undefined>(branch, () => !condition(), condition())

type FunctionOrValue<T> = T | (() => T)

export const withDefault = <T extends Pipe<unknown, unknown>>(branch: T, def: FunctionOrValue<PipeInput<T>>) =>
	makePipe<PipeInput<T>, Exclude<PipeOutput<T>, undefined>>((input) => {
		const value = input !== undefined ? input : typeof def === 'function' ? (def as Function)() : def
		return branch.parse(value) as any
	})
