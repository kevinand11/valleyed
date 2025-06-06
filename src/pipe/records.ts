import { makePipe, PipeError, PipeOutput, type Pipe } from './base'
import { Prettify } from '../utils/types'

export const object = <T extends Record<string, Pipe<any, any, object>>>(schema: T, trim = true, err?: string) =>
	makePipe(
		(input: unknown): { [K in keyof T]: PipeOutput<T[K]> } => {
			if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new PipeError(['is not an object'], input)
			const obj = structuredClone(input)
			const keys = new Set([...Object.keys(obj ?? {}), ...Object.keys(schema)])
			const errors: string[] = []
			for (const key of keys) {
				if (!(key in schema)) {
					if (trim) delete obj[key]
					continue
				}
				const validity = schema[key].safeParse(obj[key])
				if (!validity.valid) errors.push(...validity.error.messages.map((e) => (e.includes(': ') ? `${key}.` : `${key}: ` + e)))
				else obj[key] = validity.value
			}
			if (errors.length) throw new PipeError(err ? [err] : errors, input)
			return obj as any
		},
		{
			extends: <S extends Record<string, Pipe<unknown, unknown>>>(s: S) =>
				object<Prettify<Omit<T, keyof S> & S>>(
					{
						...schema,
						...s,
					} as any,
					trim,
					err,
				),
		},
	)

export const record = <K extends PropertyKey, V>(kSchema: Pipe<unknown, K>, vSchema: Pipe<unknown, V>) =>
	makePipe<unknown, Record<K, V>>((input) => {
		if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new PipeError(['is not an object'], input)
		const obj = structuredClone(input) as Record<K, V>
		const errors: string[] = []
		for (const [k, v] of Object.entries(obj)) {
			const kValidity = kSchema.safeParse(k)
			const vValidity = vSchema.safeParse(v)
			if (!kValidity.valid) errors.push(`contains an invalid key ${k}`)
			if (!vValidity.valid) errors.push(`contains an invalid value for key ${k}`)
			if (kValidity.valid && vValidity.valid) {
				if (k !== kValidity.value) delete obj[k]
				obj[kValidity.value] = vValidity.value
			}
		}
		if (errors.length) throw new PipeError(errors, input)
		return obj
	}, {})

export const asMap = <K extends PropertyKey, V>() =>
	makePipe<Record<K, V>, Map<K, V>>((input) => new Map<K, V>(Object.entries(input) as any), {})
