import { isInvalid, isValid, makeRule } from '../utils/rules'
import Mimes from './mimes.json'

export const fileMimeTypes = Object.keys(Mimes)
export const videoMimeTypes = fileMimeTypes.filter((mime) => mime.startsWith('video/'))
export const audioMimeTypes = fileMimeTypes.filter((mime) => mime.startsWith('audio/'))
export const imageMimeTypes = fileMimeTypes.filter((mime) => mime.startsWith('image/'))

export const isImage = (error = 'is not a recognized image file') => makeRule<any>((file) => {
	const val = file as any
	if (imageMimeTypes.includes(val?.type)) return isValid(val)
	return isInvalid([error], val)
})

export const isAudio = (error = 'is not a recognized audio file') => makeRule<any>((file) => {
	const val = file as any
	if (audioMimeTypes.includes(val?.type)) return isValid(val)
	return isInvalid([error], val)
})

export const isVideo = (error = 'is not a recognized video file') => makeRule<any>((file) => {
	const val = file as any
	if (videoMimeTypes.includes(val?.type)) return isValid(val)
	return isInvalid([error], val)
})

export const isFile = (error = 'is not a recognized file') => makeRule<any>((file) => {
	const val = file as any
	if (fileMimeTypes.includes(val?.type)) return isValid(val)
	return isInvalid([error], val)
})