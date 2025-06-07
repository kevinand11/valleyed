import { makePipe, PipeError, PipeInput, PipeOutput, type Pipe } from './base'
import { optionalTag } from './optionals'
import { Prettify } from '../utils/types'

export const object = <T extends Record<string, Pipe<any, any, object>>>(pipes: T, trim = true, err?: string) =>
	makePipe(
		(input: { [K in keyof T]: PipeInput<T[K]> }): { [K in keyof T]: PipeOutput<T[K]> } => {
			if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new PipeError(['is not an object'], input)
			const obj = structuredClone(input) as any
			const keys = new Set([...Object.keys(obj ?? {}), ...Object.keys(pipes)])
			const errors: string[] = []
			for (const key of keys) {
				if (!(key in pipes)) {
					if (trim) delete obj[key]
					continue
				}
				const validity = pipes[key].safeParse(obj[key])
				if (!validity.valid) errors.push(...validity.error.messages.map((e) => (e.includes(': ') ? `${key}.` : `${key}: ` + e)))
				else obj[key] = validity.value
			}
			if (errors.length) throw new PipeError(err ? [err] : errors, input)
			return obj
		},
		{
			extends: <S extends Record<string, Pipe<unknown, unknown>>>(s: S) =>
				object<Prettify<Omit<T, keyof S> & S>>(
					{
						...pipes,
						...s,
					} as any,
					trim,
					err,
				),
		},
		(baseSchema) => ({
			...baseSchema,
			type: 'object',
			properties: Object.fromEntries(Object.entries(pipes).map(([key, pipe]) => [key, pipe.toJsonSchema()])),
			required: Object.entries(pipes)
				.filter(([, pipe]) => (optionalTag in pipe.context ? !pipe.context[optionalTag] : true))
				.map(([key]) => key),
			additionalProperties: !trim,
		}),
	)

export const record = <K extends Pipe<any, PropertyKey, any>, V extends Pipe<any, any, any>>(kPipe: K, vPipe: V) =>
	makePipe<Record<PipeInput<K>, PipeInput<V>>, Record<PipeOutput<K>, PipeOutput<V>>>(
		(input: unknown) => {
			if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new PipeError(['is not an object'], input)
			const obj = structuredClone(input)
			const errors: string[] = []
			for (const [k, v] of Object.entries(obj)) {
				const kValidity = kPipe.safeParse(k)
				const vValidity = vPipe.safeParse(v)
				if (!kValidity.valid) errors.push(`contains an invalid key ${k}`)
				if (!vValidity.valid) errors.push(`contains an invalid value for key ${k}`)
				if (kValidity.valid && vValidity.valid) {
					if (k !== kValidity.value) delete obj[k]
					obj[kValidity.value] = vValidity.value
				}
			}
			if (errors.length) throw new PipeError(errors, input)
			return obj as any
		},
		{},
		(schema) => ({
			...schema,
			type: 'object',
			propertyNames: kPipe.toJsonSchema(),
			additionalProperties: vPipe.toJsonSchema(),
		}),
	)

export const asMap = <K extends PropertyKey, V>() =>
	makePipe<Record<K, V>, Map<K, V>>((input) => new Map<K, V>(Object.entries(input) as any), {})
