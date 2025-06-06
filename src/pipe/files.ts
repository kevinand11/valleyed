import { makePipeFn, PipeError } from './base'
import Mimes from '../rules/mimes.json'
import type { File } from '../utils/types'

export const fileMimeTypes = Object.keys(Mimes)
export const videoMimeTypes = fileMimeTypes.filter((mime) => mime.startsWith('video/'))
export const audioMimeTypes = fileMimeTypes.filter((mime) => mime.startsWith('audio/'))
export const imageMimeTypes = fileMimeTypes.filter((mime) => mime.startsWith('image/'))

const isFile = (v: unknown): v is File => typeof v === 'object' && !!v && 'type' in v

export const file = (err = 'is not a recognized file') =>
	makePipeFn<unknown, File>((input) => {
		const validInput = isFile(input)
		if (validInput && fileMimeTypes.includes(input.type)) return input
		throw new PipeError([err], input)
	})

export const image = (err = 'is not a recognized image file') =>
	makePipeFn<unknown, File>((input) => {
		if (isFile(input) && imageMimeTypes.includes(input.type)) return input
		throw new PipeError([err], input)
	})

export const audio = (err = 'is not a recognized audio file') =>
	makePipeFn<unknown, File>((input) => {
		if (isFile(input) && audioMimeTypes.includes(input.type)) return input
		throw new PipeError([err], input)
	})

export const video = (err = 'is not a recognized video file') =>
	makePipeFn<unknown, File>((input) => {
		if (isFile(input) && videoMimeTypes.includes(input.type)) return input
		throw new PipeError([err], input)
	})
