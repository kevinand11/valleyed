import { Pipe, PipeError, PipeInput, PipeOutput } from './base'
import { merge as differMerge } from '../utils/differ'
import { getRandomValue, wrapInTryCatch } from '../utils/functions'
import { compileToAssert, compileToValidate, context, standard, schema } from './base/pipes'

export const or = <T extends Pipe<any, any>[]>(branches: T) => {
	const errorsVarname = `errors_${getRandomValue()}`
	const valVarname = `val_${getRandomValue()}`
	const validityVarname = `validity_${getRandomValue()}`
	return standard<PipeInput<T[number]>, PipeOutput<T[number]>>(
		({ input, context }, rootContext) =>
			branches.length === 0
				? []
				: [
						`const ${errorsVarname} = []`,
						`let ${valVarname}, ${validityVarname}`,
						`${input} = (() => {`,
						...branches.flatMap((branch, idx) => [
							`	${valVarname} = ${input}`,
							...compileToValidate(branch, rootContext, valVarname, context, `${validityVarname} = `).map((l) => `	${l}`),
							`	if (${validityVarname}.valid) return ${validityVarname}.value`,
							`	${errorsVarname}.push(${context}.PipeError.path(${idx}, ${validityVarname}.error, ${input}))`,
						]),
						`	throw ${context}.PipeError.rootFrom(${errorsVarname}, ${input})`,
						`})()`,
					],
		{
			context: { PipeError },
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
			`${input} = ${context}.differMerge(`,
			...compileToAssert(branch1, rootContext, `${inputVarname}A`, context).map((l) => `	${l}`),
			`	, `,
			...compileToAssert(branch2, rootContext, `${inputVarname}B`, context).map((l) => `	${l}`),
			`)`,
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
				...compileToAssert(branch, rootContext, input, context, `${input} = `).map((l) => `		${l}`),
				`		break`,
				`	}`,
			]),
			`	default: throw ${context}.PipeError.root("${err}", ${input});`,
			`}`,
		],
		{
			context: { wrapInTryCatch, discriminator, branches },
			schema: () => ({ oneOf: Object.values(branches).map((s) => schema(s)) }),
		},
	)

export const fromJson = <T extends Pipe<any, any>>(branch: T) => {
	const inputVarname = `inputCopy_${getRandomValue()}`
	const validityVarname = `validity_${getRandomValue()}`
	return standard<PipeInput<T>, PipeOutput<T>>(
		({ input, context }, rootContext) => [
			`let ${inputVarname} = ${input}`,
			...compileToValidate(branch, rootContext, inputVarname, context, `const ${validityVarname} = `),
			`if (${validityVarname}.valid) ${input} = ${validityVarname}.value`,
			`else {`,
			`	if (${input}?.constructor?.name !== 'String') throw ${validityVarname}.error`,
			`	${inputVarname} = ${context}.wrapInTryCatch(() => JSON.parse(${input}), ${validityVarname}.error)`,
			`	if (${inputVarname} === ${validityVarname}.error) throw ${validityVarname}.error`,
			...compileToAssert(branch, rootContext, inputVarname, context, `${input} = `).map((l) => `	${l}`),
			`}`,
		],
		{
			context: { ...context(branch), wrapInTryCatch },
			schema: branch.schema,
		},
	)
}

export const recursive = <T extends Pipe<any, any>>(pipeFn: () => T, $refId: string) => {
	const recursiveFnVarname = `recursiveFn_${getRandomValue()}`
	let compiledBefore = false
	let schemedBefore = false
	return standard<PipeInput<T>, PipeOutput<T>>(
		({ input, context }, rootContext) => {
			const common = [`${input} = ${recursiveFnVarname}(${input})`]
			if (compiledBefore) return common
			compiledBefore = true
			return [
				`const ${recursiveFnVarname} = (node) => {`,
				...compileToAssert(pipeFn(), rootContext, 'node', context, `return `).map((l) => `	${l}`),
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
