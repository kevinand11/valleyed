import { PipeInput, type Pipe, type PipeOutput } from './base'
import { standard, schema, compileNested } from './base/pipes'
import { getRandomValue } from '../utils/functions'

export const array = <T extends Pipe<any, any>>(branch: T, err = 'is not an array') => {
	const errorsVarname = `errors_${getRandomValue()}`
	const resVarname = `res_${getRandomValue()}`
	const fnVarname = `fn_${getRandomValue()}`
	return standard<PipeInput<T>[], PipeOutput<T>[]>(
		({ input, context, path }, opts) => [
			`if (!Array.isArray(${input})) return PipeError.root('${err}', ${input}, ${path})`,
			opts.failEarly ? '' : `const ${errorsVarname} = []`,
			`const ${resVarname} = []`,
			...compileNested({ ...opts, pipe: branch, context, fn: fnVarname }),
			`for (let idx = 0; idx < ${input}.length; idx++) {`,
			`	const validated = ${fnVarname}(${input}[idx])`,
			`	if (!(validated instanceof PipeError)) ${resVarname}.push(validated)`,
			opts.failEarly ? `	else return PipeError.path(idx, validated)` : `	else ${errorsVarname}.push(PipeError.path(idx, validated))`,
			`}`,
			opts.failEarly ? '' : `if (${errorsVarname}.length) return PipeError.rootFrom(${errorsVarname})`,
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
		({ input, context, path }, opts) => [
			`if (!Array.isArray(${input})) return PipeError.root('${err}', ${input}, ${path})`,
			...(branches.length === 0
				? []
				: [
						`const ${resVarname} = []`,
						opts.failEarly ? '' : `const ${errorsVarname} = []`,
						...branches.flatMap((branch, idx) => [
							`let ${validatedVarname}${idx} = ${input}[${idx}]`,
							...compileNested({ ...opts, pipe: branch, input: `${validatedVarname}${idx}`, context, key: `${idx}` }),
							`if (!(${validatedVarname}${idx} instanceof PipeError)) ${resVarname}.push(${validatedVarname}${idx})`,
							opts.failEarly
								? `else return ${validatedVarname}${idx}`
								: `else ${errorsVarname}.push(${validatedVarname}${idx})`,
						]),
						opts.failEarly ? `` : `if (${errorsVarname}.length) return PipeError.rootFrom(${errorsVarname})`,
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
