import { Pipe, PipeInput, PipeOutput } from './base'
import { merge as differMerge } from '../utils/differ'
import { getRandomValue, wrapInTryCatch } from '../utils/functions'
import { compileNested, context, standard, schema, define, validate } from './base/pipes'

export const or = <T extends Pipe<any, any>[]>(branches: T) => {
	const errorsVarname = `errors_${getRandomValue()}`
	const fnVarname = `fn_${getRandomValue()}`
	return standard<PipeInput<T[number]>, PipeOutput<T[number]>>(
		({ input, context }, opts) =>
			branches.length === 0
				? []
				: [
						`const ${errorsVarname} = []`,
						`while (true) {`,
						`	let validated`,
						...branches.flatMap((branch, idx) => [
							...compileNested({ ...opts, pipe: branch, fn: `${fnVarname}${idx}`, context, failEarly: true }).map(
								(l) => `	${l}`,
							),
							`	validated = ${fnVarname}${idx}(${input})`,
							`	if (!(validated instanceof PipeError)) {`,
							`		${input} = validated`,
							`		break`,
							`	}`,
							`	else ${errorsVarname}.push(PipeError.path(${idx}, validated))`,
						]),
						`	return PipeError.rootFrom(${errorsVarname})`,
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
			...compileNested({ pipe: branch1, rootContext, input: `${inputVarname}A`, context }).map((l) => `	${l}`),
			`if (${inputVarname}A instanceof PipeError) return ${inputVarname}A`,
			...compileNested({ pipe: branch2, rootContext, input: `${inputVarname}B`, context }).map((l) => `	${l}`),
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
		({ input, context, path }, opts) => [
			`switch (${context}.wrapInTryCatch(() => ${context}.discriminator(${input}))) {`,
			...Object.entries(branches).flatMap(([key, branch]) => [
				`	case ('${key}'): {`,
				...compileNested({ ...opts, pipe: branch, input, context }).map((l) => `		${l}`),
				` 		if (${input} instanceof PipeError) return ${input}`,
				`		break`,
				`	}`,
			]),
			`	default: return PipeError.root("${err}", ${input}, ${path});`,
			`}`,
		],
		{
			context: { wrapInTryCatch, discriminator },
			schema: () => ({ oneOf: Object.values(branches).map((s) => schema(s)) }),
		},
	)

export const fromJson = <T extends Pipe<any, any>>(branch: T) => {
	const fnVarname = `fn_${getRandomValue()}`
	const validatedVarname = `validated_${getRandomValue()}`
	return standard<PipeInput<T>, PipeOutput<T>>(
		({ input, context }, rootContext) => [
			...compileNested({ pipe: branch, rootContext, context, fn: fnVarname }),
			`let ${validatedVarname} = ${fnVarname}(${input})`,
			`if (${validatedVarname} instanceof PipeError) {`,
			`	if (${input}?.constructor?.name !== 'String') return ${validatedVarname}`,
			`	${validatedVarname} = ${context}.wrapInTryCatch(() => JSON.parse(${input}), ${validatedVarname})`,
			`	if (${validatedVarname} instanceof PipeError) return ${validatedVarname}`,
			`	${validatedVarname} = ${fnVarname}(${validatedVarname})`,
			`	if (${validatedVarname} instanceof PipeError) return ${validatedVarname}`,
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
		({ input, context, path }, opts) => {
			const common = [`${input} = ${fnVarname}(${input})`, `if (${input} instanceof PipeError) return ${input}`]
			if (compiledBefore) return common
			compiledBefore = true
			return [...compileNested({ ...opts, pipe: pipeFn(), context, fn: fnVarname, failEarly: true, path }), ...common]
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
