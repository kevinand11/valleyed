function formatError(message: { message: string; path?: string }) {
	return `${message.path ? `${message.path}: ` : ''}${message.message}`
}

export class PipeError extends Error {
	constructor(
		public messages: { message: string; path?: string }[],
		readonly value: unknown,
		cause?: unknown,
	) {
		const message = messages[0]
		super(message ? formatError(message) : 'Pipe validation error', { cause })
	}

	toString() {
		return this.messages.map(formatError).join('\n')
	}

	static root(message: string, value: unknown, cause?: unknown) {
		return new PipeError([{ message }], value, cause)
	}

	static rootFrom(errors: PipeError[], value: unknown, cause?: unknown) {
		return new PipeError(
			errors.flatMap((error) => error.messages),
			value,
			cause,
		)
	}

	static path(path: PropertyKey, error: PipeError, value: unknown, cause?: unknown) {
		return new PipeError(
			error.messages.map((message) => ({ ...message, path: `${path.toString()}${message.path ? `.${message.path}` : ''}` })),
			value,
			cause,
		)
	}
}
