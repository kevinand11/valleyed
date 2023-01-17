import Mimes from './mimes.json'
import { isInvalid, isValid, makeRule } from '../utils/rules'

export const fileMimes = Object.keys(Mimes)
export const videoMimeTypes = fileMimes.filter((mime) => mime.startsWith('video/'))
export const audioMimeTypes = fileMimes.filter((mime) => mime.startsWith('audio/'))
export const imageMimeTypes = fileMimes.filter((mime) => mime.startsWith('image/'))

export const isImage = <Type> (error = 'is not a recognized image file') => makeRule<Type>((file) => {
	//@ts-ignore
	if (imageMimeTypes.includes(file?.type)) return isValid()
	return isInvalid(error)
})

export const isAudio = <Type> (error = 'is not a recognized audio file') => makeRule<Type>((file) => {
	//@ts-ignore
	if (audioMimeTypes.includes(file?.type)) return isValid()
	return isInvalid(error)
})

export const isVideo = <Type> (error = 'is not a recognized video file') => makeRule<Type>((file) => {
	//@ts-ignore
	if (videoMimeTypes.includes(file?.type)) return isValid()
	return isInvalid(error)
})

export const isFile = <Type> (error = 'is not a recognized file') => makeRule<Type>((file) => {
	//@ts-ignore
	if (fileMimes.includes(file?.type)) return isValid()
	return isInvalid(error)
})