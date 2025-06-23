import { makeBranchPipe, Pipe, pipe, PipeError } from './base'
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

export const withStrippedHtml = (pipe: Pipe<string, string, any>) =>
	makeBranchPipe<Pipe<string, string, any>, string, string, any>(
		pipe,
		(input) => {
			const stripped = fns.stripHTML(input)
			pipe.parse(stripped)
			return input
		},
		{
			context: (c) => c,
			schema: (s) => s,
		},
	)

export const asTrimmed = () => pipe<string, string, any>((input) => input.trim(), {})

export const asLowercased = () => pipe<string, string, any>((input) => input.toLowerCase(), {})

export const asUppercased = () => pipe<string, string, any>((input) => input.toUpperCase(), {})

export const asCapitalized = () => pipe<string, string, any>((input) => fns.capitalize(input), {})

export const asStrippedHtml = () => pipe<string, string, any>((input) => fns.stripHTML(input), {})

export const asSliced = (length: number) => pipe<string, string, any>((input) => fns.trimToLength(input, length), {})
