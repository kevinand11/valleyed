import { isInvalid, isValid } from '../utils/rules'
import Mimes from './mimes.json'

export const fileMimes = Object.keys(Mimes)
export const videoMimeTypes = fileMimes.filter((mime) => mime.startsWith('video/'))
export const audioMimeTypes = fileMimes.filter((mime) => mime.startsWith('audio/'))
export const imageMimeTypes = fileMimes.filter((mime) => mime.startsWith('image/'))

export const isImage = <Type> (file: Type, error = 'is not a recognized image file') => {
	//@ts-ignore
	if (imageMimeTypes.includes(file?.type)) return isValid()
	return isInvalid(error)
}

export const isAudio = <Type> (file: Type, error = 'is not a recognized audio file') => {
	//@ts-ignore
	if (audioMimeTypes.includes(file?.type)) return isValid()
	return isInvalid(error)
}

export const isVideo = <Type> (file: Type, error = 'is not a recognized video file') => {
	//@ts-ignore
	if (videoMimeTypes.includes(file?.type)) return isValid()
	return isInvalid(error)
}

export const isFile = <Type> (file: Type, error = 'is not a recognized file extension') => {
	//@ts-ignore
	if (fileMimes.includes(file?.type)) return isValid()
	return isInvalid(error)
}