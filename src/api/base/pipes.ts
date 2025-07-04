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
		return PipeError.root(error instanceof Error ? error.message : `${error}`, input, undefined, error)
	}
}

export function schema<T extends Pipe<any, any>>(pipe: T, schema: JsonSchema = {}): JsonSchema {
	const cont = context(pipe)
	return walk(pipe, schema, (p, acc) => ({ ...acc, ...p.schema(cont) }))
}

export function meta<T extends Pipe<any, any>>(p: T, meta: PipeMeta): T {
	return p.pipe(standard(() => [], { schema: () => meta })) as T
}

export function compile<T extends Pipe<any, any>>(
	pipe: T,
	{
		failEarly = true,
	}: {
		failEarly?: boolean
	} = {},
): PipeCompiledFn<T> {
	const inputStr = 'input'
	const contextStr = 'context'
	const { compiled: compiledArr, context } = compilePipeToString({ pipe, input: inputStr, context: contextStr, failEarly })
	const allLines = [
		`return (${inputStr}) => {`,
		...compiledArr.filter((l) => l.trim() !== '').map((l) => `\t${l}`),
		`	return { value: ${inputStr}, valid: true }`,
		`}`,
	]
	pipe.__compiled = new Function(contextStr, 'PipeError', allLines.join('\n'))(context, PipeError)
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
		({ input, context }, opts) => [
			`${input} = ${context}['${key}'](${input})`,
			`if (${input} instanceof PipeError) return ${opts.path ? `PipeError.path('${opts.path}', ${input})` : input}`,
		],
		{
			context: { ...config?.context, [key]: fn },
			schema: config?.schema,
		},
	)
}

export function compileNested({
	pipe,
	rootContext,
	context: contextStr,
	failEarly,
	path,
	...rest
}: Omit<Parameters<typeof compilePipeToString>[0], 'input'> & {
	rootContext: Context
} & ({ fn: string } | { input: string; key?: string })) {
	const random = getRandomValue()
	const input = 'fn' in rest ? `arg_${getRandomValue()}` : rest.input
	const { compiled, context } = compilePipeToString({
		pipe,
		input,
		context: `${contextStr}[\`${random}\`]`,
		failEarly,
		path: ['key' in rest ? rest.key : '', path].filter(Boolean).join('.') || undefined,
	})
	rootContext[random] = context
	if (!('fn' in rest)) return compiled
	return [`function ${rest.fn}(${input}) {`, ...compiled.map((line) => `	${line}`), `	return ${input}`, '}']
}

function compilePipeToString({
	pipe,
	input,
	context: contextStr,
	failEarly = false,
	path,
}: {
	pipe: Pipe<any, any>
	input: string
	context: string
	failEarly?: boolean
	path?: string
}) {
	const rootContext = context(pipe)
	const compiled = walk(pipe, <string[]>[], (p, acc) => {
		acc.push(...p.compile({ input, context: contextStr, path: `${path ? `'${path}'` : undefined}` }, { rootContext, failEarly, path }))
		return acc
	})
	return { compiled, context: rootContext }
}
