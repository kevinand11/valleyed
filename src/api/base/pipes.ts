import { PipeError } from './errors'
import { Context, JsonSchemaBuilder, PipeMeta, Pipe, Entry, PipeOutput, PipeFn, PipeCompiledFn } from './types'
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
	const result = validate(pipe, input)
	if (!result.valid) throw result
	return result.value
}

export function validate<T extends Pipe<any, any>>(pipe: T, input: unknown): ReturnType<PipeCompiledFn<T>> {
	try {
		const fn = pipe.__compiled ?? compile(pipe)
		return fn(input) as ReturnType<PipeCompiledFn<T>>
	} catch (error) {
		if (error instanceof PipeError) return error
		return PipeError.root(error instanceof Error ? error.message : `${error}`, input, error)
	}
}

export function compileNested({
	pipe,
	rootContext,
	input,
	context: contextStr,
	prefix = '',
	failEarly,
}: Parameters<typeof compilePipeToString>[0] & {
	rootContext: Context
	prefix?: string
}) {
	const random = getRandomValue()
	const { compiled, context } = compilePipeToString({ pipe, input, context: `${contextStr}[\`${random}\`]`, failEarly })
	rootContext[random] = context
	return [
		`${prefix}(() => {`,
		`	try {`,
		...compiled.map((line) => `		${line}`),
		`		return ${input}`,
		`	} catch (error) {`,
		`		if (error instanceof ${contextStr}.PipeError) return error`,
		`		return ${contextStr}.PipeError.root(error instanceof Error ? error.message : String(error), ${input}, error)`,
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

function compilePipeToString({
	pipe,
	input,
	context: contextStr,
	failEarly,
}: {
	pipe: Pipe<any, any>
	input: string
	context: string
	failEarly?: boolean
}) {
	const fullContext = context(pipe)
	fullContext.PipeError = PipeError
	const compiled = walk(pipe, <string[]>[], (p, acc) => {
		acc.push(...p.compile({ input, context: contextStr }, fullContext, failEarly ?? false))
		return acc
	})
	return { compiled, context: fullContext }
}

export function compile<T extends Pipe<any, any>>(pipe: T): PipeCompiledFn<T> {
	const inputStr = 'input'
	const contextStr = 'context'
	const { compiled: compiledArr, context } = compilePipeToString({ pipe, input: inputStr, context: contextStr })
	const compiled = compiledArr
		.filter((l) => l.trim() !== '')
		.concat(`return { value: ${inputStr}, valid: true }`)
		.map((l) => `\t${l}`)
		.join('\n')
	pipe.__compiled = new Function(contextStr, `return (${inputStr}) => {\n${compiled}\n}`)(context)
	return pipe.__compiled!
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
					issues: validity.messages.map(({ message, path }) => ({
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
	const key = `define_${getRandomValue()}`
	return standard<I, O>(
		({ input, context }) => [
			`${input} = ${context}['${key}'](${input})`,
			`if (${input} instanceof ${context}.PipeError) return ${input}`,
		],
		{
			context: { ...config?.context, [key]: fn, PipeError },
			schema: config?.schema,
		},
	)
}
