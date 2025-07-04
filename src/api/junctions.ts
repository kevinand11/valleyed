import { Pipe, PipeInput, PipeOutput } from './base'
import { merge as differMerge } from '../utils/differ'
import { getRandomValue, wrapInTryCatch } from '../utils/functions'
import { compileNested, context, standard, schema, define, validate } from './base/pipes'

export const or = <T extends Pipe<any, any>[]>(branches: T) => {
	const errorsVarname = `errors_${getRandomValue()}`
	const valVarname = `val_${getRandomValue()}`
	const validatedVarname = `validated_${getRandomValue()}`
	return standard<PipeInput<T[number]>, PipeOutput<T[number]>>(
		({ input, context }, rootContext) =>
			branches.length === 0
				? []
				: [
						`const ${errorsVarname} = []`,
						`let ${valVarname}, ${validatedVarname}`,
						`while (true) {`,
						...branches.flatMap((branch, idx) => [
							`	${valVarname} = ${input}`,
							...compileNested({
								pipe: branch,
								rootContext,
								input: valVarname,
								context,
								prefix: `${validatedVarname} = `,
								failEarly: true,
							}).map((l) => `	${l}`),
							`	if (!(${validatedVarname} instanceof PipeError)) {`,
							`		${input} = ${validatedVarname}`,
							`		break`,
							`	}`,
							`	else ${errorsVarname}.push(PipeError.path(${idx}, ${validatedVarname}, ${input}))`,
						]),
						`	return PipeError.rootFrom(${errorsVarname}, ${input})`,
						`}`,
						`if (${input} instanceof PipeError) return ${input}`,
					],
		{
			schema: () => ({ oneOf: branches.map((branch) => schema(branch)) }),
		},
	)
}

export const merge = <T1 extends Pipe<any, any>, T2 extends Pipe<any, any>>(branch1: T1, branch2: T2) => {
	const inputVarname = `input_${getRandomValue()}`
	return standard<PipeInput<T1> & PipeInput<T2>, PipeOutput<T1> & PipeOutput<T2>>(
		({ input, context }, rootContext) => [
			`let ${inputVarname}A = ${input}`,
			`let ${inputVarname}B = ${input}`,
			...compileNested({ pipe: branch1, rootContext, input: `${inputVarname}A`, context, prefix: `${inputVarname}A = ` }).map(
				(l) => `	${l}`,
			),
			`if (${inputVarname}A instanceof PipeError) return ${inputVarname}A`,
			...compileNested({ pipe: branch2, rootContext, input: `${inputVarname}B`, context, prefix: `${inputVarname}B = ` }).map(
				(l) => `	${l}`,
			),
			`if (${inputVarname}B instanceof PipeError) return ${inputVarname}B`,
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
		({ input, context }, rootContext) => [
			`switch (${context}.wrapInTryCatch(() => ${context}.discriminator(${input}))) {`,
			...Object.entries(branches).flatMap(([key, branch]) => [
				`	case ('${key}'): {`,
				...compileNested({ pipe: branch, rootContext, input, context, prefix: `${input} = ` }).map((l) => `		${l}`),
				` 		if (${input} instanceof PipeError) return ${input}`,
				`		break`,
				`	}`,
			]),
			`	default: return PipeError.root("${err}", ${input});`,
			`}`,
		],
		{
			context: { wrapInTryCatch, discriminator, branches },
			schema: () => ({ oneOf: Object.values(branches).map((s) => schema(s)) }),
		},
	)

export const fromJson = <T extends Pipe<any, any>>(branch: T) => {
	const inputVarname = `inputCopy_${getRandomValue()}`
	const validatedVarname = `validated_${getRandomValue()}`
	return standard<PipeInput<T>, PipeOutput<T>>(
		({ input, context }, rootContext) => [
			`let ${inputVarname} = ${input}`,
			...compileNested({ pipe: branch, rootContext, input: inputVarname, context, prefix: `const ${validatedVarname} = ` }),
			`if (!(${validatedVarname} instanceof PipeError)) ${input} = ${validatedVarname}`,
			`else {`,
			`	if (${input}?.constructor?.name !== 'String') return ${validatedVarname}`,
			`	${inputVarname} = ${context}.wrapInTryCatch(() => JSON.parse(${input}), ${validatedVarname})`,
			`	if (${inputVarname} === ${validatedVarname}) return ${validatedVarname}`,
			...compileNested({ pipe: branch, rootContext, input: inputVarname, context, prefix: `${input} = ` }).map((l) => `	${l}`),
			`	if (${input} instanceof PipeError) return ${input}`,
			`}`,
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
	const recursiveFnVarname = `recursiveFn_${getRandomValue()}`
	let compiledBefore = false
	let schemedBefore = false
	return standard<PipeInput<T>, PipeOutput<T>>(
		({ input, context }, rootContext) => {
			const common = [`${input} = ${recursiveFnVarname}(${input})`, `if (${input} instanceof PipeError) return ${input}`]
			if (compiledBefore) return common
			compiledBefore = true
			return [
				`const ${recursiveFnVarname} = (node) => {`,
				...compileNested({ pipe: pipeFn(), rootContext, input: 'node', context, prefix: `return `, failEarly: true }).map(
					(l) => `	${l}`,
				),
				`}`,
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
