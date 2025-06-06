import { makePipe, PipeError, PipeOutput, type Pipe } from './base'

export const object = <T extends Record<string, Pipe<unknown, unknown>>>(schema: T, trim = true, err?: string) =>
	makePipe<unknown, { [K in keyof T]: PipeOutput<T[K]> }, { schema: T }>(
		(input) => {
			if (typeof input !== 'object' || input === null) throw new PipeError(['is not an object'], input)
			const obj = structuredClone(input)
			const keys = new Set([...Object.keys(obj ?? {}), ...Object.keys(schema)])
			const errors: string[] = []
			for (const key of keys) {
				if (!(key in schema)) {
					if (trim) delete obj[key]
					continue
				}
				const value = schema[key].safeParse(obj[key])
				if ('error' in value) errors.push(...value.error.messages.map((e) => (e.includes(': ') ? `${key}.` : `${key}: ` + e)))
				else obj[key] = value.value
			}
			if (errors.length) throw new PipeError(err ? [err] : errors, input)
			return obj as any
		},
		{ schema },
	)

export const record = <K extends PropertyKey, V>(kSchema: Pipe<unknown, K>, vSchema: Pipe<unknown, V>) =>
	makePipe<unknown, Record<K, V>>((input) => {
		if (typeof input !== 'object' || input === null) throw new PipeError(['is not an object'], input)
		const obj = structuredClone(input) as Record<K, V>
		const errors: string[] = []
		for (const [k, v] of Object.entries(obj)) {
			const kValid = kSchema.safeParse(k)
			const vValid = vSchema.safeParse(v)
			if ('error' in kValid) errors.push(`contains an invalid key ${k}`)
			if ('error' in vValid) errors.push(`contains an invalid value for key ${k}`)
			if ('value' in kValid && 'value' in vValid) {
				if (k !== kValid.value) delete obj[k]
				obj[kValid.value] = vValid.value
			}
		}
		if (errors.length) throw new PipeError(errors, input)
		return obj
	}, {})

export const asMap = <K extends PropertyKey, V>() =>
	makePipe<Record<K, V>, Map<K, V>>((input) => new Map<K, V>(Object.entries(input) as any), {})
