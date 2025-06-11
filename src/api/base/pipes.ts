import { PipeError } from './errors'
import { PipeFn, PipeContext, JsonSchemaBuilder, PipeMeta, Pipe, Entry } from './types'

export function pipe<I, O = I, C = any>(
	func: PipeFn<I, O, C>,
	config: {
		context?: PipeContext<C> | ((context: PipeContext<C>) => PipeContext<C>)
		schema?: JsonSchemaBuilder<C>
	} = {},
): Pipe<I, O, C> {
	const pipeSchema = config?.schema ?? {}
	let meta: PipeMeta = {}
	const context: any = typeof config?.context === 'function' ? config.context({} as any) : (config?.context ?? {})

	const piper: Pipe<I, O, C> = {
		prev: undefined,
		context,
		pipe: (...entries: Entry<any, any, any>[]) =>
			entries.reduce((acc, cur) => {
				const p = typeof cur === 'function' ? pipe(cur, config) : cur
				p.context = { ...context, ...p.context }
				p.prev = acc
				return p
			}, piper),
		parse: (input) => {
			try {
				const inputToRun = piper.prev ? piper.prev.parse(input) : input
				return func(inputToRun, context)
			} catch (error) {
				if (error instanceof PipeError) throw error
				throw PipeError.root(error instanceof Error ? error.message : `${error}`, input, error)
			}
		},
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
		toJsonSchema: (schema = {}) => ({
			...piper.prev?.toJsonSchema(schema),
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
