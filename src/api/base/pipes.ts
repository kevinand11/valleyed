import { PipeError } from './errors'
import { PipeFn, Context, JsonSchemaBuilder, PipeMeta, Pipe, Entry, PipeNode, PipeOutput, PipeContext } from './types'
import { JsonSchema } from '../../utils/types'

function getLastPipe(pipe: Pipe<any, any, any>) {
	while (pipe.next) pipe = pipe.next
	return pipe
}

export function pipe<I, O, C>(
	func: PipeFn<I, O, C>,
	config: {
		context?: () => Context<C>
		schema?: () => JsonSchemaBuilder
	} = {},
): Pipe<I, O, C> {
	let meta: PipeMeta = {}

	const node: PipeNode = {
		fn: func,
		context: () => config.context?.() ?? {},
		schema: () => ({ ...config.schema?.(), ...meta }),
	}

	const piper: Pipe<I, O, C> = {
		node,
		pipe: (...entries: Entry<any, any, any>[]) => {
			entries.reduce<Pipe<any, any, any>>((acc, cur) => {
				const p = typeof cur === 'function' ? pipe(cur, config) : cur
				acc.next = p
				return getLastPipe(p)
			}, getLastPipe(piper))
			return piper
		},
		meta: (schema) => {
			meta = { ...meta, ...schema }
			return piper
		},
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

export function context<T extends Pipe<any, any, any>>(pipe: T): Context<PipeContext<T>> {
	return walk(pipe, {} as Context<PipeContext<T>>, (p, acc) => ({ ...acc, ...p.node.context() }))
}

export function assert<T extends Pipe<any, any, any>>(pipe: T, input: unknown): PipeOutput<T> {
	try {
		const cont = context(pipe)
		return walk(pipe, input as PipeOutput<T>, (p, acc) => p.node.fn(acc, cont))
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
	return walk(pipe, schema, (p, acc) => ({ ...acc, ...p.node.schema() }))
}

export function walk<T>(pipe: Pipe<any, any, any>, init: T, nodeFn: (cur: Pipe<any, any, any>, acc: T) => T) {
	let acc: T = init
	let current: Pipe<any, any, any> | undefined = pipe
	while (current) {
		acc = nodeFn(current, acc)
		current = current.next
	}
	return acc
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
		context: () => config.context(context(branch)),
		schema: () => ({ ...config.schema(schema(branch)) }),
	})
}
