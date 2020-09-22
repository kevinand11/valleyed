import { isInvalid, isValid } from '../utils/rules'

export const isImage = (file: any) => {
	if(file?.type?.startsWith('image/')) return isValid()
	return isInvalid('is not an image')
}

export const isFileOrUndefined = (file: any) => {
	if(file === undefined) return isValid()
	return isFile(file)
}

export const isFile = (file: any) => {
	if(file?.type) return isValid()
	return isInvalid('is not a valid file')
}

export const containsOnlyMedia = (files: any[]) => {
	if(files.every((file) => isFile(file).valid)) return isValid()
	return isInvalid('contains invalid files')
}
