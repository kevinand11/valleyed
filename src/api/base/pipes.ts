import { createErrorHandler, PipeError } from './errors'
import { Context, JsonSchemaBuilder, PipeMeta, Pipe, Entry, PipeOutput, PipeFn, PipeCompiledFn, PipeErrorHandler } from './types'
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
	const { lines, context } = compilePipeToString({
		pipe,
		input: inputStr,
		context: contextStr,
		failEarly,
		base: [`return { value: ${inputStr}, valid: true }`],
	})
	const allLines = [
		`return (${inputStr}) => {`,
		...lines.filter((l) => l.trim() !== '').map((l) => `\t${l}`),
		`	throw PipeError.root('unhandled root validation', ${inputStr})`,
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
		({ input, context, path }) => [
			`${input} = ${context}['${key}'](${input})`,
			`if (${input} instanceof PipeError) return PipeError.path(${path}, ${input})`,
		],
		{
			context: { ...config?.context, [key]: fn },
			schema: config?.schema,
		},
	)
}

export function compileNested(
	data: {
		pipe: Pipe<any, any>
		errorType?: Parameters<typeof createErrorHandler>[1]
		opts: Required<Pick<Parameters<Pipe<any, any>['compile']>[1], 'rootContext' | 'failEarly' | 'path' | 'wrapError'>>
	} & { input: string; key?: string },
) {
	const random = getRandomValue()
	const { lines, context } = compilePipeToString({
		...data.opts,
		wrapError: createErrorHandler(data.input, data.errorType ?? data.opts.wrapError.type),
		pipe: data.pipe,
		input: data.input,
		context: `context[\`${random}\`]`,
		path: ['key' in data ? data.key : '', data.opts.path].filter(Boolean).join('.') || undefined,
	})
	data.opts.rootContext[random] = context
	return lines
}

function compilePipeToString({
	pipe,
	input,
	context: contextStr,
	failEarly = false,
	path = '',
	rootContext,
	wrapError = createErrorHandler(input, 'return'),
	base = [],
}: {
	pipe: Pipe<any, any>
	input: string
	context: string
	failEarly?: boolean
	path?: string
	rootContext?: Context
	wrapError?: PipeErrorHandler
	base?: string[]
}) {
	const ctx = context(pipe)
	rootContext ??= ctx
	const compiled = walk(pipe, <ReturnType<Pipe<any, any>['compile']>[]>[], (p, acc) => {
		acc.push(
			p.compile(
				{ input, context: contextStr, path: `${path ? `'${path}'` : undefined}` },
				{ rootContext, failEarly, path, wrapError },
			),
		)
		return acc
	})
	const lines = mergePipeLines(base, compiled.flat())
	return { lines, context: ctx }
}

function mergePipeLines(base: string[], lines: ReturnType<Pipe<any, any>['compile']>) {
	return (Array.isArray(lines) ? lines : [lines]).reduceRight<string[]>((acc, cur) => {
		if (typeof cur === 'string') acc.unshift(cur)
		else if (typeof cur === 'function') acc = cur(acc)
		return acc
	}, base)
}
