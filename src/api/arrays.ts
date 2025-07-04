import { PipeInput, type Pipe, type PipeOutput } from './base'
import { standard, schema, compileNested } from './base/pipes'
import { getRandomValue } from '../utils/functions'

export const array = <T extends Pipe<any, any>>(branch: T, err = 'is not an array') => {
	const errorsVarname = `errors_${getRandomValue()}`
	const resVarname = `res_${getRandomValue()}`
	const idxVarname = `i_${getRandomValue()}`
	return standard<PipeInput<T>[], PipeOutput<T>[]>(
		({ input, context }, rootContext, { failEarly }) => [
			`if (!Array.isArray(${input})) return PipeError.root('${err}', ${input})`,
			failEarly ? '' : `const ${errorsVarname} = []`,
			`const ${resVarname} = []`,
			`for (const idx in ${input}) {`,
			`	let ${idxVarname} = ${input}[idx]`,
			...[
				...compileNested({
					pipe: branch,
					rootContext,
					input: idxVarname,
					context,
					prefix: `const validated = `,
					failEarly,
				}).map((l) => `\t${l}`),
				`	if (!(validated instanceof PipeError)) ${resVarname}.push(validated)`,
				failEarly ? `	else return validated` : `	else ${errorsVarname}.push(PipeError.path(idx, validated, ${idxVarname}))`,
			],
			`}`,
			failEarly ? '' : `if (${errorsVarname}.length) return PipeError.rootFrom(${errorsVarname}, ${input})`,
			`${input} = ${resVarname}`,
		],
		{
			schema: () => ({ type: 'array', items: schema(branch) }),
		},
	)
}

export const tuple = <T extends ReadonlyArray<Pipe<any, any>>>(branches: readonly [...T], err = 'is not an array') => {
	const errorsVarname = `errors_${getRandomValue()}`
	const resVarname = `res_${getRandomValue()}`
	const validatedVarname = `validated_${getRandomValue()}`
	return standard<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }>(
		({ input, context }, rootContext, { failEarly }) => [
			`if (!Array.isArray(${input})) return PipeError.root('${err}', ${input})`,
			...(branches.length === 0
				? []
				: [
						`const ${resVarname} = []`,
						failEarly ? '' : `const ${errorsVarname} = []`,
						...branches.flatMap((branch, idx) => [
							...compileNested({
								pipe: branch,
								rootContext,
								input: `${input}[${idx}]`,
								context,
								prefix: `const ${validatedVarname}${idx} = `,
								failEarly,
							}),
							`if (!(${validatedVarname}${idx} instanceof PipeError)) ${resVarname}.push(${validatedVarname}${idx})`,
							failEarly
								? `else return ${validatedVarname}${idx}`
								: `else ${errorsVarname}.push(PipeError.path(${idx}, ${validatedVarname}${idx}, ${input}[${idx}]))`,
						]),
						failEarly ? `` : `if (${errorsVarname}.length) return PipeError.rootFrom(${errorsVarname}, ${input})`,
						`${input} = ${resVarname}`,
					]),
		],
		{
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
