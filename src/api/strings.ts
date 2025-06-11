import { pipe, PipeError } from './base'
import * as fns from '../utils/functions'
import { emailRegex, urlRegex } from '../utils/regexes'

export const email = (err = 'is not a valid email') =>
	pipe<string, string, any>(
		(input) => {
			if (emailRegex.test(input)) return input
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ format: 'email' }) },
	)

export const url = (err = 'is not a valid url') =>
	pipe<string, string, any>(
		(input) => {
			if (urlRegex().test(input)) return input
			throw PipeError.root(err, input)
		},
		{ schema: () => ({ format: 'uri' }) },
	)

export const asTrim = () => pipe<string, string, any>((input) => input.trim(), {})

export const asLower = () => pipe<string, string, any>((input) => input.toLowerCase(), {})

export const asUpper = () => pipe<string, string, any>((input) => input.toUpperCase(), {})

export const asCapitalize = () => pipe<string, string, any>((input) => fns.capitalize(input), {})

export const asStrippedHTML = () => pipe<string, string, any>((input) => fns.stripHTML(input), {})

export const asSliced = (length: number) => pipe<string, string, any>((input) => fns.trimToLength(input, length), {})
