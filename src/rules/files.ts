import { isInvalid, isValid } from '../utils/rules'
import Mimes from './mimes.json'

const videoTypes = Object.keys(Mimes).filter((mime) => mime.startsWith('video/'))
const audioTypes = Object.keys(Mimes).filter((mime) => mime.startsWith('audio/'))
const imageTypes = Object.keys(Mimes).filter((mime) => mime.startsWith('image/'))

export const isImage = <Type> (file: Type, error = 'is not a valid image') => {
	if (!isFile(file).valid) return isInvalid(error)
	//@ts-ignore
	if (imageTypes.includes(file.type)) return isValid()
	return isInvalid(error)
}

export const isAudio = <Type> (file: Type, error = 'is not a recognized audio extension') => {
	if (!isFile(file).valid) return isInvalid(error)
	//@ts-ignore
	if (audioTypes.includes(file.type)) return isValid()
	return isInvalid(error)
}

export const isVideo = <Type> (file: Type, error = 'is not a recognized video extension') => {
	if (!isFile(file).valid) return isInvalid(error)
	//@ts-ignore
	if (videoTypes.includes(file.type)) return isValid()
	return isInvalid(error)
}

export const isFile = <Type> (file: Type, error = 'is not a recognized file extension') => {
	//@ts-ignore
	if (file?.type && Mimes[file.type]) return isValid()
	return isInvalid(error)
}