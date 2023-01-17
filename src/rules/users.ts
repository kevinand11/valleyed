import urlRegex from 'url-regex-safe'
import { isInvalid, isValid, makeRule } from '../utils/rules'

export const isEmail = (error = 'is not a valid email') => makeRule<string>((value) => {
	const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	return emailRegex.test(value) ? isValid() : isInvalid(error)
})

export const URLRegex = urlRegex()
export const isUrl = (error = 'is not a valid url') => makeRule<string>((value) => {
	return URLRegex.test(value) ? isValid() : isInvalid(error)
})