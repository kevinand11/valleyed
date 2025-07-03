import { PipeError } from './errors'
import { Context, JsonSchemaBuilder, PipeMeta, Pipe, Entry, PipeOutput, PipeFn } from './types'
import { getRandomValue } from '../../utils/functions'
import { JsonSchema } from '../../utils/types'

export function walk<T>(pipe: Pipe<any, any>, init: T, nodeFn: (cur: Pipe<any, any>, acc: T) => T) {
	let acc: T = init
	while (pipe) {
		acc = nodeFn(pipe, acc)
		pipe = pipe.next!
	}
	return acc
}

export function context<T extends Pipe<any, any>>(pipe: T): Context {
	return walk(pipe, {} as Context, (p, acc) => ({ ...acc, ...p.context() }))
}

export function assert<T extends Pipe<any, any>>(pipe: T, input: unknown): PipeOutput<T> {
	try {
		if (!pipe.__compiled) pipe = compile(pipe)
		return pipe.__compiled!(input) as PipeOutput<T>
	} catch (error) {
		if (error instanceof PipeError) throw error
		throw PipeError.root(error instanceof Error ? error.message : `${error}`, input, error)
	}
}

export function compileToAssert({
	pipe,
	rootContext,
	input,
	context: contextStr,
	prefix = '',
}: Parameters<typeof compilePipeToString>[0] & {
	rootContext: Context
	prefix?: string
}) {
	const random = getRandomValue()
	const { compiled, context } = compilePipeToString({ pipe, input, context: `${contextStr}[\`${random}\`]` })
	rootContext[random] = context
	return [
		`${prefix}(() => {`,
		`	try {`,
		...compiled.map((line) => `		${line}`),
		`		return ${input}`,
		`	} catch (error) {`,
		`		if (error instanceof ${contextStr}.PipeError) throw error`,
		`		throw ${contextStr}.PipeError.root(error instanceof Error ? error.message : String(error), ${input}, error)`,
		`	}`,
		`})()`,
	]
}

export function validate<T extends Pipe<any, any>>(
	pipe: T,
	input: unknown,
): { value: PipeOutput<T>; valid: true } | { error: PipeError; valid: false } {
	try {
		const value = assert(pipe, input)
		return { value, valid: true }
	} catch (error) {
		if (error instanceof PipeError) return { error, valid: false }
		throw PipeError.root(error instanceof Error ? error.message : `${error}`, input, error)
	}
}

export function compileToValidate({
	pipe,
	rootContext,
	input,
	context: contextStr,
	prefix = '',
}: Parameters<typeof compilePipeToString>[0] & {
	rootContext: Context
	prefix?: string
}) {
	const random = getRandomValue()
	const { compiled, context } = compilePipeToString({ pipe, input, context: `${contextStr}[\`${random}\`]` })
	rootContext[random] = context
	return [
		`${prefix}(() => {`,
		`	try {`,
		...compiled.map((line) => `		${line}`),
		`		return { value: ${input}, valid: true }`,
		`	} catch (error) {`,
		`		if (error instanceof ${contextStr}.PipeError) return { error, valid: false }`,
		`		throw ${contextStr}.PipeError.root(error instanceof Error ? error.message : String(error), ${input}, error)`,
		`	}`,
		`})()`,
	]
}

export function schema<T extends Pipe<any, any>>(pipe: T, schema: JsonSchema = {}): JsonSchema {
	const cont = context(pipe)
	return walk(pipe, schema, (p, acc) => ({ ...acc, ...p.schema(cont) }))
}

export function meta<T extends Pipe<any, any>>(p: T, meta: PipeMeta): T {
	return p.pipe(standard(() => [], { schema: () => meta })) as T
}

function compilePipeToString({ pipe, input, context: contextStr }: { pipe: Pipe<any, any>; input: string; context: string }) {
	const fullContext = context(pipe)
	fullContext.PipeError = PipeError
	const compiled = walk(pipe, <string[]>[], (p, acc) => {
		acc.push(...p.compile({ input, context: contextStr }, fullContext))
		return acc
	})
	return { compiled, context: fullContext }
}

export function compile<T extends Pipe<any, any>>(pipe: T) {
	const { compiled: compiledArr, context } = compilePipeToString({ pipe, input: 'input', context: 'context' })
	const compiled = compiledArr
		.concat('return input')
		.map((l) => `\t${l}`)
		.join('\n')
	pipe.__compiled = new Function('context', `return (input) =>{\n${compiled}\n}`)(context)
	return pipe
}

export function standard<I, O>(
	compile: Pipe<I, O>['compile'],
	config: {
		context?: Context
		schema?: (context: Context) => JsonSchemaBuilder
	} = {},
): Pipe<I, O> {
	const piper: Pipe<I, O> = {
		context: () => config.context ?? ({} as any),
		schema: (context: Context) => config.schema?.(context) ?? ({} as any),
		pipe: (...entries: Entry<any, any>[]) => {
			delete piper.__compiled
			for (const cur of entries) {
				const p = typeof cur === 'function' ? define(cur, config) : cur
				if (!piper.next) piper.next = p
				if (piper.last) piper.last.next = p
				piper.last = p.last ?? p
			}
			return piper
		},
		compile,
		'~standard': {
			version: 1,
			vendor: 'valleyed',
			validate(value) {
				const validity = validate(piper, value)
				if (validity.valid) return { value: validity.value }
				return {
					issues: validity.error.messages.map(({ message, path }) => ({
						message,
						path: path ? path.split('.') : undefined,
					})),
				}
			},
		},
	}
	return piper
}

export function define<I, O>(
	fn: PipeFn<I, O>,
	config: {
		context?: Context
		schema?: (context: Context) => JsonSchemaBuilder
	} = {},
): Pipe<I, O> {
	const key = `define-${getRandomValue()}`
	return standard<I, O>(({ input, context }) => [`${input} = ${context}['${key}'](${input})`], {
		context: { ...config?.context, [key]: fn, PipeError },
		schema: config?.schema,
	})
}
