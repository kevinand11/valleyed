import { pipe, PipeError } from './base'

export interface File {
	type: string
}

const isFile = (v: unknown): v is File => typeof v === 'object' && !!v && 'type' in v
const isMimeType = (str: string) => /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/.test(str)

export const file = <T extends File>(err = 'is not a recognized file') =>
	pipe<T>(
		(input) => {
			if (isFile(input) && isMimeType(input.type)) return input
			throw PipeError.root(err, input)
		},
		{ schema: { type: 'string', format: 'binary' } },
	)

export const image = <T extends File>(err = 'is not a recognized image file') =>
	pipe<T>((input) => {
		if (isFile(input) && isMimeType(input.type) && input.type.startsWith('image/')) return input
		throw PipeError.root(err, input)
	})

export const audio = <T extends File>(err = 'is not a recognized audio file') =>
	pipe<T>((input) => {
		if (isFile(input) && isMimeType(input.type) && input.type.startsWith('audio/')) return input
		throw PipeError.root(err, input)
	})

export const video = <T extends File>(err = 'is not a recognized video file') =>
	pipe<T>((input) => {
		if (isFile(input) && isMimeType(input.type) && input.type.startsWith('video/')) return input
		throw PipeError.root(err, input)
	})

export const fileType = <T extends File>(types: string | string[], err = 'is not a supported file') =>
	pipe<T>((input) => {
		if (isFile(input) && isMimeType(input.type)) {
			const fileTypes = Array.isArray(types) ? types : [types]
			if (fileTypes.some((type) => input.type === type)) return input
		}
		throw PipeError.root(err, input)
	})
