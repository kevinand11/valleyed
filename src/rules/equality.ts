import { extractTextFromHTML } from '../santizers'
import { isInvalid, isValid } from '../utils/rules'

export const isLongerThan = (length: number, value: string) => {
	if((value?.trim() ?? '').length >= length) return isValid()
	return isInvalid(`must contain at least ${length} characters`)
}

export const isNotLongerThan = (length: number, value: string) => {
	if((value?.trim() ?? '').length <= length) return isValid()
	return isInvalid(`must contain not more than ${length} characters`)
}

export const isExtractedHTMLLongerThan = (length: number, value: string) => {
	return isLongerThan(length, extractTextFromHTML(value ?? ''))
}

export const hasMoreThan = (length: number, value: any[]) => {
	if(value?.length >= length) return isValid
	return isInvalid(`must contain at least ${length} items`)
}

export const hasLessThan = (length: number, value: any[]) => {
	if(value?.length <= length) return isValid()
	return isInvalid(`must contain not more than ${length} items`)
}

export const isEqualTo = (value: any, compare: any) => {
	if(value === compare) return isValid()
	return isInvalid('doesn\'t match')
}

export const isMoreThan = (value: number, compare: number) => {
	if(value > compare) return isValid()
	return isInvalid(`must be greater than ${compare}`)
}

export const isLessThan = (value: number, compare: number) => {
	if(value < compare) return isValid()
	return isInvalid(`must be less than ${compare}`)
}
