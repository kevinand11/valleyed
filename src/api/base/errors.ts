import type { PipeErrorHandler } from './types'

type PipeErrorMessage = { message: string; path?: string; value: unknown }

function formatError(message: PipeErrorMessage) {
	return `${message.path ? `${message.path}: ` : ''}${message.message}`
}

export class PipeError {
	constructor(public messages: PipeErrorMessage[]) {}

	toString() {
		return this.messages.map(formatError).join('\n')
	}

	static root(message: string, value: unknown, path?: string) {
		return new PipeError([{ message, path, value }])
	}

	static rootFrom(errors: PipeError[]) {
		return new PipeError(errors.flatMap((error) => error.messages))
	}

	static path(path: PropertyKey, key: string, error: PipeError) {
		if (path === undefined || path === null) return error
		return new PipeError(
			error.messages.map((message) => ({
				...message,
				path: message.path
					?.split('.')
					.map((p) => (p == key ? path.toString() : p))
					.join('.'),
			})),
		)
	}

	static wrap(path: PropertyKey, error: PipeError) {
		if (path === undefined || path === null) return error
		return new PipeError(
			error.messages.map((message) => ({
				...message,
				path: [path.toString(), message.path].filter(Boolean).join('.'),
			})),
		)
	}
}

export function createErrorHandler(input: string, type: 'return' | 'throw' | 'assign'): PipeErrorHandler {
	const handler: PipeErrorHandler = Object.assign(
		(...args: Parameters<PipeErrorHandler>) =>
			(lines: string[]) => {
				switch (type) {
					case 'return':
					case 'throw':
						return [`if (${args[0]}) ${handler.format(args[1])}`, ...lines]
					case 'assign':
						return [
							`if (${args[0]}) ${handler.format(args[1])}`,
							...(lines.length ? [`else {`, ...lines.map((l) => `	${l}`), `}`] : []),
						]
					default:
						throw new Error(`Unknown error handling type: ${type satisfies never}`)
				}
			},
		{
			type,
			format: (error: string) => {
				switch (type) {
					case 'return':
						return `return ${error}`
					case 'throw':
						return `throw ${error}`
					case 'assign':
						return `${input} = ${error}`
					default:
						throw new Error(`Unknown error handling type: ${type satisfies never}`)
				}
			},
		},
	)

	return handler
}
