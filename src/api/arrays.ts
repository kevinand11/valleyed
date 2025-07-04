import { PipeInput, type Pipe, type PipeOutput } from './base'
import { standard, schema, compileNested } from './base/pipes'
import { getRandomValue } from '../utils/functions'

export const array = <T extends Pipe<any, any>>(branch: T, err = 'is not an array') => {
	const errorsVarname = `errors_${getRandomValue()}`
	const resVarname = `res_${getRandomValue()}`
	const idxVarname = `i_${getRandomValue()}`
	const fnVarname = `fn_${getRandomValue()}`
	return standard<PipeInput<T>[], PipeOutput<T>[]>(
		({ input, context }, rootContext, { failEarly }) => [
			`if (!Array.isArray(${input})) return PipeError.root('${err}', ${input})`,
			failEarly ? '' : `const ${errorsVarname} = []`,
			`const ${resVarname} = []`,
			`let ${idxVarname}`,
			...compileNested({
				pipe: branch,
				rootContext,
				input: idxVarname,
				context,
				prefix: `const ${fnVarname} = `,
				failEarly,
				asFn: true,
			}),
			`for (let idx = 0; idx < ${input}.length; idx++) {`,
			`	${idxVarname} = ${input}[idx]`,
			`	const validated = ${fnVarname}()`,
			`	if (!(validated instanceof PipeError)) ${resVarname}.push(validated)`,
			failEarly
				? `	else return PipeError.path(idx, validated, ${idxVarname})`
				: `	else ${errorsVarname}.push(PipeError.path(idx, validated, ${idxVarname}))`,
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
