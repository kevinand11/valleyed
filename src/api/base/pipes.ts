import { PipeError } from './errors'
import { PipeFn, PipeContext, JsonSchemaBuilder, PipeMeta, Pipe, Entry, PipeNode } from './types'

export function pipe<I, O = I, C = any>(
	func: PipeFn<I, O, C>,
	config: {
		context?: PipeContext<C> | ((context: PipeContext<C>) => PipeContext<C>)
		schema?: JsonSchemaBuilder<C>
		wrap?: boolean
	} = {},
): Pipe<I, O, C> {
	const pipeSchema = config?.schema ?? {}
	let meta: PipeMeta = {}
	const context: any = typeof config?.context === 'function' ? config.context({} as any) : (config?.context ?? {})

	const node: PipeNode<I, O, C> = {
		fn: func,
		context,
		wrap: config?.wrap ?? false,
		schema: (context) => ({
			...(typeof pipeSchema === 'function' ? pipeSchema(context) : pipeSchema),
			...meta,
		}),
	}

	const piper: Pipe<I, O, C> = {
		prev: undefined,
		node,
		pipe: (...entries: Entry<any, any, any>[]) =>
			entries.reduce((acc, cur) => {
				const p = typeof cur === 'function' ? pipe(cur, config) : cur
				p.node.context = { ...context, ...p.node.context }
				if (p.node.wrap) getRootPipe(acc).prev = p
				p.prev = acc
				return p
			}, piper),
		parse: (input) => {
			try {
				return gather(piper).reduce((acc, cur) => cur.fn(acc, context), input) as O
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
		toJsonSchema: (schema = {}) => gather(piper).reduce((acc, cur) => ({ ...acc, ...cur.schema(context) }), schema),
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
	return pipes.reverse()
}

function getRootPipe(pipe: Pipe<any, any, any>) {
	let current = pipe
	while (current.prev) current = current.prev
	return current
}
