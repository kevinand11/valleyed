import { PipeError } from './base'
import { define, standard } from './base/pipes'
import { equal } from '../utils/differ'
import { execValueFunction, ValueFunction } from '../utils/functions'

export const custom = <T>(condition: (input: T) => boolean, err = `doesn't pass custom rule`) =>
	define<T, T>(
		(input) => {
			if (condition(input)) return input
			throw PipeError.root(err, input)
		},
		{
			context: { custom: condition, PipeError },
		},
	)

export const eq = <T>(compare: ValueFunction<T>, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (!${context}.equal(${input}, ${context}.execValueFunction(${context}.eq))) throw ${context}.PipeError.root(\`${err ?? `is not equal to \${${context}.execValueFunction(${context}.eq)}`}\`, ${input})`,
		],
		{
			context: { eq: compare, execValueFunction, equal, PipeError },
			schema: (context) => ({ const: execValueFunction(context.eq ?? compare) }),
		},
	)

export const is = eq

export const ne = <T>(compare: ValueFunction<T>, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${context}.equal(${input}, ${context}.execValueFunction(${context}.ne))) throw ${context}.PipeError.root(\`${err ?? `is equal to \${${context}.execValueFunction(${context}.ne)}`}\`, ${input})`,
		],
		{
			context: { ne: compare, execValueFunction, equal, PipeError },
			schema: (context) => ({ not: { const: execValueFunction(context.eq ?? compare) } }),
		},
	)

const inArray = <T>(array: ValueFunction<Readonly<T[]>>, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (!${context}.execValueFunction(${context}.in).find((x) => ${context}.equal(${input}, x))) throw ${context}.PipeError.root(\`${err ?? `is not in the list: [\${${context}.execValueFunction(${context}.in)}]`}\`, ${input})`,
		],
		{
			context: { in: array, execValueFunction, equal, PipeError },
			schema: (context) => ({ enum: [...execValueFunction(context.in ?? array)] }),
		},
	)

export const nin = <T>(array: ValueFunction<Readonly<T[]>>, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${context}.execValueFunction(${context}.nin).find((x) => ${context}.equal(${input}, x))) throw ${context}.PipeError.root(\`${err ?? `is in the list: [\${${context}.execValueFunction(${context}.nin)}]`}\`, ${input})`,
		],
		{
			context: { nin: array, execValueFunction, equal, PipeError },
			schema: (context) => ({ not: { enum: [...execValueFunction(context.nin ?? array)] } }),
		},
	)

function itemType(input: unknown) {
	return input?.constructor?.name === 'String' ? 'characters' : 'items'
}

export const has = <T extends { length: number }>(length: ValueFunction<number>, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${input}.length !== ${context}.execValueFunction(${context}.has)) throw ${context}.PipeError.root(\`${err ?? `must contain \${${context}.execValueFunction(${context}.has)} \${${context}.itemType(${input})}`}\`, ${input})`,
		],
		{
			context: { has: length, execValueFunction, itemType, PipeError },
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
	standard<T, T>(
		({ input, context }) => [
			`if (${input}.length < ${context}.execValueFunction(${context}.min)) throw ${context}.PipeError.root(\`${err ?? `must contain \${${context}.execValueFunction(${context}.min)} or more \${${context}.itemType(${input})}`}\`, ${input})`,
		],
		{
			context: { min: length, execValueFunction, PipeError, itemType },
			schema: (context) => {
				const val = execValueFunction(context.min ?? length)
				return { minItems: val, minLength: val }
			},
		},
	)

export const max = <T extends { length: number }>(length: ValueFunction<number>, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${input}.length > ${context}.execValueFunction(${context}.max)) throw ${context}.PipeError.root(\`${err ?? `must contain \${${context}.execValueFunction(${context}.max)} or less \${${context}.itemType(${input})}`}\`, ${input})`,
		],
		{
			context: { max: length, execValueFunction, PipeError, itemType },
			schema: (context) => {
				const val = execValueFunction(context.min ?? length)
				return { maxItems: val, maxLength: val }
			},
		},
	)

export { inArray as in }
