export type PipeFn<I, O = I> = (input: I) => O
export type PipeInput<T> = T extends Pipe<infer I, any, any> ? I : never
export type PipeOutput<T> = T extends Pipe<any, infer O, any> ? O : never

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

export type Pipe<I, O = I, C = object> = {
	readonly context: C
	readonly flow: PipeFn<I, O>[]
	pipe<T>(fn: Pipe<O, T, C> | PipeFn<O, T>): Pipe<I, T, C>
	parse(input: unknown): O
	safeParse(input: unknown): { value: O } | { error: PipeError }
}

export function makePipe<I, O = I, C = object>(func: PipeFn<I, O>, context: C): Pipe<I, O, C> {
	const flow: PipeFn<any, any>[] = [func]

	const piper: Pipe<I, O, C> = {
		get flow() {
			return flow
		},
		context,
		pipe: (fn) => {
			flow.push(...('flow' in fn ? fn.flow : [fn]))
			return piper as any
		},
		parse: (input) => flow.reduce((acc, fn) => fn(acc), input as any),
		safeParse: (input) => {
			try {
				const value = piper.parse(input)
				return { value }
			} catch (error) {
				if (error instanceof PipeError) return { error }
				throw error
			}
		},
	}
	return piper
}
