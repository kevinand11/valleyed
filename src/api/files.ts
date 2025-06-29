import { PipeError } from './base'
import { pipe } from './base/pipes'
import { execValueFunction, ValueFunction } from '../utils/functions'

export interface File {
	type: string
}

const isFile = (v: unknown): v is File => typeof v === 'object' && !!v && 'type' in v
const isMimeType = (str: string) => /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/.test(str)

export const file = <T extends File>(err = 'is not a recognized file') =>
	pipe<T, T, any>(
		(input) => {
			if (isFile(input) && isMimeType(input.type)) return input as T
			throw PipeError.root(err, input)
		},
		{
			compile: ({ input, context }) =>
				`(${context}.isFile(${input}) && ${context}.isMimeType(${input}.type)) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
			context: () => ({ isFile, isMimeType, PipeError }),
			schema: () => ({ type: 'string', format: 'binary' }),
		},
	)

export const image = <T extends File>(err = 'is not a recognized image file') =>
	pipe<T, T, any>(
		(input) => {
			if (isFile(input) && isMimeType(input.type) && input.type.startsWith('image/')) return input
			throw PipeError.root(err, input)
		},
		{
			compile: ({ input, context }) =>
				`(${context}.isFile(${input}) && ${context}.isMimeType(${input}.type) && ${input}.type.startsWith('image/')) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
			context: () => ({ isFile, isMimeType, PipeError }),
		},
	)

export const audio = <T extends File>(err = 'is not a recognized audio file') =>
	pipe<T, T, any>(
		(input) => {
			if (isFile(input) && isMimeType(input.type) && input.type.startsWith('audio/')) return input
			throw PipeError.root(err, input)
		},
		{
			compile: ({ input, context }) =>
				`(${context}.isFile(${input}) && ${context}.isMimeType(${input}.type) && ${input}.type.startsWith('audio/')) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
			context: () => ({ isFile, isMimeType, PipeError }),
		},
	)

export const video = <T extends File>(err = 'is not a recognized video file') =>
	pipe<T, T, any>(
		(input) => {
			if (isFile(input) && isMimeType(input.type) && input.type.startsWith('video/')) return input
			throw PipeError.root(err, input)
		},
		{
			compile: ({ input, context }) =>
				`(${context}.isFile(${input}) && ${context}.isMimeType(${input}.type) && ${input}.type.startsWith('video/')) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
			context: () => ({ isFile, isMimeType, PipeError }),
		},
	)

export const fileType = <T extends File>(typesFn: ValueFunction<string | string[]>, err = 'is not a supported file') =>
	pipe<T, T, any>(
		(input) => {
			if (isFile(input) && isMimeType(input.type)) {
				const types = execValueFunction(typesFn)
				const fileTypes = Array.isArray(types) ? types : [types]
				if (fileTypes.some((type) => input.type === type)) return input
			}
			throw PipeError.root(err, input)
		},
		{
			compile: ({ input, context }) =>
				`(${context}.isFile(${input}) && ${context}.isMimeType(${input}.type) && ${context}.makeArray(${context}.execValueFunction(${context}.typesFn)).some((type) => ${input}.type === type)) ? ${input} : ${context}.PipeError.root('${err}', ${input})`,
			context: () => ({
				isFile,
				isMimeType,
				typesFn,
				execValueFunction,
				PipeError,
				makeArray: (x: any) => (Array.isArray(x) ? x : [x]),
			}),
		},
	)
