import { isInvalid, isValid } from '../utils/rules'
import Mimes from './mimes.json'

const videoTypes = Object.keys(Mimes).filter((mime) => mime.startsWith('video/'))
const audioTypes = Object.keys(Mimes).filter((mime) => mime.startsWith('audio/'))
const imageTypes = Object.keys(Mimes).filter((mime) => mime.startsWith('image/'))

export function isImage<Type> (file: Type, error = 'is not a valid image') {
	if (!isFile(file).valid) return isInvalid(error)
	//@ts-ignore
	if (imageTypes.includes(file.type)) return isValid()
	return isInvalid(error)
}

export function isAudio<Type> (file: Type, error = 'is not a valid audio') {
	if (!isFile(file).valid) return isInvalid(error)
	//@ts-ignore
	if (audioTypes.includes(file.type)) return isValid()
	return isInvalid(error)
}

export function isVideo<Type> (file: Type, error = 'is not a valid video') {
	if (!isFile(file).valid) return isInvalid(error)
	//@ts-ignore
	if (videoTypes.includes(file.type)) return isValid()
	return isInvalid(error)
}

export function isFile<Type> (file: Type, error = 'is not a valid file') {
	//@ts-ignore
	if (file?.type && Mimes[file.type]) return isValid()
	return isInvalid(error)
}