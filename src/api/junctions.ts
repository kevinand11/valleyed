import { Pipe, PipeInput, PipeOutput } from './base'
import { merge as differMerge } from '../utils/differ'
import { getRandomValue, wrapInTryCatch } from '../utils/functions'
import { compileNested, context, standard, schema, define, validate } from './base/pipes'

export const or = <T extends Pipe<any, any>[]>(branches: T) => {
	const validatedVarname = `validated_${getRandomValue()}`
	const errorsVarname = `errors_${getRandomValue()}`
	return standard<PipeInput<T[number]>, PipeOutput<T[number]>>(
		({ input }, opts) =>
			branches.length === 0
				? []
				: [
						`const ${errorsVarname} = []`,
						`let ${validatedVarname}`,
						...branches
							.map((branch, idx) => (lines: string[]) => [
								`${validatedVarname} = ${input}`,
								...compileNested({
									opts: { ...opts, failEarly: true },
									pipe: branch,
									input: validatedVarname,
									errorType: 'assign',
								}),
								`if (${validatedVarname} instanceof PipeError) {`,
								`	${errorsVarname}.push(PipeError.path(${idx}, ${validatedVarname}))`,
								...lines.map((l) => `	${l}`),
								idx === branches.length - 1 ? `	${opts.wrapError.format(`PipeError.rootFrom(${errorsVarname})`)}` : '',
								`}`,
								`else ${input} = ${validatedVarname}`,
							])
							.reduceRight<string[]>((acc, cur) => cur(acc), []),
						opts.wrapError(`${input} instanceof PipeError`, input),
					],
		{
			schema: () => ({ oneOf: branches.map((branch) => schema(branch)) }),
		},
	)
}

export const merge = <T1 extends Pipe<any, any>, T2 extends Pipe<any, any>>(branch1: T1, branch2: T2) => {
	const inputVarname = `input_${getRandomValue()}`
	return standard<PipeInput<T1> & PipeInput<T2>, PipeOutput<T1> & PipeOutput<T2>>(
		({ input, context }, opts) => [
			`let ${inputVarname}A = ${input}`,
			`let ${inputVarname}B = ${input}`,
			...compileNested({ opts, pipe: branch1, input: `${inputVarname}A` }),
			opts.wrapError(`${inputVarname}A instanceof PipeError`, `${inputVarname}A`),
			...compileNested({ opts, pipe: branch2, input: `${inputVarname}B` }),
			opts.wrapError(`${inputVarname}B instanceof PipeError`, `${inputVarname}B`),
			`${input} = ${context}.differMerge(${inputVarname}A, ${inputVarname}B)`,
		],
		{
			context: { differMerge },
			schema: () => ({ allOf: [schema(branch1), schema(branch2)] }),
		},
	)
}

export const discriminate = <T extends Record<PropertyKey, Pipe<any, any>>>(
	discriminator: (val: PipeInput<T[keyof T]>) => PropertyKey,
	branches: T,
	err = 'doesnt match any of the schema',
) =>
	standard<PipeInput<T[keyof T]>, PipeOutput<T[keyof T]>>(
		({ input, context, path }, opts) => [
			`switch (${context}.wrapInTryCatch(() => ${context}.discriminator(${input}))) {`,
			...Object.entries(branches).flatMap(([key, branch]) => [
				`	case ('${key}'): {`,
				...compileNested({ opts, pipe: branch, input }).map((l) => `		${l}`),
				`		break`,
				`	}`,
			]),
			`	default: ${opts.wrapError.format(`PipeError.root("${err}", ${input}, ${path})`)}`,
			`}`,
		],
		{
			context: { wrapInTryCatch, discriminator },
			schema: () => ({ oneOf: Object.values(branches).map((s) => schema(s)) }),
		},
	)

export const fromJson = <T extends Pipe<any, any>>(branch: T) => {
	const validatedVarname = `validated_${getRandomValue()}`
	return standard<PipeInput<T>, PipeOutput<T>>(
		({ input, context }, opts) => [
			`let ${validatedVarname} = ${input}`,
			...compileNested({ opts, pipe: branch, input: validatedVarname, errorType: 'assign' }),
			`if (${validatedVarname} instanceof PipeError) {`,
			opts.wrapError(`${input}?.constructor?.name !== 'String'`, validatedVarname),
			`	${validatedVarname} = ${context}.wrapInTryCatch(() => JSON.parse(${input}), ${validatedVarname})`,
			opts.wrapError(`${validatedVarname} instanceof PipeError`, validatedVarname),
			...compileNested({ opts, pipe: branch, input: validatedVarname, errorType: 'assign' }).map((l) => `	${l}`),
			opts.wrapError(`${validatedVarname} instanceof PipeError`, validatedVarname),
			`}`,
			`${input} = ${validatedVarname}`,
		],
		{
			context: { ...context(branch), wrapInTryCatch },
			schema: branch.schema,
		},
	)
}

export const lazy = <T extends Pipe<any, any>>(pipeFn: () => T) =>
	define(
		(input) => {
			const result = validate(pipeFn(), input)
			return result.valid ? result.value : result
		},
		{
			schema: () => schema(pipeFn()),
		},
	)

export const recursive = <T extends Pipe<any, any>>(pipeFn: () => T, $refId: string) => {
	const fnVarname = `fn_${getRandomValue()}`
	let compiledBefore = false
	let schemedBefore = false
	return standard<PipeInput<T>, PipeOutput<T>>(
		({ input }, opts) => {
			const common = [`${input} = ${fnVarname}(${input})`, opts.wrapError(`${input} instanceof PipeError`, input)]
			if (compiledBefore) return common
			compiledBefore = true
			return [
				`function ${fnVarname}(node) {`,
				...compileNested({ opts: { ...opts, failEarly: true }, pipe: pipeFn(), input: 'node', errorType: 'return' }).map(
					(l) => `	${l}`,
				),
				'}',
				...common,
			]
		},
		{
			schema: () => {
				if (schemedBefore) return { $refId }
				schemedBefore = true
				return schema(pipeFn(), { $refId })
			},
		},
	)
}
