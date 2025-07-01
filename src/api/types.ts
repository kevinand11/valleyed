import { PipeError } from './base'
import { standard } from './base/pipes'

const isString = (err = 'is not a string') =>
	standard<string, string>(
		({ input, context }) =>
			`typeof ${input} === 'string' || ${input}?.constructor?.name === 'String' ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
		{
			context: () => ({ PipeError }),
			schema: () => ({ type: 'string' }),
		},
	)

const isNumber = (err = 'is not a number') =>
	standard<number, number>(
		({ input, context }) =>
			`typeof ${input} === 'number' && !isNaN(${input}) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
		{
			context: () => ({ PipeError }),
			schema: () => ({ type: 'number' }),
		},
	)

const isBoolean = (err = 'is not a boolean') =>
	standard<boolean, boolean>(
		({ input, context }) => `typeof ${input} === 'boolean' ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
		{
			context: () => ({ PipeError }),
			schema: () => ({ type: 'boolean' }),
		},
	)

const isNull = (err = 'is not null') =>
	standard<null, null>(({ input, context }) => `(${input} === null) ? ${input} : ${context}.PipeError.root('${err}', ${input})`, {
		context: () => ({ PipeError }),
		schema: () => ({ type: 'null' }),
	})

const isUndefined = (err = 'is not undefined') =>
	standard<undefined, undefined>(
		({ input, context }) => `(${input} === undefined) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
		{
			context: () => ({ PipeError }),
			schema: () => ({ type: 'undefined' }),
		},
	)

const isAny = <T>() => standard<T, T>(({ input }) => input)

const isInstanceOf = <T>(classDef: abstract new (...args: any[]) => T, err = `is not an instance of ${classDef.name}`) =>
	standard<T, T>(
		({ input, context }) =>
			`(${input}?.constructor === ${context}.classDef || ${input} instanceof ${context}.classDef) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
		{
			context: () => ({ PipeError, classDef }),
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
