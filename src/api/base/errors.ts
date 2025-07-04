type PipeErrorMessage = { message: string; path?: string; value: unknown }

function formatError(message: PipeErrorMessage) {
	return `${message.path ? `${message.path}: ` : ''}${message.message}`
}

export class PipeError extends Error {
	constructor(
		public messages: PipeErrorMessage[],
		cause?: unknown,
	) {
		const message = messages[0]
		super(message ? formatError(message) : 'Pipe validation error', { cause })
	}

	get valid(): false {
		return false
	}

	toString() {
		return this.messages.map(formatError).join('\n')
	}

	static root(message: string, value: unknown, path: string | undefined, cause?: unknown) {
		return new PipeError([{ message, path, value }], cause)
	}

	static rootFrom(errors: PipeError[]) {
		return new PipeError(errors.flatMap((error) => error.messages))
	}

	static path(path: PropertyKey, error: PipeError) {
		return new PipeError(
			error.messages.map((message) => ({ ...message, path: `${path.toString()}${message.path ? `.${message.path}` : ''}` })),
			error.cause,
		)
	}
}
