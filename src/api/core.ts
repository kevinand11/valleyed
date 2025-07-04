import { PipeError } from './base'
import { define, standard } from './base/pipes'
import { equal } from '../utils/differ'

export const custom = <T>(condition: (input: T) => boolean, err = `doesn't pass custom rule`) =>
	define<T, T>(
		(input) => {
			if (condition(input)) return input
			return PipeError.root(err, input)
		},
		{
			context: { custom: condition },
		},
	)

export const eq = <T>(compare: T, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${input} !== ${context}.eq && !${context}.equal(${input}, ${context}.eq)) return PipeError.root(\`${err ?? `is not equal to \${${context}.eq}`}\`, ${input})`,
		],
		{
			context: { eq: compare, equal },
			schema: (context) => ({ const: context.eq ?? compare }),
		},
	)

export const is = eq

export const ne = <T>(compare: T, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${input} === ${context}.ne || ${context}.equal(${input}, ${context}.ne)) return PipeError.root(\`${err ?? `is equal to \${${context}.ne}`}\`, ${input})`,
		],
		{
			context: { ne: compare, equal },
			schema: (context) => ({ not: { const: context.eq ?? compare } }),
		},
	)

const inArray = <T>(array: Readonly<T[]>, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (!${context}.in.some((x) => ${input} === x || ${context}.equal(${input}, x))) return PipeError.root(\`${err ?? `is not in the list: [\${${context}.in}]`}\`, ${input})`,
		],
		{
			context: { in: array, equal },
			schema: (context) => ({ enum: [...(context.in ?? array)] }),
		},
	)

export const nin = <T>(array: Readonly<T[]>, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${context}.nin.some((x) => ${input} === x || ${context}.equal(${input}, x))) return PipeError.root(\`${err ?? `is in the list: [\${${context}.nin}]`}\`, ${input})`,
		],
		{
			context: { nin: array, equal },
			schema: (context) => ({ not: { enum: [...(context.nin ?? array)] } }),
		},
	)

function itemType(input: unknown) {
	return input?.constructor?.name === 'String' ? 'characters' : 'items'
}

export const has = <T extends { length: number }>(length: number, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${input}.length !== ${context}.has) return PipeError.root(\`${err ?? `must contain \${${context}.has} \${${context}.itemType(${input})}`}\`, ${input})`,
		],
		{
			context: { has: length, itemType },
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
			`if (${input}.length < ${context}.min) return PipeError.root(\`${err ?? `must contain \${${context}.min} or more \${${context}.itemType(${input})}`}\`, ${input})`,
		],
		{
			context: { min: length, itemType },
			schema: (context) => {
				const val = context.min ?? length
				return { minItems: val, minLength: val }
			},
		},
	)

export const max = <T extends { length: number }>(length: number, err?: string) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${input}.length > ${context}.max) return PipeError.root(\`${err ?? `must contain \${${context}.max} or less \${${context}.itemType(${input})}`}\`, ${input})`,
		],
		{
			context: { max: length, itemType },
			schema: (context) => {
				const val = context.min ?? length
				return { maxItems: val, maxLength: val }
			},
		},
	)

export { inArray as in }
