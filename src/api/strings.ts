import { Pipe } from './base'
import { compileNested, context, schema, standard } from './base/pipes'
import { capitalize, getRandomValue, stripHTML, trimToLength } from '../utils/functions'
import { emailRegex, urlRegex } from '../utils/regexes'

export const email = (err = 'is not a valid email') =>
	standard<string, string>(
		({ input, context }) => [`if (!${context}.emailRegex.test(${input})) return PipeError.root('${err}', ${input})`],
		{
			context: { emailRegex },
			schema: () => ({ format: 'email' }),
		},
	)

export const url = (err = 'is not a valid url') =>
	standard<string, string>(
		({ input, context }) => [`if (!${context}.urlRegex.test(${input})) return PipeError.root('${err}', ${input})`],
		{
			context: { urlRegex },
			schema: () => ({ format: 'uri' }),
		},
	)

export const withStrippedHtml = (branch: Pipe<string, string>) => {
	const varname = `stripped_${getRandomValue()}`
	return standard<string, string>(
		({ input, context }, rootContext) => [
			`let ${varname} = ${context}.stripHTML(${input});`,
			...compileNested({ pipe: branch, rootContext, input: varname, context, prefix: `${varname} =` }),
			`if (${varname} instanceof PipeError) return ${varname}`,
		],
		{
			context: { ...context(branch), stripHTML },
			schema: () => schema(branch),
		},
	)
}

export const asTrimmed = () => standard<string, string>(({ input }) => [`${input} = ${input}.trim()`])

export const asLowercased = () => standard<string, string>(({ input }) => [`${input} = ${input}.toLowerCase()`])

export const asUppercased = () => standard<string, string>(({ input }) => [`${input} = ${input}.toUpperCase()`])

export const asCapitalized = () =>
	standard<string, string>(({ input, context }) => [`${input} = ${context}.capitalize(${input})`], {
		context: { capitalize },
	})

export const asStrippedHtml = () =>
	standard<string, string>(({ input, context }) => [`${input} = ${context}.stripHTML(${input})`], {
		context: { stripHTML },
	})

export const asSliced = (length: number) =>
	standard<string, string>(({ input, context }) => [`${input} = ${context}.trimToLength(${input}, ${length})`], {
		context: { trimToLength },
	})
