import { Prettify } from '../utils/types'

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
	pipe<T>(fn: Pipe<O, T, C> | PipeFn<O, T>): Pipe<I, T, C>
	parse(input: unknown): O
	safeParse(input: unknown): { value: O; valid: true } | { error: PipeError; valid: false }
}

export function makePipe<I, O = I, C extends object = object>(func: PipeFn<I, O>, context: C): Pipe<I, O, C> {
	const flow: PipeFn<any, any>[] = [func]

	const piper: Pipe<I, O, C> = {
		context,
		get flow() {
			return flow
		},
		pipe: (fn) => {
			flow.push(...('flow' in fn ? fn.flow : [fn]))
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
	}
	return piper
}
