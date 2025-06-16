import { makeBranchPipe, pipe, PipeContext, PipeError, PipeFn, PipeInput, PipeOutput, type Pipe } from './base'

type ObjectPipe<T extends Record<string, Pipe<any, any, any>>> = Pipe<
	{ [K in keyof T]: PipeInput<T[K]> },
	{ [K in keyof T]: PipeOutput<T[K]> },
	any
>

const objectPipeFn: PipeFn<any> = (input, context) => {
	const pipes = context.objectPipes ?? {}
	if (typeof input !== 'object' || input === null || Array.isArray(input)) throw PipeError.root('is not an object', input)
	const obj = {}
	const keys = new Set([...Object.keys(pipes ?? {}), ...Object.keys(input)])
	const errors: PipeError[] = []
	for (const key of keys) {
		const value = input[key]
		if (!(key in pipes)) {
			obj[key] = value
			continue
		}
		const validity = pipes[key].safeParse(value)
		if (!validity.valid) errors.push(PipeError.path(key, validity.error, value))
		else obj[key] = validity.value
	}
	if (errors.length) throw PipeError.rootFrom(errors, input)
	return obj
}

const makeObjectSchema = <T extends Record<string, Pipe<any, any, any>>>(objectPipes: T) => ({
	type: 'object',
	properties: Object.fromEntries(Object.entries(objectPipes ?? {}).map(([key, pipe]) => [key, pipe.toJsonSchema()])),
	required: Object.entries(objectPipes ?? {})
		.filter(([, pipe]) => !pipe.context().optional)
		.map(([key]) => key),
	additionalProperties: true,
})

export const object = <T extends Record<string, Pipe<any, any, any>>>(objectPipes: T) =>
	pipe<PipeInput<ObjectPipe<T>>, PipeOutput<ObjectPipe<T>>, any>(objectPipeFn, {
		schema: () => makeObjectSchema(objectPipes),
		context: () => ({ objectPipes }),
	})

export const objectPick = <T extends ObjectPipe<Record<string, Pipe<any, any, any>>>, S extends keyof PipeInput<T> & string>(
	branch: T,
	keys: S[],
) =>
	makeBranchPipe<T, Pick<PipeInput<T>, S>, Pick<PipeOutput<T>, S>, any>(branch, objectPipeFn, {
		schema: (s) => ({
			...s,
			properties: Object.fromEntries(Object.entries(s.properties ?? {}).filter(([key]) => keys.includes(key as S))),
			required: (s.required ?? []).filter((key) => keys.includes(key as S)),
		}),
		context: (c) => ({
			...c,
			objectPipes: Object.fromEntries(Object.entries(c.objectPipes ?? {}).filter(([key]) => keys.includes(key as S))),
		}),
	})

export const objectOmit = <T extends ObjectPipe<Record<string, Pipe<any, any, any>>>, S extends keyof PipeInput<T> & string>(
	branch: T,
	keys: S[],
) =>
	makeBranchPipe<T, Omit<PipeInput<T>, S>, Omit<PipeOutput<T>, S>, any>(branch, objectPipeFn, {
		schema: (s) => ({
			...s,
			properties: Object.fromEntries(Object.entries(s.properties ?? {}).filter(([key]) => !keys.includes(key as S))),
			required: (s.required ?? []).filter((key) => !keys.includes(key as S)),
		}),
		context: (c) => ({
			...c,
			objectPipes: Object.fromEntries(Object.entries(c.objectPipes ?? {}).filter(([key]) => !keys.includes(key as S))),
		}),
	})

export const objectExtends = <T extends ObjectPipe<Record<string, Pipe<any, any, any>>>, S extends Record<string, Pipe<any, any, any>>>(
	branch: T,
	pipes: S,
) =>
	makeBranchPipe<
		T,
		Omit<PipeInput<T>, keyof S> & PipeInput<ObjectPipe<S>>,
		Omit<PipeOutput<T>, keyof S> & PipeOutput<ObjectPipe<S>>,
		any
	>(branch, objectPipeFn, {
		schema: (s) => {
			const newSchema = makeObjectSchema(pipes)
			return {
				...s,
				properties: { ...s.properties, ...newSchema.properties },
				required: [...(s.required ?? []), ...(newSchema.required ?? [])],
				additionalProperties: newSchema.additionalProperties,
			}
		},
		context: (c) => ({ ...c, objectPipes: { ...c.objectPipes, ...pipes } }),
	})

export const objectTrim = <T extends ObjectPipe<Record<string, Pipe<any, any, any>>>>(branch: T) =>
	makeBranchPipe<T, PipeInput<T>, PipeOutput<T>, PipeContext<T>>(
		branch,
		(input, context) => {
			const value = branch.parse(input)
			const schema = context.objectPipes ?? {}
			return Object.fromEntries(Object.entries(value).filter(([key]) => !!schema[key])) as any
		},
		{
			schema: (s) => ({ ...s, additionalProperties: false }),
			context: (c) => c,
		},
	)

export const record = <K extends Pipe<any, PropertyKey, any>, V extends Pipe<any, any, any>>(kPipe: K, vPipe: V) =>
	pipe<Record<PipeInput<K>, PipeInput<V>>, Record<PipeOutput<K>, PipeOutput<V>>, any>(
		(input: unknown) => {
			if (typeof input !== 'object' || input === null || Array.isArray(input)) throw PipeError.root(['is not an object'], input)
			const obj = {} as object
			const errors: PipeError[] = []
			for (const [k, v] of Object.entries(input)) {
				const kValidity = kPipe.safeParse(k)
				const vValidity = vPipe.safeParse(v)
				if (!kValidity.valid) errors.push(PipeError.path(k, kValidity.error, k))
				if (!vValidity.valid) errors.push(PipeError.path(k, vValidity.error, v))
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
	pipe<Record<K, V>, Map<K, V>, any>((input) => new Map<K, V>(Object.entries(input) as any), {})
