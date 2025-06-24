import { pipe, PipeError } from './base'
import { equal } from '../utils/differ'
import { execValueFunction, ValueFunction } from '../utils/functions'

export const custom = <T>(condition: (input: T) => boolean, err = `doesn't pass custom rule`) =>
	pipe<T, T, any>((input) => {
		if (condition(input)) return input as T
		throw PipeError.root(err, input)
	}, {})

export const eq = <T>(compare: ValueFunction<T>, err?: string) =>
	pipe<T, T, any>(
		(input, context) => {
			const comp = execValueFunction(context.eq ?? compare)
			if (input === comp || equal(input, comp)) return input as T
			throw PipeError.root(err ?? `is not equal to ${comp}`, input)
		},
		{ context: () => ({ eq: compare }), schema: (context) => ({ const: execValueFunction(context.eq ?? compare) }) },
	)

export const is = eq

export const ne = <T>(compare: ValueFunction<T>, err?: string) =>
	pipe<T, T, any>(
		(input, context) => {
			const comp = execValueFunction(context.eq ?? compare)
			if (!equal(input, comp) && input !== comp) return input as T
			throw PipeError.root(err ?? `is equal to ${comp}`, input)
		},
		{ context: () => ({ ne: compare }), schema: (context) => ({ not: { const: execValueFunction(context.eq ?? compare) } }) },
	)

const inArray = <T>(array: ValueFunction<Readonly<T[]>>, err?: string) =>
	pipe<T, T, any>(
		(input, context) => {
			const arr = execValueFunction(context.in ?? array)
			if (arr.find((x) => equal(input, x))) return input as T
			throw PipeError.root(err ?? `is not in the list: [${arr.join(',')}]`, input)
		},
		{ context: () => ({ in: array }), schema: (context) => ({ enum: [...execValueFunction(context.in ?? array)] }) },
	)

export const nin = <T>(array: ValueFunction<Readonly<T[]>>, err?: string) =>
	pipe<T, T, any>(
		(input, context) => {
			const arr = execValueFunction(context.nin ?? array)
			if (!arr.find((x) => equal(input, x))) return input as T
			throw PipeError.root(err ?? `is in the list: [${arr.join(',')}]`, input)
		},
		{ context: () => ({ nin: array }), schema: (context) => ({ not: { enum: [...execValueFunction(context.nin ?? array)] } }) },
	)

function itemType(input: unknown) {
	return input?.constructor?.name === 'String' ? 'characters' : 'items'
}

export const has = <T extends { length: number }>(length: ValueFunction<number>, err?: string) =>
	pipe<T, T, any>(
		(input, context) => {
			if (input.length === execValueFunction(context.has ?? length)) return input
			throw PipeError.root(err ?? `must contain ${length} ${itemType(input)}`, input)
		},
		{
			context: () => ({ has: length }),
			schema: (context) => {
				const val = execValueFunction(context.has ?? length)
				return {
					minItems: val,
					maxItems: val,
					minLength: val,
					maxLength: val,
				}
			},
		},
	)

export const min = <T extends { length: number }>(length: ValueFunction<number>, err?: string) =>
	pipe<T, T, any>(
		(input, context) => {
			const len = execValueFunction(context.min ?? length)
			if (input.length >= len) return input
			throw PipeError.root(err ?? `must contain ${len} or more ${itemType(input)}`, input)
		},
		{
			context: () => ({ min: length }),
			schema: (context) => {
				const val = execValueFunction(context.min ?? length)
				return { minItems: val, minLength: val }
			},
		},
	)

export const max = <T extends { length: number }>(length: ValueFunction<number>, err?: string) =>
	pipe<T, T, any>(
		(input, context) => {
			const len = execValueFunction(context.max ?? length)
			if (input.length <= len) return input
			throw PipeError.root(err ?? `must contain ${len} or less ${itemType(input)}`, input)
		},
		{
			context: () => ({ max: length }),
			schema: (context) => {
				const val = execValueFunction(context.min ?? length)
				return { maxItems: val, maxLength: val }
			},
		},
	)

export { inArray as in }
