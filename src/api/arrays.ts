import { PipeError, PipeInput, type Pipe, type PipeOutput } from './base'
import { standard, schema, validate, compileToValidate, compileToAssert } from './base/pipes'
import { getRandomValue } from '../utils/functions'

export const array = <T extends Pipe<any, any>>(branch: T, err = 'is not an array') => {
	const errorsVarname = `errors_${getRandomValue()}`
	const resVarname = `res_${getRandomValue()}`
	return standard<PipeInput<T>[], PipeOutput<T>[]>(
		({ input, context }, rootContext, failEarly) => [
			`if (!Array.isArray(${input})) throw ${context}.PipeError.root('${err}', ${input})`,
			failEarly ? '' : `const ${errorsVarname} = []`,
			`const ${resVarname} = ${input}.map((i, idx) => {`,
			...(failEarly
				? compileToAssert({ pipe: branch, rootContext, input: 'i', context, prefix: `return `, failEarly }).map((l) => `\t${l}`)
				: [
						...compileToValidate({
							pipe: branch,
							rootContext,
							input: 'i',
							context,
							prefix: `const validity = `,
							failEarly,
						}).map((l) => `\t${l}`),
						`	if (validity.valid) return validity.value`,
						`	${errorsVarname}.push(${context}.PipeError.path(idx, validity.error, i))`,
					]),
			`})`,
			failEarly ? '' : `if (${errorsVarname}.length) throw ${context}.PipeError.rootFrom(${errorsVarname}, ${input})`,
			`${input} = ${resVarname}`,
		],
		{
			context: { PipeError },
			schema: () => ({ type: 'array', items: schema(branch) }),
		},
	)
}

export const tuple = <T extends ReadonlyArray<Pipe<any, any>>>(branches: readonly [...T], err = 'is not an array') => {
	const errorsVarname = `errors_${getRandomValue()}`
	const resVarname = `res_${getRandomValue()}`
	const validityVarname = `validity_${getRandomValue()}`
	return standard<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }>(
		({ input, context }, rootContext, failEarly) => [
			`if (!Array.isArray(${input})) throw ${context}.PipeError.root('${err}', ${input})`,
			...(branches.length === 0
				? []
				: [
						`const ${resVarname} = []`,
						failEarly ? '' : `const ${errorsVarname} = []`,
						...branches.flatMap((branch, idx) =>
							failEarly
								? compileToAssert({
										pipe: branch,
										rootContext,
										input: `${input}[${idx}]`,
										context,
										prefix: `${resVarname}[${idx}] = `,
										failEarly,
									})
								: [
										...compileToValidate({
											pipe: branch,
											rootContext,
											input: `${input}[${idx}]`,
											context,
											prefix: `const ${validityVarname}${idx} = `,
											failEarly,
										}),
										`if (${validityVarname}${idx}.valid) ${resVarname}.push(${validityVarname}${idx}.value)`,
										`else ${errorsVarname}.push(${context}.PipeError.path(${idx}, ${validityVarname}${idx}.error, ${input}[${idx}]))`,
									],
						),
						failEarly ? `` : `if (${errorsVarname}.length) throw ${context}.PipeError.rootFrom(${errorsVarname}, ${input})`,
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
