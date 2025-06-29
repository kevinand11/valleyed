import { PipeError } from './errors'
import { PipeFn, Context, JsonSchemaBuilder, PipeMeta, Pipe, Entry, PipeOutput, PipeContext, PipeInput } from './types'
import { JsonSchema } from '../../utils/types'

export function walk<T>(pipe: Pipe<any, any, any>, init: T, nodeFn: (cur: Pipe<any, any, any>, acc: T) => T) {
	let acc: T = init
	while (pipe) {
		acc = nodeFn(pipe, acc)
		pipe = pipe.next!
	}
	return acc
}

export function context<T extends Pipe<any, any, any>>(pipe: T): Context<PipeContext<T>> {
	return walk(pipe, {} as Context<PipeContext<T>>, (p, acc) => ({ ...acc, ...p.context() }))
}

export function assert<T extends Pipe<any, any, any>>(pipe: T, input: unknown): PipeOutput<T> {
	try {
		const cont = context(pipe)
		return walk(pipe, input as PipeOutput<T>, (p, acc) => p.fn(acc, cont))
	} catch (error) {
		if (error instanceof PipeError) {
			if (error.stopped) return error.value as PipeOutput<T>
			throw error
		}
		throw PipeError.root(error instanceof Error ? error.message : `${error}`, input, error)
	}
}

export function validate<T extends Pipe<any, any, any>>(
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

export function schema<T extends Pipe<any, any, any>>(pipe: T, schema: JsonSchema = {}): JsonSchema {
	const cont = context(pipe)
	return walk(pipe, schema, (p, acc) => ({ ...acc, ...p.schema(cont) }))
}

export function meta<T extends Pipe<any, any, any>>(p: T, meta: PipeMeta): T {
	return p.pipe(pipe((i) => i, { schema: () => meta })) as T
}

export function compile<T extends Pipe<any, any, any>>(pipe: T) {
	const input = 'input'
	const context = 'context'
	const compiledStrings = <string[]>[]
	walk(pipe, undefined, (p, acc) => {
		if (p.compile)
			compiledStrings.push(`input = ${p.compile({ input, context })};\n if (${input} instanceof ${context}.PipeError) throw input;\n`)
		return acc
	})
	const fullFn = `
		${compiledStrings.join('')}
		return input
	`
	return new Function(input, context, fullFn) as PipeFn<PipeInput<T>, PipeOutput<T>, PipeContext<T>>
}

export function execCompiled<T extends Pipe<any, any, any>>(pipe: T, input: unknown) {
	const cont = context(pipe)
	return compile(pipe)(input as any, cont)
}

export function pipe<I, O, C>(
	func: PipeFn<I, O, C>,
	config: {
		compile?: Pipe<I, O, C>['compile']
		context?: () => Context<C>
		schema?: (context: Context<C>) => JsonSchemaBuilder
	} = {},
): Pipe<I, O, C> {
	const piper: Pipe<I, O, C> = {
		fn: func,
		context: () => config.context?.() ?? ({} as any),
		schema: (context: Context<C>) => config.schema?.(context) ?? ({} as any),
		pipe: (...entries: Entry<any, any, any>[]) => {
			for (const cur of entries) {
				const p = typeof cur === 'function' ? pipe(cur, config) : cur
				if (!piper.next) piper.next = p
				if (piper.last) piper.last.next = p
				piper.last = p.last ?? p
			}
			return piper
		},
		compile: config.compile,
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

export function branch<P extends Pipe<any, any, any>, I, O, C>(
	branch: P,
	fn: PipeFn<I, O, C>,
	config: {
		compile?: Pipe<I, O, C>['compile']
		context: (context: Context<C>) => Context<C>
		schema: (schema: JsonSchemaBuilder, context: Context<C>) => JsonSchemaBuilder
	},
) {
	return pipe(fn, {
		...config,
		context: () => config.context(context(branch) as any),
		schema: (context) => ({ ...config.schema(schema(branch), context) }),
	})
}
