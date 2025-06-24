import { context, branch, pipe, PipeError, PipeInput, PipeOutput, schema, validate, type Pipe } from './base'

type ObjectPipe<T extends Record<string, Pipe<any, any, any>>> = Pipe<
	{ [K in keyof T]: PipeInput<T[K]> },
	{ [K in keyof T]: PipeOutput<T[K]> },
	any
>

export const object = <T extends Record<string, Pipe<any, any, any>>>(pipes: T) =>
	pipe<PipeInput<ObjectPipe<T>>, PipeOutput<ObjectPipe<T>>, any>(
		(input, context) => {
			if (typeof input !== 'object' || input === null || Array.isArray(input)) throw PipeError.root('is not an object', input)
			const obj = {} as any
			const errors: PipeError[] = []
			for (const key of context.objectKeys ?? []) {
				if (!(key in pipes)) continue
				const value = input[key]
				const validity = validate(pipes[key], value)
				if (!validity.valid) errors.push(PipeError.path(key, validity.error, value))
				else obj[key] = validity.value
			}
			if (errors.length) throw PipeError.rootFrom(errors, input)
			return obj
		},
		{
			schema: () => ({
				type: 'object',
				properties: Object.fromEntries(Object.entries(pipes ?? {}).map(([key, pipe]) => [key, schema(pipe)])),
				required: Object.entries(pipes ?? {})
					.filter(([, pipe]) => !context(pipe).optional)
					.map(([key]) => key),
				additionalProperties: false,
			}),
			context: () => ({ objectKeys: Object.keys(pipes) }),
		},
	)

export const objectPick = <T extends ObjectPipe<Record<string, Pipe<any, any, any>>>, S extends ReadonlyArray<keyof PipeInput<T> & string>>(
	pipe: T,
	keys: S,
) =>
	branch<T, Pick<PipeInput<T>, S[number]>, Pick<PipeOutput<T>, S[number]>, any>(pipe, pipe.fn, {
		schema: (s) => ({
			...s,
			properties: Object.fromEntries(Object.entries(s.properties ?? {}).filter(([key]) => keys.includes(key as S[number]))),
			required: (s.required ?? []).filter((key) => keys.includes(key as S[number])),
		}),
		context: (c) => ({
			...c,
			objectKeys: (c.objectKeys ?? []).filter((key) => keys.includes(key as S[number])),
		}),
	})

export const objectOmit = <T extends ObjectPipe<Record<string, Pipe<any, any, any>>>, S extends ReadonlyArray<keyof PipeInput<T> & string>>(
	pipe: T,
	keys: S,
) =>
	branch<T, Omit<PipeInput<T>, S[number]>, Omit<PipeOutput<T>, S[number]>, any>(pipe, pipe.fn, {
		schema: (s) => ({
			...s,
			properties: Object.fromEntries(Object.entries(s.properties ?? {}).filter(([key]) => !keys.includes(key as S[number]))),
			required: (s.required ?? []).filter((key) => !keys.includes(key as S[number])),
		}),
		context: (c) => ({
			...c,
			objectKeys: (c.objectKeys ?? []).filter((key) => !keys.includes(key as S[number])),
		}),
	})

export const record = <K extends Pipe<any, PropertyKey, any>, V extends Pipe<any, any, any>>(kPipe: K, vPipe: V) =>
	pipe<Record<PipeInput<K>, PipeInput<V>>, Record<PipeOutput<K>, PipeOutput<V>>, any>(
		(input: unknown) => {
			if (typeof input !== 'object' || input === null || Array.isArray(input)) throw PipeError.root(['is not an object'], input)
			const obj = {} as object
			const errors: PipeError[] = []
			for (const [k, v] of Object.entries(input)) {
				const kValidity = validate(kPipe, k)
				const vValidity = validate(vPipe, v)
				if (!kValidity.valid) errors.push(PipeError.path(k, kValidity.error, k))
				if (!vValidity.valid) errors.push(PipeError.path(k, vValidity.error, v))
				if (kValidity.valid && vValidity.valid) {
					if (k !== kValidity.value) delete obj[k]
					obj[kValidity.value as any] = vValidity.value
				}
			}
			if (errors.length) throw PipeError.rootFrom(errors, input)
			return obj as any
		},
		{
			schema: () => ({
				type: 'object',
				propertyNames: schema(kPipe),
				additionalProperties: schema(vPipe),
			}),
		},
	)

export const asMap = <K extends PropertyKey, V>() =>
	pipe<Record<K, V>, Map<K, V>, any>((input) => new Map<K, V>(Object.entries(input) as any), {})
