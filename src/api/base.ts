import { JsonSchema, Prettify } from '../utils/types'

export type JsonSchemaBuilder = (schema: JsonSchema) => JsonSchema
export type PipeFn<I, O = I> = (input: I) => O
export type PipeInput<T extends Pipe<any, any, any>> = T extends Pipe<infer I, any, any> ? Prettify<I> : never
export type PipeOutput<T extends Pipe<any, any, any>> = T extends Pipe<any, infer O, any> ? Prettify<O> : never

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
	readonly flow: PipeFn<I, O>[]
	readonly schemaBuilders: JsonSchemaBuilder[]
	pipe<T>(fn: Pipe<O, T, C> | PipeFn<O, T>): Pipe<I, T, C>
	parse(input: unknown): O
	safeParse(input: unknown): { value: O; valid: true } | { error: PipeError; valid: false }
	toJsonSchema(): JsonSchema
}

export function makePipe<I, O = I, C extends object = object>(
	func: PipeFn<I, O>,
	context: C,
	schemaBuilder?: JsonSchemaBuilder,
): Pipe<I, O, C> {
	const flow: PipeFn<any, any>[] = [func]
	const schemaBuilders: JsonSchemaBuilder[] = schemaBuilder ? [schemaBuilder] : []

	const piper: Pipe<I, O, C> = {
		context,
		get flow() {
			return flow
		},
		get schemaBuilders() {
			return schemaBuilders
		},
		pipe: (fn) => {
			flow.push(...('flow' in fn ? fn.flow : [fn]))
			if ('schemaBuilders' in fn) schemaBuilders.push(...fn.schemaBuilders)
			return piper as any
		},
		parse: (input) => flow.reduce((acc, fn) => fn(acc), input as any),
		safeParse: (input) => {
			try {
				const value = piper.parse(input)
				return { value, valid: true }
			} catch (error) {
				if (error instanceof PipeError) return { error, valid: false }
				throw error
			}
		},
		toJsonSchema: () => schemaBuilders.reduce<JsonSchema>((schema, builder) => builder(schema), {}),
	}
	return piper
}
