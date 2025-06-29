import { Pipe, PipeError } from './base'
import { assert, pipe } from './base/pipes'
import * as fns from '../utils/functions'
import { emailRegex, urlRegex } from '../utils/regexes'

export const email = (err = 'is not a valid email') =>
	pipe<string, string, any>(
		(input) => {
			if (emailRegex.test(input)) return input
			throw PipeError.root(err, input)
		},
		{
			compile: ({ input, context }) =>
				`${context}.emailRegex.test(${input}) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
			context: () => ({ emailRegex, PipeError }),
			schema: () => ({ format: 'email' }),
		},
	)

export const url = (err = 'is not a valid url') =>
	pipe<string, string, any>(
		(input) => {
			if (urlRegex.test(input)) return input
			throw PipeError.root(err, input)
		},
		{
			compile: ({ input, context }) =>
				`${context}.urlRegex.test(${input}) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
			context: () => ({ urlRegex, PipeError }),
			schema: () => ({ format: 'uri' }),
		},
	)

export const withStrippedHtml = (branch: Pipe<string, string, any>) =>
	pipe<string, string, any>(
		(input) => {
			const stripped = fns.stripHTML(input)
			assert(branch, stripped)
			return input
		},
		{
			compile: ({ input, context }) =>
				`(() => {
					const stripped = ${context}.stripHTML(${input});
					${context}.assert(${context}.branch, stripped);
					return ${input};
				})()`,
			context: () => ({ ...branch.context(), stripHTML: fns.stripHTML, assert, PipeError, branch }),
			schema: (s) => s,
		},
	)

export const asTrimmed = () =>
	pipe<string, string, any>((input) => input.trim(), {
		compile: ({ input }) => `${input}.trim()`,
	})

export const asLowercased = () =>
	pipe<string, string, any>((input) => input.toLowerCase(), {
		compile: ({ input }) => `${input}.toLowerCase()`,
	})

export const asUppercased = () =>
	pipe<string, string, any>((input) => input.toUpperCase(), {
		compile: ({ input }) => `${input}.toUpperCase()`,
	})

export const asCapitalized = () =>
	pipe<string, string, any>((input) => fns.capitalize(input), {
		compile: ({ input, context }) => `${context}.capitalize(${input})`,
		context: () => ({ capitalize: fns.capitalize }),
	})

export const asStrippedHtml = () =>
	pipe<string, string, any>((input) => fns.stripHTML(input), {
		compile: ({ input, context }) => `${context}.stripHTML(${input})`,
		context: () => ({ stripHTML: fns.stripHTML }),
	})

export const asSliced = (length: number) =>
	pipe<string, string, any>((input) => fns.trimToLength(input, length), {
		compile: ({ input, context }) => `${context}.trimToLength(${input}, ${length})`,
		context: () => ({ trimToLength: fns.trimToLength }),
	})
