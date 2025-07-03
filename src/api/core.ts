import { PipeError } from './base'
import { define, standard } from './base/pipes'
import { equal } from '../utils/differ'

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

export const eq = <T>(compare: T, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (!${context}.equal(${input}, ${context}.eq)) throw ${context}.PipeError.root(\`${err ?? `is not equal to \${${context}.eq}`}\`, ${input})`,
		],
		{
			context: { eq: compare, equal, PipeError },
			schema: (context) => ({ const: context.eq ?? compare }),
		},
	)

export const is = eq

export const ne = <T>(compare: T, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${context}.equal(${input}, ${context}.ne)) throw ${context}.PipeError.root(\`${err ?? `is equal to \${${context}.ne}`}\`, ${input})`,
		],
		{
			context: { ne: compare, equal, PipeError },
			schema: (context) => ({ not: { const: context.eq ?? compare } }),
		},
	)

const inArray = <T>(array: Readonly<T[]>, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (!${context}.in.find((x) => ${context}.equal(${input}, x))) throw ${context}.PipeError.root(\`${err ?? `is not in the list: [\${${context}.in}]`}\`, ${input})`,
		],
		{
			context: { in: array, equal, PipeError },
			schema: (context) => ({ enum: [...(context.in ?? array)] }),
		},
	)

export const nin = <T>(array: Readonly<T[]>, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${context}.nin.find((x) => ${context}.equal(${input}, x))) throw ${context}.PipeError.root(\`${err ?? `is in the list: [\${${context}.nin}]`}\`, ${input})`,
		],
		{
			context: { nin: array, equal, PipeError },
			schema: (context) => ({ not: { enum: [...(context.nin ?? array)] } }),
		},
	)

function itemType(input: unknown) {
	return input?.constructor?.name === 'String' ? 'characters' : 'items'
}

export const has = <T extends { length: number }>(length: number, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${input}.length !== ${context}.has) throw ${context}.PipeError.root(\`${err ?? `must contain \${${context}.has} \${${context}.itemType(${input})}`}\`, ${input})`,
		],
		{
			context: { has: length, itemType, PipeError },
			schema: (context) => {
				const val = context.has ?? length
				return {
					minItems: val,
					maxItems: val,
					minLength: val,
					maxLength: val,
				}
			},
		},
	)

export const min = <T extends { length: number }>(length: number, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${input}.length < ${context}.min) throw ${context}.PipeError.root(\`${err ?? `must contain \${${context}.min} or more \${${context}.itemType(${input})}`}\`, ${input})`,
		],
		{
			context: { min: length, PipeError, itemType },
			schema: (context) => {
				const val = context.min ?? length
				return { minItems: val, minLength: val }
			},
		},
	)

export const max = <T extends { length: number }>(length: number, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${input}.length > ${context}.max) throw ${context}.PipeError.root(\`${err ?? `must contain \${${context}.max} or less \${${context}.itemType(${input})}`}\`, ${input})`,
		],
		{
			context: { max: length, PipeError, itemType },
			schema: (context) => {
				const val = context.min ?? length
				return { maxItems: val, maxLength: val }
			},
		},
	)

export { inArray as in }
