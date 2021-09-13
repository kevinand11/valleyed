import { isInvalid, isValid } from '../utils/rules'

export function isImage<Type> (file: Type) {
	//@ts-ignore
	if (file?.type?.startsWith('image/')) return isValid()
	return isInvalid('is not an image')
}

export function isFile<Type> (file: Type) {
	//@ts-ignore
	if (file?.type) return isValid()
	return isInvalid('is not a valid file')
}

export function containsOnlyFiles<Type> (files: Type[]) {
	if (files?.every((file) => isFile(file).valid)) return isValid()
	return isInvalid('contains invalid files')
}
