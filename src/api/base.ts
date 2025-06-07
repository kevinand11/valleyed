import { JsonSchema, Prettify } from '../utils/types'

export type PipeFn<I, O = I> = (input: I) => O
export type PipeInput<T> = T extends Pipe<infer I, any, any> ? Prettify<I> : never
export type PipeOutput<T> = T extends Pipe<any, infer O, any> ? Prettify<O> : never
export type PipeContext<T> = T extends Pipe<any, any, infer C> ? Prettify<C> : never
export type PipeMeta = Pick<JsonSchema, 'title' | 'description' | 'examples' | 'default'>
export type JsonSchemaBuilder = (schema: JsonSchema) => JsonSchema

export class PipeError extends Error {
	constructor(
		public messages: string[],
		readonly value: unknown,
	) {
		super('Pipe validation error')
	}

	withMessages(messages: string[]) {
		this.messages = messages
		return this
	}
}

export type Pipe<I, O = I, C extends object = object> = {
	context: C
	pipe<T>(fn: Pipe<O, T, C> | PipeFn<O, T>): Pipe<I, T, C>
	parse(input: unknown): O
	safeParse(input: unknown): { value: O; valid: true } | { error: PipeError; valid: false }
	meta(schema: PipeMeta): Pipe<I, O, C>
	toJsonSchema(schema?: JsonSchema): JsonSchema
}

export function makePipe<I, O = I, C extends object = object>(
	func: PipeFn<I, O>,
	context: C,
	schemaBuilder: JsonSchemaBuilder = () => ({}),
): Pipe<I, O, C> {
	const chain: Pipe<any, any>[] = []
	let meta: PipeMeta = {}

	const piper: Pipe<I, O, C> = {
		context,
		pipe: (p) => {
			chain.push(typeof p === 'function' ? makePipe(p, context) : p)
			return piper as any
		},
		parse: (input) => chain.reduce((acc, p) => p.parse(acc), func(input as any)),
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
		toJsonSchema: (schema = {}) => chain.reduce((acc, p) => p.toJsonSchema(acc), schemaBuilder({ ...meta, ...schema })),
	}
	return piper
}
