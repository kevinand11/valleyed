import Mimes from './mimes.json'
import { isInvalid, isValid, makeRule } from '../utils/rules'

export const fileMimeTypes = Object.keys(Mimes)
export const videoMimeTypes = fileMimeTypes.filter((mime) => mime.startsWith('video/'))
export const audioMimeTypes = fileMimeTypes.filter((mime) => mime.startsWith('audio/'))
export const imageMimeTypes = fileMimeTypes.filter((mime) => mime.startsWith('image/'))

export type File = { type: string, [k: string]: any }

export const isImage = (error = 'is not a recognized image file') => makeRule<File>((file) => {
	//@ts-ignore
	if (imageMimeTypes.includes(file?.type)) return isValid(file)
	return isInvalid([error], file)
})

export const isAudio = (error = 'is not a recognized audio file') => makeRule<File>((file) => {
	//@ts-ignore
	if (audioMimeTypes.includes(file?.type)) return isValid(file)
	return isInvalid([error], file)
})

export const isVideo = (error = 'is not a recognized video file') => makeRule<File>((file) => {
	//@ts-ignore
	if (videoMimeTypes.includes(file?.type)) return isValid(file)
	return isInvalid([error], file)
})

export const isFile = (error = 'is not a recognized file') => makeRule<File>((file) => {
	//@ts-ignore
	if (fileMimeTypes.includes(file?.type)) return isValid(file)
	return isInvalid([error], file)
})