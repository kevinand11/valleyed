import { standard } from './base/pipes'

export interface File {
	type: string
}

const isFile = (v: unknown): v is File => typeof v === 'object' && !!v && 'type' in v
const isMimeType = (str: string) => /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/.test(str)

export const file = <T extends File>(err = 'is not a recognized file') =>
	standard<T, T>(
		({ input, context, path }, opts) =>
			opts.wrapError(
				`!${context}.isFile(${input}) || !${context}.isMimeType(${input}.type)`,
				`PipeError.root('${err}', ${input}, ${path})`,
			),
		{
			context: { isFile, isMimeType },
			schema: () => ({ type: 'string', format: 'binary' }),
		},
	)

export const image = <T extends File>(err = 'is not a recognized image file') =>
	standard<T, T>(
		({ input, context, path }, opts) =>
			opts.wrapError(
				`!${context}.isFile(${input}) || !${context}.isMimeType(${input}.type) || !${input}.type.startsWith('image/')`,
				`PipeError.root('${err}', ${input}, ${path})`,
			),
		{
			context: { isFile, isMimeType },
		},
	)

export const audio = <T extends File>(err = 'is not a recognized audio file') =>
	standard<T, T>(
		({ input, context, path }, opts) =>
			opts.wrapError(
				`!${context}.isFile(${input}) || !${context}.isMimeType(${input}.type) || !${input}.type.startsWith('audio/')`,
				`PipeError.root('${err}', ${input}, ${path})`,
			),
		{
			context: { isFile, isMimeType },
		},
	)

export const video = <T extends File>(err = 'is not a recognized video file') =>
	standard<T, T>(
		({ input, context, path }, opts) =>
			opts.wrapError(
				`!${context}.isFile(${input}) || !${context}.isMimeType(${input}.type) || !${input}.type.startsWith('video/')`,
				`PipeError.root('${err}', ${input}, ${path})`,
			),
		{
			context: { isFile, isMimeType },
		},
	)

export const fileType = <T extends File>(typesFn: string | string[], err = 'is not a supported file') =>
	standard<T, T>(
		({ input, context, path }, opts) =>
			opts.wrapError(
				`!${context}.isFile(${input}) || !${context}.isMimeType(${input}.type) || !${context}.makeArray(${context}.typesFn).some((type) => ${input}.type === type)`,
				`PipeError.root('${err}', ${input}, ${path})`,
			),
		{
			context: {
				isFile,
				isMimeType,
				typesFn,
				makeArray: (x: any) => (Array.isArray(x) ? x : [x]),
			},
		},
	)
