import { PipeError } from './base'
import { standard } from './base/pipes'
import { execValueFunction, ValueFunction } from '../utils/functions'

export interface File {
	type: string
}

const isFile = (v: unknown): v is File => typeof v === 'object' && !!v && 'type' in v
const isMimeType = (str: string) => /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/.test(str)

export const file = <T extends File>(err = 'is not a recognized file') =>
	standard<T, T>(
		({ input, context }) => [
			`if (!${context}.isFile(${input}) || !${context}.isMimeType(${input}.type)) throw ${context}.PipeError.root('${err}', ${input})`,
		],
		{
			context: { isFile, isMimeType, PipeError },
			schema: () => ({ type: 'string', format: 'binary' }),
		},
	)

export const image = <T extends File>(err = 'is not a recognized image file') =>
	standard<T, T>(
		({ input, context }) => [
			`if (!${context}.isFile(${input}) || !${context}.isMimeType(${input}.type) || !${input}.type.startsWith('image/')) throw ${context}.PipeError.root('${err}', ${input})`,
		],
		{
			context: { isFile, isMimeType, PipeError },
		},
	)

export const audio = <T extends File>(err = 'is not a recognized audio file') =>
	standard<T, T>(
		({ input, context }) => [
			`if (!${context}.isFile(${input}) || !${context}.isMimeType(${input}.type) || !${input}.type.startsWith('audio/')) throw ${context}.PipeError.root('${err}', ${input})`,
		],
		{
			context: { isFile, isMimeType, PipeError },
		},
	)

export const video = <T extends File>(err = 'is not a recognized video file') =>
	standard<T, T>(
		({ input, context }) => [
			`if (!${context}.isFile(${input}) || !${context}.isMimeType(${input}.type) || !${input}.type.startsWith('video/')) throw ${context}.PipeError.root('${err}', ${input})`,
		],
		{
			context: { isFile, isMimeType, PipeError },
		},
	)

export const fileType = <T extends File>(typesFn: ValueFunction<string | string[]>, err = 'is not a supported file') =>
	standard<T, T>(
		({ input, context }) => [
			`if (!${context}.isFile(${input}) || !${context}.isMimeType(${input}.type) || !${context}.makeArray(${context}.execValueFunction(${context}.typesFn)).some((type) => ${input}.type === type)) throw ${context}.PipeError.root('${err}', ${input})`,
		],
		{
			context: {
				isFile,
				isMimeType,
				typesFn,
				execValueFunction,
				PipeError,
				makeArray: (x: any) => (Array.isArray(x) ? x : [x]),
			},
		},
	)
