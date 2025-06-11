import { PipeError } from './errors'
import { PipeFn, Context, JsonSchemaBuilder, PipeMeta, Pipe, Entry, PipeNode } from './types'

export function pipe<I, O, C>(
	func: PipeFn<I, O, C>,
	config: {
		context?: () => Context<C>
		schema?: () => JsonSchemaBuilder
	} = {},
): Pipe<I, O, C> {
	let meta: PipeMeta = {}

	const node: PipeNode<I, O, C> = {
		fn: func,
		context: () => config.context?.() ?? ({} as any),
		schema: () => ({ ...config.schema?.(), ...meta }),
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
		context: () => gather(piper).context as any,
		meta: (schema) => {
			meta = { ...meta, ...schema }
			return piper
		},
		toJsonSchema: (schema = {}) => {
			const { nodes } = gather(piper)
			return nodes.reduce((acc, cur) => ({ ...acc, ...cur.schema() }), schema)
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
	const context = nodes.reduce((acc, cur) => ({ ...acc, ...cur.context() }), {}) as Context<any>
	return { nodes, context }
}

export function makeBranchPipe<P extends Pipe<any, any, any>, I, O, C>(
	branch: P,
	fn: PipeFn<I, O, C>,
	config: {
		context: (context: Context<C>) => Context<C>
		schema: (schema: JsonSchemaBuilder) => JsonSchemaBuilder
	},
) {
	return pipe(fn, {
		...config,
		context: () => config.context(branch.context() as any),
		schema: () => ({ ...config.schema(branch.node.schema()) }),
	})
}
