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

export const file = <T extends File>(err = 'is not a recognized file') =>
	makePipe<T>(
		(input) => {
			const validInput = isFile(input)
			if (validInput && fileMimeTypes.includes(input.type)) return input
			throw PipeError.root(err, input)
		},
		{},
		{ type: 'string', format: 'binary', contentMediaType: fileMimeTypes },
	)

export const image = <T extends File>(err = 'is not a recognized image file') =>
	makePipe<T>(
		(input) => {
			if (isFile(input) && imageMimeTypes.includes(input.type)) return input
			throw PipeError.root(err, input)
		},
		{},
		{ contentMediaType: imageMimeTypes },
	)

export const audio = <T extends File>(err = 'is not a recognized audio file') =>
	makePipe<T>(
		(input) => {
			if (isFile(input) && audioMimeTypes.includes(input.type)) return input
			throw PipeError.root(err, input)
		},
		{},
		{ contentMediaType: audioMimeTypes },
	)

export const video = <T extends File>(err = 'is not a recognized video file') =>
	makePipe<T>(
		(input) => {
			if (isFile(input) && videoMimeTypes.includes(input.type)) return input
			throw PipeError.root(err, input)
		},
		{},
		{ contentMediaType: videoMimeTypes },
	)
