type Arrayable<T> = T | T[]

function flatArray<T>(arr: Arrayable<T>): T[] {
	return Array.isArray(arr) ? arr : [arr]
}

function formatError(message: { message: string; path?: string }) {
	return `${message.path ? `${message.path}: ` : ''}${message.message}`
}

export class PipeError extends Error {
	private constructor(
		public messages: { message: string; path?: string }[],
		readonly value: unknown,
		readonly stopped: boolean,
		cause?: unknown,
	) {
		const message = messages[0]
		super(message ? formatError(message) : 'Pipe validation error', { cause })
	}

	toString() {
		return this.messages.map(formatError).join('\n')
	}

	static root(messages: Arrayable<string>, value: unknown, cause?: unknown) {
		return new PipeError(
			flatArray(messages).map((message) => ({ message })),
			value,
			false,
			cause,
		)
	}

	static rootFrom(errors: Arrayable<PipeError>, value: unknown, cause?: unknown) {
		return new PipeError(
			flatArray(errors).flatMap((error) => error.messages),
			value,
			false,
			cause,
		)
	}

	static path(path: PropertyKey, errors: Arrayable<PipeError>, value: unknown, cause?: unknown) {
		return new PipeError(
			flatArray(errors).flatMap((error) =>
				error.messages.map((message) => ({ ...message, path: `${path.toString()}${message.path ? `.${message.path}` : ''}` })),
			),
			value,
			false,
			cause,
		)
	}

	static stop(value: unknown) {
		return new PipeError([], value, true)
	}
}
