import { PipeError, PipeInput, type Pipe, type PipeOutput } from './base'
import { standard, schema, validate, compileToValidate } from './base/pipes'
import { getRandomValue } from '../utils/functions'

export const array = <T extends Pipe<any, any>>(branch: T, err = 'is not an array') => {
	const hasErrorVarname = `hasError_${getRandomValue()}`
	const resVarname = `res_${getRandomValue()}`
	return standard<PipeInput<T>[], PipeOutput<T>[]>(
		({ input, context }, rootContext) => [
			`if (!Array.isArray(${input})) throw ${context}.PipeError.root('${err}', ${input})`,
			`let ${hasErrorVarname} = false`,
			`const ${resVarname} = ${input}.map((i, idx) => {`,
			...compileToValidate(branch, rootContext, 'i', context, `const validity = `).map((l) => `\t${l}`),
			`	if (validity.valid) return validity.value`,
			`	${hasErrorVarname} = true`,
			`	return ${context}.PipeError.path(idx, validity.error, i)`,
			`})`,
			`if (${hasErrorVarname}) throw ${context}.PipeError.rootFrom(${resVarname}.filter((r) => r instanceof ${context}.PipeError), ${input})`,
			`${input} = ${resVarname}`,
		],
		{
			context: { PipeError },
			schema: () => ({ type: 'array', items: schema(branch) }),
		},
	)
}

export const tuple = <T extends ReadonlyArray<Pipe<any, any>>>(branches: readonly [...T], err = 'is not an array') => {
	const hasErrorVarname = `hasError_${getRandomValue()}`
	const resVarname = `res_${getRandomValue()}`
	const validityVarname = `validity_${getRandomValue()}`
	return standard<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }>(
		({ input, context }, rootContext) => [
			`if (!Array.isArray(${input})) throw ${context}.PipeError.root('${err}', ${input})`,
			...(branches.length === 0
				? []
				: [
						`const ${resVarname} = []`,
						`let ${hasErrorVarname} = false`,
						...branches.flatMap((branch, idx) => [
							...compileToValidate(branch, rootContext, `${input}[${idx}]`, context, `const ${validityVarname}${idx} = `),
							`if (${validityVarname}${idx}.valid) ${resVarname}.push(${validityVarname}${idx}.value)`,
							`else {`,
							`	${hasErrorVarname} = true`,
							`	${resVarname}.push(${context}.PipeError.path(${idx}, ${validityVarname}${idx}.error, ${input}[${idx}]))`,
							`}`,
						]),
						`if (${hasErrorVarname}) throw ${context}.PipeError.rootFrom(${resVarname}.filter((r) => r instanceof ${context}.PipeError), ${input})`,
						`${input} = ${resVarname}`,
					]),
		],
		{
			context: { PipeError, validate },
			schema: () => ({
				type: 'array',
				items: branches.map((pipe) => schema(pipe)),
				minItems: branches.length,
				maxItems: branches.length,
			}),
		},
	)
}

export const asSet = <T>(keyFn: (i: T) => PropertyKey = (v) => v as string) => {
	const varname = `obj_${getRandomValue()}`
	return standard<T[], T[]>(
		({ input, context }) => [
			`const ${varname} = {}`,
			`${input} = ${input}.reduce((acc, cur) => {`,
			`	const key = ${context}.keyFn(cur)`,
			`	if (!${varname}[key]) {`,
			`		${varname}[key] = true`,
			`		acc.push(cur)`,
			`	}`,
			`	return acc`,
			`}, [])`,
		],
		{
			context: { keyFn },
		},
	)
}
