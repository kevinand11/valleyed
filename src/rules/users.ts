import { isInvalid, isValid } from '../utils/rules'
import urlRegex from 'url-regex-safe'

export const isEmail = (value: string, error = 'is not a valid email') => {
	const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	return emailRegex.test(value) ? isValid() : isInvalid(error)
}

export const URLRegex = urlRegex()
export const isUrl = (value: string, error = 'is not a valid url') => {
	return URLRegex.test(value) ? isValid() : isInvalid(error)
}