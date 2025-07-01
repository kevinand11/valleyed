import { Pipe, PipeContext, PipeError, PipeInput, PipeOutput } from './base'
import { merge as differMerge } from '../utils/differ'
import { wrapInTryCatch } from '../utils/functions'
import { assert, compileToAssert, compileToValidate, pipe, schema, validate } from './base/pipes'

export const or = <T extends Pipe<any, any, any>[]>(branches: T) =>
	pipe<PipeInput<T[number]>, PipeOutput<T[number]>, any>(
		(input) => {
			if (branches.length === 0) return input as any
			const errors: PipeError[] = []
			for (const [idx, pipe] of Object.entries(branches)) {
				const validity = validate(pipe, input)
				if (validity.valid) return validity.value
				errors.push(PipeError.path(idx, validity.error, validity.error.value))
			}
			throw PipeError.rootFrom(errors, input)
		},
		{
			compile: ({ input, context }, rootContext) =>
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
			context: () => ({ PipeError }),
			schema: () => ({ oneOf: branches.map((branch) => schema(branch)) }),
		},
	)

export const and = <T extends Pipe<any, any, any>>(branches: T[]) =>
	pipe<PipeInput<T>, PipeOutput<T>, any>(
		(input) => {
			for (const [idx, pipe] of Object.entries(branches)) {
				const validity = validate(pipe, input)
				if (!validity.valid) throw PipeError.path(idx, validity.error, input)
				input = validity.value as any
			}
			return input as any
		},
		{
			compile: ({ input, context }, rootContext) =>
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
			context: () => ({ PipeError }),
			schema: () => ({ allOf: branches.map((branch) => schema(branch)) }),
		},
	)

export const merge = <T1 extends Pipe<any, any, any>, T2 extends Pipe<any, any, any>>(branch1: T1, branch2: T2) =>
	pipe<PipeInput<T1> & PipeInput<T2>, PipeOutput<T1> & PipeOutput<T2>, any>(
		(input) => differMerge(assert(branch1, input), assert(branch2, input)),
		{
			compile: ({ input, context }, rootContext) => `${context}.differMerge(
				${compileToAssert(branch1, rootContext, input, context)},
				${compileToAssert(branch2, rootContext, input, context)},
			)`,
			context: () => ({ differMerge }),
			schema: () => ({ allOf: [schema(branch1), schema(branch2)] }),
		},
	)

export const discriminate = <T extends Record<PropertyKey, Pipe<any, any, any>>>(
	discriminator: (val: PipeInput<T[keyof T]>) => PropertyKey,
	branches: T,
	err = 'doesnt match any of the schema',
) =>
	pipe<PipeInput<T[keyof T]>, PipeOutput<T[keyof T]>, any>(
		(input) => {
			const accessor = wrapInTryCatch(() => discriminator(input))!
			if (!branches[accessor]) throw PipeError.root(err, input)
			return assert(branches[accessor], input)
		},
		{
			compile: ({ input, context }, rootContext) => `(() => {
	const accessor = ${context}.wrapInTryCatch(() => ${context}.discriminator(${input}))
	if (!${context}.branches[accessor]) return ${context}.PipeError.root("${err}", ${input})
	${Object.entries(branches)
		.map(([key, branch]) => `if (accessor === '${key}') return ${compileToAssert(branch, rootContext, input, context)}`)
		.join('\n')}
})()`,
			context: () => ({ wrapInTryCatch, discriminator, branches }),
			schema: () => ({ oneOf: Object.values(branches).map((s) => schema(s)) }),
		},
	)

export const fromJson = <T extends Pipe<any, any, any>>(branch: T) =>
	pipe<PipeInput<T>, PipeOutput<T>, PipeContext<T>>(
		(input) => {
			const validity = validate(branch, input)
			if (validity.valid) return validity.value
			if (input?.constructor?.name !== 'String') throw validity.error

			const parsed = wrapInTryCatch(() => JSON.parse(input), validity.error)
			if (parsed === validity.error) throw validity.error
			return assert(branch, parsed)
		},
		{
			compile: ({ input, context }, rootContext) => `(() => {
	const validity = ${compileToValidate(branch, rootContext, input, context)}
	if (validity.valid) return validity.value
	if (${input}?.constructor?.name !== 'String') throw validity.error
	const parsed = ${context}.wrapInTryCatch(() => JSON.parse(${input}), validity.error)
	if (parsed === validity.error) throw validity.error
	return ${compileToAssert(branch, rootContext, input, context)}
})()`,
			context: () => ({ ...branch.context(), wrapInTryCatch }),
			schema: branch.schema,
		},
	)

export const lazy = <T extends Pipe<any, any, any>>(pipeFn: () => T) =>
	pipe<PipeInput<T>, PipeOutput<T>, PipeContext<T>>((input) => assert(pipeFn(), input), {
		compile: ({ input, context }, rootContext) => compileToAssert(pipeFn(), rootContext, input, context),
		schema: () => schema(pipeFn()),
	})

export const recursive = <T extends Pipe<any, any, any>, R = T>(pipeFn: (root: R) => T, id: string) => {
	const root = pipe((input) => assert(pipeFn(root), input), {
		schema: () => ({ $refId: id }),
	})
	return pipe<PipeInput<T>, PipeOutput<T>, PipeContext<T>>(root.fn, {
		// TODO: will probably cause recursive errors
		compile: ({ input, context }, rootContext) => compileToAssert(root, rootContext, input, context),
		schema: () => schema(pipeFn(root), { $refId: id }),
	})
}
