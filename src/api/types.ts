import { PipeError } from './base'
import { standard } from './base/pipes'

const isString = (err = 'is not a string') =>
	standard<string, string>(
		({ input, context }) => [
			`if (typeof ${input} !== 'string' && ${input}?.constructor?.name !== 'String') throw ${context}.PipeError.root('${err}', ${input})`,
		],
		{
			context: { PipeError },
			schema: () => ({ type: 'string' }),
		},
	)

const isNumber = (err = 'is not a number') =>
	standard<number, number>(
		({ input, context }) => [
			`if (typeof ${input} !== 'number' || isNaN(${input})) throw ${context}.PipeError.root('${err}', ${input})`,
		],
		{
			context: { PipeError },
			schema: () => ({ type: 'number' }),
		},
	)

const isBoolean = (err = 'is not a boolean') =>
	standard<boolean, boolean>(
		({ input, context }) => [`if (typeof ${input} !== 'boolean') throw ${context}.PipeError.root('${err}', ${input})`],
		{
			context: { PipeError },
			schema: () => ({ type: 'boolean' }),
		},
	)

const isNull = (err = 'is not null') =>
	standard<null, null>(({ input, context }) => [`if (${input} !== null) throw ${context}.PipeError.root('${err}', ${input})`], {
		context: { PipeError },
		schema: () => ({ type: 'null' }),
	})

const isUndefined = (err = 'is not undefined') =>
	standard<undefined, undefined>(
		({ input, context }) => [`if (${input} !== undefined) throw ${context}.PipeError.root('${err}', ${input})`],
		{
			context: { PipeError },
			schema: () => ({ type: 'undefined' }),
		},
	)

const isAny = <T>() => standard<T, T>(() => [])

const isInstanceOf = <T>(classDef: abstract new (...args: any[]) => T, err = `is not an instance of ${classDef.name}`) =>
	standard<T, T>(
		({ input, context }) => [
			`if (${input}?.constructor !== ${context}.classDef && !(${input} instanceof ${context}.classDef)) throw ${context}.PipeError.root('${err}', ${input})`,
		],
		{
			context: { PipeError, classDef },
		},
	)

export {
	isString as string,
	isNumber as number,
	isBoolean as boolean,
	isNull as null,
	isUndefined as undefined,
	isAny as any,
	isInstanceOf as instanceOf,
}
