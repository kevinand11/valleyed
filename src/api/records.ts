import { makePipe, PipeContext, PipeError, PipeInput, PipeOutput, type Pipe } from './base'
import { optionalTag } from './optionals'

type ObjectPipe<T extends Record<string, Pipe<any, any, object>>> = Pipe<
	{ [K in keyof T]: PipeInput<T[K]> },
	{ [K in keyof T]: PipeOutput<T[K]> },
	{ pipes: T; trim: boolean }
>

export const object = <T extends Record<string, Pipe<any, any, object>>>(pipes: T, trim = true) =>
	makePipe<PipeInput<ObjectPipe<T>>, PipeOutput<ObjectPipe<T>>, PipeContext<ObjectPipe<T>>>(
		(input) => {
			if (typeof input !== 'object' || input === null || Array.isArray(input)) throw PipeError.root('is not an object', input)
			const obj = structuredClone(input) as any
			const keys = new Set([...Object.keys(pipes ?? {}), ...Object.keys(obj)])
			const errors: PipeError[] = []
			for (const key of keys) {
				if (!(key in pipes)) {
					if (trim) delete obj[key]
					continue
				}
				const validity = pipes[key].safeParse(obj[key])
				if (!validity.valid) errors.push(PipeError.path(key, validity.error, obj[key]))
				else obj[key] = validity.value
			}
			if (errors.length) throw PipeError.rootFrom(errors, input)
			return obj
		},
		{ pipes, trim },
		(schema) => ({
			...schema,
			type: 'object',
			properties: Object.fromEntries(Object.entries(pipes).map(([key, pipe]) => [key, pipe.toJsonSchema()])),
			required: Object.entries(pipes)
				.filter(([, pipe]) => (optionalTag in pipe.context ? !pipe.context[optionalTag] : true))
				.map(([key]) => key),
			additionalProperties: !trim,
		}),
	)

export const objectPick = <T extends Record<string, Pipe<any, any, object>>, S extends keyof T>(pipe: ObjectPipe<T>, s: S[]) =>
	object<Pick<T, S>>(
		Object.fromEntries(Object.entries(pipe.context.pipes).filter(([key]) => s.includes(key as S))) as any,
		pipe.context.trim,
	)

export const objectOmit = <T extends Record<string, Pipe<any, any, object>>, S extends keyof T>(pipe: ObjectPipe<T>, s: S[]) =>
	object<Omit<T, S>>(
		Object.fromEntries(Object.entries(pipe.context.pipes).filter(([key]) => !s.includes(key as S))) as any,
		pipe.context.trim,
	)

export const objectExtends = <T extends Record<string, Pipe<any, any, object>>, S extends Record<string, Pipe<any, any, object>>>(
	pipe: ObjectPipe<T>,
	s: S,
) => object<Omit<T, keyof S> & S>({ ...pipe.context.pipes, ...s }, pipe.context.trim)

export const record = <K extends Pipe<any, PropertyKey, any>, V extends Pipe<any, any, any>>(kPipe: K, vPipe: V) =>
	makePipe<Record<PipeInput<K>, PipeInput<V>>, Record<PipeOutput<K>, PipeOutput<V>>>(
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
