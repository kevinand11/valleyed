import { isInvalid, isValid } from '../utils/rules'

export function isImage<Type> (file: Type, error = 'is not a valid image') {
	//@ts-ignore
	if (file?.type?.startsWith('image/')) return isValid()
	return isInvalid(error)
}

export function isVideo<Type> (file: Type, error = 'is not a valid video') {
	//@ts-ignore
	if (file?.type?.startsWith('video/')) return isValid()
	return isInvalid(error)
}

export function isFile<Type> (file: Type, error = 'is not a valid file') {
	//@ts-ignore
	if (file?.type) return isValid()
	return isInvalid(error)
}

export function containsOnlyFiles<Type> (files: Type[], error = 'contains invalid files') {
	if (files?.every((file) => isFile(file).valid)) return isValid()
	return isInvalid(error)
}
