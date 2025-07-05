import { PipeErrorHandler } from './types'

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

	static root(message: string, value: unknown, path?: string, cause?: unknown) {
		return new PipeError([{ message, path, value }], cause)
	}

	static rootFrom(errors: PipeError[]) {
		return new PipeError(errors.flatMap((error) => error.messages))
	}

	static path(path: PropertyKey, error: PipeError) {
		if (!path) return error
		return new PipeError(
			error.messages.map((message) => ({ ...message, path: `${path.toString()}${message.path ? `.${message.path}` : ''}` })),
			error.cause,
		)
	}
}

export function createErrorHandler(input: string, type: 'return' | 'throw' | 'assign'): PipeErrorHandler {
	return (errorCondition, error, rest = []) => {
		switch (type) {
			case 'return':
				return [`if (${errorCondition}) return ${error}`, ...rest]
			case 'throw':
				return [`if (${errorCondition}) throw ${error}`, ...rest]
			case 'assign':
				return [`if (${errorCondition}) ${input} = ${error}`, `else {`, ...rest.map((l) => `	${l}`), `}`]
			default:
				throw new Error(`Unknown error handling type: ${type satisfies never}`)
		}
	}
}
