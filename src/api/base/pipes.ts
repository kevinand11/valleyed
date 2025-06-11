import { PipeError } from './errors'
import { PipeFn, PipeContext, JsonSchemaBuilder, PipeMeta, Pipe } from './types'

export function pipe<I, O = I, C = any>(
	func: PipeFn<I, O, C>,
	config: {
		context?: PipeContext<C> | ((context: PipeContext<C>) => PipeContext<C>)
		schema?: JsonSchemaBuilder<C>
	} = {},
): Pipe<I, O, C> {
	const chain: Pipe<any, any>[] = []
	const pipeSchema = config?.schema ?? {}
	let meta: PipeMeta = {}
	let context: any = typeof config?.context === 'function' ? config.context({} as any) : (config?.context ?? {})

	const piper: Pipe<I, O, C> = {
		context,
		pipe: (...entries: any[]) => {
			entries.forEach((entry) => {
				const p = typeof entry === 'function' ? pipe(entry, config) : entry
				context = { ...context, ...p.context }
				chain.push(p)
			})
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
		'~standard': {
			version: 1,
			vendor: 'valleyed',
			validate(value) {
				const validity = piper.safeParse(value)
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
