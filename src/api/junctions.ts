import { Pipe, PipeError, PipeInput, PipeOutput } from './base'
import { merge as differMerge } from '../utils/differ'
import { wrapInTryCatch } from '../utils/functions'
import { assert, compileToAssert, compileToValidate, standard, schema } from './base/pipes'

export const or = <T extends Pipe<any, any>[]>(branches: T) =>
	standard<PipeInput<T[number]>, PipeOutput<T[number]>>(
		({ input, context }, rootContext) =>
			branches.length === 0
				? input
				: `(() => {
	const errors = []
	${branches
		.map(
			(branch, idx) => `(() => {
		const validity = ${compileToValidate(branch, rootContext, input, context)}
		if (validity.valid) return validity.value
		errors.push(${context}.PipeError.path(${idx}, validity.error, ${input}))
	})()`,
		)
		.join(' || ')}
	throw ${context}.PipeError.rootFrom(errors, ${input})
})()`,
		{
			context: () => ({ PipeError }),
			schema: () => ({ oneOf: branches.map((branch) => schema(branch)) }),
		},
	)

export const and = <T extends Pipe<any, any>>(branches: T[]) =>
	standard<PipeInput<T>, PipeOutput<T>>(
		({ input, context }, rootContext) =>
			branches.length === 0
				? input
				: `(() => {
	${branches
		.map(
			(branch, idx) => `(() => {
		const validity = ${compileToValidate(branch, rootContext, input, context)}
		if (!validity.valid) throw ${context}.PipeError.path(${idx}, validity.error, ${input})
		${input} = validity.value
	})()`,
		)
		.join('\n')}
	return ${input}
})()`,
		{
			context: () => ({ PipeError }),
			schema: () => ({ allOf: branches.map((branch) => schema(branch)) }),
		},
	)

export const merge = <T1 extends Pipe<any, any>, T2 extends Pipe<any, any>>(branch1: T1, branch2: T2) =>
	standard<PipeInput<T1> & PipeInput<T2>, PipeOutput<T1> & PipeOutput<T2>>(
		({ input, context }, rootContext) => `${context}.differMerge(
	${compileToAssert(branch1, rootContext, input, context)},
	${compileToAssert(branch2, rootContext, input, context)},
)`,
		{
			context: () => ({ differMerge }),
			schema: () => ({ allOf: [schema(branch1), schema(branch2)] }),
		},
	)

export const discriminate = <T extends Record<PropertyKey, Pipe<any, any>>>(
	discriminator: (val: PipeInput<T[keyof T]>) => PropertyKey,
	branches: T,
	err = 'doesnt match any of the schema',
) =>
	standard<PipeInput<T[keyof T]>, PipeOutput<T[keyof T]>>(
		({ input, context }, rootContext) => `(() => {
	const accessor = ${context}.wrapInTryCatch(() => ${context}.discriminator(${input}))
	if (!${context}.branches[accessor]) return ${context}.PipeError.root("${err}", ${input})
	${Object.entries(branches)
		.map(([key, branch]) => `if (accessor === '${key}') return ${compileToAssert(branch, rootContext, input, context)}`)
		.join('\n')}
})()`,
		{
			context: () => ({ wrapInTryCatch, discriminator, branches }),
			schema: () => ({ oneOf: Object.values(branches).map((s) => schema(s)) }),
		},
	)

export const fromJson = <T extends Pipe<any, any>>(branch: T) =>
	standard<PipeInput<T>, PipeOutput<T>>(
		({ input, context }, rootContext) => `(() => {
	const validity = ${compileToValidate(branch, rootContext, input, context)}
	if (validity.valid) return validity.value
	if (${input}?.constructor?.name !== 'String') throw validity.error
	const parsed = ${context}.wrapInTryCatch(() => JSON.parse(${input}), validity.error)
	if (parsed === validity.error) throw validity.error
	return ${compileToAssert(branch, rootContext, input, context)}
})()`,
		{
			context: () => ({ ...branch.context(), wrapInTryCatch }),
			schema: branch.schema,
		},
	)

export const lazy = <T extends Pipe<any, any>>(pipeFn: () => T) =>
	standard<PipeInput<T>, PipeOutput<T>>(({ input, context }, rootContext) => compileToAssert(pipeFn(), rootContext, input, context), {
		schema: () => schema(pipeFn()),
	})

export const recursive = <T extends Pipe<any, any>, R = T>(pipeFn: (root: R) => T, id: string) => {
	const root = standard((input) => assert(pipeFn(root), input), {
		schema: () => ({ $refId: id }),
	})
	// TODO: will probably cause recursive errors
	return standard<PipeInput<T>, PipeOutput<T>>(({ input, context }, rootContext) => compileToAssert(root, rootContext, input, context), {
		schema: () => schema(pipeFn(root), { $refId: id }),
	})
}
