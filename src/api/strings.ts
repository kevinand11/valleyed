import { Pipe, PipeError } from './base'
import { compileToAssert, standard } from './base/pipes'
import * as fns from '../utils/functions'
import { emailRegex, urlRegex } from '../utils/regexes'

export const email = (err = 'is not a valid email') =>
	standard<string, string>(
		({ input, context }) => `${context}.emailRegex.test(${input}) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
		{
			context: () => ({ emailRegex, PipeError }),
			schema: () => ({ format: 'email' }),
		},
	)

export const url = (err = 'is not a valid url') =>
	standard<string, string>(
		({ input, context }) => `${context}.urlRegex.test(${input}) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
		{
			context: () => ({ urlRegex, PipeError }),
			schema: () => ({ format: 'uri' }),
		},
	)

export const withStrippedHtml = (branch: Pipe<string, string>) =>
	standard<string, string>(
		({ input, context }, rootContext) => `(() => {
	const stripped = ${context}.stripHTML(${input});
	${compileToAssert(branch, rootContext, 'stripped', context)};
	return ${input};
})()`,
		{
			context: () => ({ ...branch.context(), stripHTML: fns.stripHTML }),
			schema: (s) => s,
		},
	)

export const asTrimmed = () => standard<string, string>(({ input }) => `${input}.trim()`)

export const asLowercased = () => standard<string, string>(({ input }) => `${input}.toLowerCase()`)

export const asUppercased = () => standard<string, string>(({ input }) => `${input}.toUpperCase()`)

export const asCapitalized = () =>
	standard<string, string>(({ input, context }) => `${context}.capitalize(${input})`, {
		context: () => ({ capitalize: fns.capitalize }),
	})

export const asStrippedHtml = () =>
	standard<string, string>(({ input, context }) => `${context}.stripHTML(${input})`, {
		context: () => ({ stripHTML: fns.stripHTML }),
	})

export const asSliced = (length: number) =>
	standard<string, string>(({ input, context }) => `${context}.trimToLength(${input}, ${length})`, {
		context: () => ({ trimToLength: fns.trimToLength }),
	})
