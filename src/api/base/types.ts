import { StandardSchemaV1 } from '@standard-schema/spec'

import { PipeError } from './errors'
import { JsonSchema } from '../../utils/types'

export type PipeFn<I, O = I, C = any> = (input: I, context: Context<C>) => O
export type PipeInput<T> = T extends Pipe<infer I, any, any> ? I : never
export type PipeOutput<T> = T extends Pipe<any, infer O, any> ? O : never
export type PipeContext<T> = T extends Pipe<any, any, infer C> ? C : never
export type Context<C> = C & {
	optional?: boolean
	objectPipes?: Record<string, Pipe<any, any, any>>
}
export type PipeMeta = Pick<JsonSchema, 'title' | 'description' | 'examples' | 'default'>
export type JsonSchemaBuilder = JsonSchema

export type Entry<I, O, C> = Pipe<I, O, C> | PipeFn<I, O, C>
type PipeChain<I, O, C> = {
	<T1>(fn1: Entry<O, T1, C>): Pipe<I, T1, C>
	<T1, T2>(fn1: Entry<O, T1, C>, fn2: Entry<T1, T2, C>): Pipe<I, T2, C>
	<T1, T2, T3>(fn1: Entry<O, T1, C>, fn2: Entry<T1, T2, C>, f3: Entry<T2, T3, C>): Pipe<I, T3, C>
	<T1, T2, T3, T4>(fn1: Entry<O, T1, C>, fn2: Entry<T1, T2, C>, f3: Entry<T2, T3, C>, f4: Entry<T3, T4, C>): Pipe<I, T4, C>
	<T1, T2, T3, T4, T5>(
		fn1: Entry<O, T1, C>,
		fn2: Entry<T1, T2, C>,
		f3: Entry<T2, T3, C>,
		f4: Entry<T3, T4, C>,
		f5: Entry<T4, T5, C>,
	): Pipe<I, T5, C>
	<T1, T2, T3, T4, T5, T6>(
		fn1: Entry<O, T1, C>,
		fn2: Entry<T1, T2, C>,
		f3: Entry<T2, T3, C>,
		f4: Entry<T3, T4, C>,
		f5: Entry<T4, T5, C>,
		f6: Entry<T5, T6, C>,
	): Pipe<I, T6, C>
	<T1, T2, T3, T4, T5, T6, T7>(
		fn1: Entry<O, T1, C>,
		fn2: Entry<T1, T2, C>,
		f3: Entry<T2, T3, C>,
		f4: Entry<T3, T4, C>,
		f5: Entry<T4, T5, C>,
		f6: Entry<T5, T6, C>,
		f7: Entry<T6, T7, C>,
	): Pipe<I, T7, C>
	<T1, T2, T3, T4, T5, T6, T7, T8>(
		fn1: Entry<O, T1, C>,
		fn2: Entry<T1, T2, C>,
		f3: Entry<T2, T3, C>,
		f4: Entry<T3, T4, C>,
		f5: Entry<T4, T5, C>,
		f6: Entry<T5, T6, C>,
		f7: Entry<T6, T7, C>,
		f8: Entry<T7, T8, C>,
	): Pipe<I, T8, C>
	<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
		fn1: Entry<O, T1, C>,
		fn2: Entry<T1, T2, C>,
		f3: Entry<T2, T3, C>,
		f4: Entry<T3, T4, C>,
		f5: Entry<T4, T5, C>,
		f6: Entry<T5, T6, C>,
		f7: Entry<T6, T7, C>,
		f8: Entry<T7, T8, C>,
		f9: Entry<T8, T9, C>,
	): Pipe<I, T9, C>
	<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
		fn1: Entry<O, T1, C>,
		fn2: Entry<T1, T2, C>,
		f3: Entry<T2, T3, C>,
		f4: Entry<T3, T4, C>,
		f5: Entry<T4, T5, C>,
		f6: Entry<T5, T6, C>,
		f7: Entry<T6, T7, C>,
		f8: Entry<T7, T8, C>,
		f9: Entry<T8, T9, C>,
		f10: Entry<T9, T10, C>,
	): Pipe<I, T10, C>
}

export interface Pipe<I, O, C> extends StandardSchemaV1<I, O> {
	readonly node: PipeNode
	prev?: Pipe<any, any, any>
	pipe: PipeChain<I, O, C>
	parse(input: unknown): O
	safeParse(input: unknown): { value: O; valid: true } | { error: PipeError; valid: false }
	context(): Context<C>
	meta(schema: PipeMeta): Pipe<I, O, C>
	toJsonSchema(schema?: JsonSchema): JsonSchema
}

export type PipeNode = {
	fn: PipeFn<any, any, any>
	context: () => Context<any>
	schema: () => JsonSchema
}
