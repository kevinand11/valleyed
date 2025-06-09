import { JsonSchema, Prettify } from '../utils/types'

export type PipeFn<I, O = I> = (input: I, context: PipeContext) => O
export type PipeInput<T> = T extends Pipe<infer I, any> ? Prettify<I> : never
export type PipeOutput<T> = T extends Pipe<any, infer O> ? Prettify<O> : never
export type PipeContext = Partial<{
	optional: boolean
	objectPipes: Record<string, Pipe<any, any>>
}>
export type PipeMeta = Pick<JsonSchema, 'title' | 'description' | 'examples' | 'default'>
export type JsonSchemaBuilder = JsonSchema | ((context: PipeContext) => JsonSchema)

type Arrayable<T> = T | T[]

function flatArray<T>(arr: Arrayable<T>): T[] {
	return Array.isArray(arr) ? arr : [arr]
}

function formatError(message: { message: string; path?: string }) {
	return `${message.path ? `${message.path}: ` : ''}${message.message}`
}

export class PipeError extends Error {
	constructor(
		public messages: { message: string; path?: string }[],
		readonly value: unknown,
		cause?: unknown,
	) {
		const message = messages[0]
		super(message ? formatError(message) : 'Pipe validation error', { cause })
	}

	toString() {
		return this.messages.map(formatError).join('\n')
	}

	static root(messages: Arrayable<string>, value: unknown, cause?: unknown) {
		return new PipeError(
			flatArray(messages).map((message) => ({ message })),
			value,
			cause,
		)
	}

	static rootFrom(errors: Arrayable<PipeError>, value: unknown, cause?: unknown) {
		return new PipeError(
			flatArray(errors).flatMap((error) => error.messages),
			value,
			cause,
		)
	}

	static path(path: PropertyKey, errors: Arrayable<PipeError>, value: unknown, cause?: unknown) {
		return new PipeError(
			flatArray(errors).flatMap((error) =>
				error.messages.map((message) => ({ ...message, path: `${path.toString()}${message.path ? `.${message.path}` : ''}` })),
			),
			value,
			cause,
		)
	}
}

export type Pipe<I, O = I> = {
	readonly context: PipeContext
	pipe<T>(fn: Pipe<O, T> | PipeFn<O, T>): Pipe<I, T>
	parse(input: unknown): O
	safeParse(input: unknown): { value: O; valid: true } | { error: PipeError; valid: false }
	meta(schema: PipeMeta): Pipe<I, O>
	toJsonSchema(schema?: JsonSchema): JsonSchema
}

export function pipe<I, O = I>(
	func: PipeFn<I, O>,
	config: {
		context?: PipeContext | ((context: PipeContext) => PipeContext)
		schema?: JsonSchemaBuilder
	} = {},
): Pipe<I, O> {
	const chain: Pipe<any, any>[] = []
	const pipeSchema = config?.schema ?? {}
	let meta: PipeMeta = {}
	let context = typeof config?.context === 'function' ? config.context({}) : (config?.context ?? {})

	const piper: Pipe<I, O> = {
		context,
		pipe: (p) => {
			const pp = typeof p === 'function' ? pipe(p, config) : p
			context = { ...context, ...pp.context }
			chain.push(pp)
			return piper as any
		},
		parse: (input) =>
			chain.reduce(
				(acc, p) => {
					try {
						return p.parse(acc)
					} catch (error) {
						if (error instanceof PipeError) throw error
						throw PipeError.root(error instanceof Error ? error.message : `${error}`, input, error)
					}
				},
				func(input as any, context),
			),
		safeParse: (input) => {
			try {
				const value = piper.parse(input)
				return { value, valid: true }
			} catch (error) {
				if (error instanceof PipeError) return { error, valid: false }
				throw error
			}
		},
		meta: (schema) => {
			meta = { ...meta, ...schema }
			return piper
		},
		toJsonSchema: (schema = {}) =>
			chain.reduce((acc, p) => p.toJsonSchema(acc), {
				...schema,
				...(typeof pipeSchema === 'function' ? pipeSchema(context) : pipeSchema),
				...meta,
			}),
	}
	return piper
}
