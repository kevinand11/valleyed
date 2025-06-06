export type PipeFn<I, O = I> = (input: I) => O
export type PipeInput<T> = T extends Pipe<infer I, any> ? I : never
export type PipeOutput<T> = T extends Pipe<any, infer O> ? O : never

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

export type Pipe<I, O = I> = {
	pipe<T>(fn: PipeFn<O, T>): Pipe<I, T>
	parse(input: unknown): O
	safeParse(input: unknown): { value: O } | { error: PipeError }
}

export function pipe<I, O = I>(fn: PipeFn<I, O>) {
	const fns: PipeFn<any, any>[] = [fn]

	const piper: Pipe<I, O> = {
		pipe: (fn) => {
			fns.push(fn)
			return piper as any
		},
		parse: (input) => fns.reduce((acc, fn) => fn(acc), input as any),
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

export function makePipeFn<I, O = I>(func: PipeFn<I, O>): PipeFn<I, O> {
	return (val: I) => func(val)
}
