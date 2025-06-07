import { makePipe, PipeError } from './base'
import Mimes from '../mimes.json'

export interface File {
	type: string
}

export const fileMimeTypes = Object.keys(Mimes)
export const videoMimeTypes = fileMimeTypes.filter((mime) => mime.startsWith('video/'))
export const audioMimeTypes = fileMimeTypes.filter((mime) => mime.startsWith('audio/'))
export const imageMimeTypes = fileMimeTypes.filter((mime) => mime.startsWith('image/'))

const isFile = (v: unknown): v is File => typeof v === 'object' && !!v && 'type' in v

export const file = (err = 'is not a recognized file') =>
	makePipe<File>(
		(input) => {
			const validInput = isFile(input)
			if (validInput && fileMimeTypes.includes(input.type)) return input
			throw new PipeError([err], input)
		},
		{},
		(schema) => ({ ...schema, type: 'string', format: 'binary' }),
	)

export const image = (err = 'is not a recognized image file') =>
	makePipe<File>((input) => {
		if (isFile(input) && imageMimeTypes.includes(input.type)) return input
		throw new PipeError([err], input)
	}, {})

export const audio = (err = 'is not a recognized audio file') =>
	makePipe<File>((input) => {
		if (isFile(input) && audioMimeTypes.includes(input.type)) return input
		throw new PipeError([err], input)
	}, {})

export const video = (err = 'is not a recognized video file') =>
	makePipe<File>((input) => {
		if (isFile(input) && videoMimeTypes.includes(input.type)) return input
		throw new PipeError([err], input)
	}, {})
