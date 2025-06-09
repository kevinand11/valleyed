import { pipe, PipeError, PipeInput, PipeOutput, type Pipe } from './base'

type ObjectPipe<T extends Record<string, Pipe<any, any>>> = Pipe<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }>

export const object = <T extends Record<string, Pipe<any, any>>>(objectPipes: T) =>
	pipe<PipeInput<ObjectPipe<T>>, PipeOutput<ObjectPipe<T>>>(
		(input, context) => {
			const pipes = context.objectPipes ?? {}
			if (typeof input !== 'object' || input === null || Array.isArray(input)) throw PipeError.root('is not an object', input)
			const obj = structuredClone(input) as any
			const keys = new Set([...Object.keys(pipes ?? {}), ...Object.keys(obj)])
			const errors: PipeError[] = []
			for (const key of keys) {
				if (!(key in pipes)) continue
				const validity = pipes[key].safeParse(obj[key])
				if (!validity.valid) errors.push(PipeError.path(key, validity.error, obj[key]))
				else obj[key] = validity.value
			}
			if (errors.length) throw PipeError.rootFrom(errors, input)
			return obj
		},
		{
			schema: (context) => ({
				type: 'object',
				properties: Object.fromEntries(Object.entries(context.objectPipes ?? {}).map(([key, pipe]) => [key, pipe.toJsonSchema()])),
				required: Object.entries(context.objectPipes ?? {})
					.filter(([, pipe]) => !pipe.context.optional)
					.map(([key]) => key),
				additionalProperties: true,
			}),
			context: { objectPipes },
		},
	)

export const objectPick = <T extends Record<string, Pipe<any, any>>, S extends keyof T>(s: S[]) =>
	pipe<PipeInput<T>, PipeOutput<Pick<T, S>>>((input) => input as any, {
		context: (context) => {
			const objectPipes = context.objectPipes ?? {}
			return {
				objectPipes: Object.fromEntries(Object.entries(objectPipes).filter(([key]) => s.includes(key as S))),
			}
		},
	})

export const objectOmit = <T extends Record<string, Pipe<any, any>>, S extends keyof T>(s: S[]) =>
	pipe<PipeInput<T>, PipeOutput<Omit<T, S>>>((input) => input as any, {
		context: (context) => {
			const objectPipes = context.objectPipes ?? {}
			return {
				objectPipes: Object.fromEntries(Object.entries(objectPipes).filter(([key]) => !s.includes(key as S))),
			}
		},
	})

export const objectExtends = <T extends Record<string, Pipe<any, any>>, S extends Record<string, Pipe<any, any>>>(s: S) =>
	pipe<PipeInput<T>, PipeOutput<Omit<T, keyof S> & S>>((input) => input as any, {
		context: (context) => ({ objectPipes: { ...context.objectPipes, ...s } }),
	})

export const objectTrim = <T extends Record<string, Pipe<any, any>>>() =>
	pipe<PipeInput<T>, PipeOutput<T>>(
		(input, context) => {
			const schema = context.objectPipes ?? {}
			return Object.fromEntries(Object.entries(input as any).filter(([key]) => !!schema[key])) as any
		},
		{ schema: { additionalProperties: false } },
	)

export const record = <K extends Pipe<any, PropertyKey>, V extends Pipe<any, any>>(kPipe: K, vPipe: V) =>
	pipe<Record<PipeInput<K>, PipeInput<V>>, Record<PipeOutput<K>, PipeOutput<V>>>(
		(input: unknown) => {
			if (typeof input !== 'object' || input === null || Array.isArray(input)) throw PipeError.root(['is not an object'], input)
			const obj = structuredClone(input)
			const errors: PipeError[] = []
			for (const [k, v] of Object.entries(obj)) {
				const kValidity = kPipe.safeParse(k)
				const vValidity = vPipe.safeParse(v)
				if (!kValidity.valid) errors.push(PipeError.path(k, kValidity.error, k))
				if (!vValidity.valid) errors.push(PipeError.path(v, vValidity.error, v))
				if (kValidity.valid && vValidity.valid) {
					if (k !== kValidity.value) delete obj[k]
					obj[kValidity.value] = vValidity.value
				}
			}
			if (errors.length) throw PipeError.rootFrom(errors, input)
			return obj as any
		},
		{
			schema: () => ({
				type: 'object',
				propertyNames: kPipe.toJsonSchema(),
				additionalProperties: vPipe.toJsonSchema(),
			}),
		},
	)

export const asMap = <K extends PropertyKey, V>() =>
	pipe<Record<K, V>, Map<K, V>>((input) => new Map<K, V>(Object.entries(input) as any), {})
