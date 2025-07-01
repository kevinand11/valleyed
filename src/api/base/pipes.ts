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
		if (error instanceof PipeError) {
			if (error.stopped) return error.value as PipeOutput<T>
			throw error
		}
		throw PipeError.root(error instanceof Error ? error.message : `${error}`, input, error)
	}
}

export function compileToAssert(pipe: Pipe<any, any>, rootContext: Context, inputStr: string, contextStr: string) {
	const random = getRandomValue()
	const { compiled, context } = compilePipeToString(pipe, inputStr, `${contextStr}.${random}`)
	rootContext[random] = context
	return `(() => {
	try {
		${compiled.join('\n')}
		return ${inputStr}
	catch (error) {
		if (error instanceof ${contextStr}.PipeError) {
			if (error.stopped) return error.value
			throw error
		}
		throw ${contextStr}.PipeError.root(error instanceof Error ? error.message : \`\${error}\`, ${inputStr}, error)
	}
})()`
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

export function compileToValidate(pipe: Pipe<any, any>, rootContext: Context, inputStr: string, contextStr: string) {
	const random = getRandomValue()
	const { compiled, context } = compilePipeToString(pipe, inputStr, `${contextStr}.${random}`)
	rootContext[random] = context
	return `(() => {
	try {
		${compiled.join('\n')}
		return { value: ${inputStr}, valid: true }
	}
	catch (error) {
		if (error instanceof ${contextStr}.PipeError) return { error, valid: false }
		throw ${contextStr}.PipeError.root(error instanceof Error ? error.message : \`\${error}\`, ${inputStr}, error)
	}
})()`
}

export function schema<T extends Pipe<any, any>>(pipe: T, schema: JsonSchema = {}): JsonSchema {
	const cont = context(pipe)
	return walk(pipe, schema, (p, acc) => ({ ...acc, ...p.schema(cont) }))
}

export function meta<T extends Pipe<any, any>>(p: T, meta: PipeMeta): T {
	return p.pipe(standard(({ input }) => input, { schema: () => meta })) as T
}

function compilePipeToString(pipe: Pipe<any, any>, inputStr: string, contextStr: string) {
	const fullContext = context(pipe)
	const compiled = walk(pipe, <string[]>[], (p, acc) => {
		if (p.compile)
			acc.push(
				`${inputStr} = ${p.compile({ input: inputStr, context: contextStr }, fullContext)};`,
				`if (${inputStr} instanceof ${contextStr}.PipeError) throw input;`,
			)
		return acc
	})
	return { compiled, context: fullContext }
}

export function compile<T extends Pipe<any, any>>(pipe: T) {
	const { compiled: compiledArr, context } = compilePipeToString(pipe, 'input', 'context')
	const compiled = compiledArr.concat('return input;').join('\n')
	pipe.__compiled = new Function('context', `return (input) =>{\n${compiled}\n}`)(context)
	return pipe
}

export function standard<I, O>(
	compile: Pipe<I, O>['compile'],
	config: {
		context?: () => Context
		schema?: (context: Context) => JsonSchemaBuilder
	} = {},
): Pipe<I, O> {
	const piper: Pipe<I, O> = {
		context: () => config.context?.() ?? ({} as any),
		schema: (context: Context) => config.schema?.(context) ?? ({} as any),
		pipe: (...entries: Entry<any, any>[]) => {
			for (const cur of entries) {
				const p = typeof cur === 'function' ? standard(cur, config) : cur
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
		context?: () => Context
		schema?: (context: Context) => JsonSchemaBuilder
	} = {},
): Pipe<I, O> {
	const key = `define-${getRandomValue()}`
	return standard<I, O>(({ input, context }) => `${context}.['${key}'](${input})`, {
		context: () => ({ ...config?.context?.(), [key]: fn, PipeError }),
		schema: config?.schema,
	})
}
