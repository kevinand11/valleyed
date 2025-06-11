import { PipeError } from './errors'
import { PipeFn, PipeContext, JsonSchemaBuilder, PipeMeta, Pipe, Entry, PipeNode } from './types'

export function pipe<I, O = I, C = any>(
	func: PipeFn<I, O, C>,
	config: {
		context?: PipeContext<C> | (() => PipeContext<C>)
		schema?: JsonSchemaBuilder<C>
	} = {},
): Pipe<I, O, C> {
	const pipeSchema = config?.schema ?? {}
	let meta: PipeMeta = {}

	const node: PipeNode<I, O, C> = {
		fn: func,
		context: typeof config?.context === 'function' ? config.context() : (config?.context ?? ({} as any)),
		schema: (schema, context) => ({
			...schema,
			...(typeof pipeSchema === 'function' ? pipeSchema(schema, context) : pipeSchema),
			...meta,
		}),
	}

	const piper: Pipe<I, O, C> = {
		prev: undefined,
		node,
		pipe: (...entries: Entry<any, any, any>[]) =>
			entries.reduce((acc, cur) => {
				const p = typeof cur === 'function' ? pipe(cur, config) : cur
				p.prev = acc
				return p
			}, piper),
		parse: (input) => {
			try {
				const { nodes, context } = gather(piper)
				return nodes.reduce((acc, cur) => cur.fn(acc, context), input) as O
			} catch (error) {
				if (error instanceof PipeError) {
					if (error.stopped) return error.value as O
					throw error
				}
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
		toJsonSchema: (schema = {}) => {
			const { nodes, context } = gather(piper)
			return nodes.reduce((acc, cur) => cur.schema(acc, context), schema)
		},
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

function gather(pipe: Pipe<any, any, any>) {
	const pipes = [pipe.node]
	while (pipe.prev) {
		pipes.push(pipe.prev.node)
		pipe = pipe.prev
	}
	const nodes = pipes.reverse()
	const context = nodes.reduce((acc, cur) => ({ ...acc, ...cur.context }), {} as PipeContext<any>)
	return { nodes, context }
}
