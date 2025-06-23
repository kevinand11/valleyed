import { makeBranchPipe, pipe, PipeError, PipeFn, PipeInput, PipeOutput, type Pipe } from './base'

type ObjectPipe<T extends Record<string, Pipe<any, any, any>>> = Pipe<
	{ [K in keyof T]: PipeInput<T[K]> },
	{ [K in keyof T]: PipeOutput<T[K]> },
	any
>

const objectPipeFn: PipeFn<any> = (input, context) => {
	const pipes = (context.objectPipes as Record<string, Pipe<any, any, any>>) ?? {}
	if (typeof input !== 'object' || input === null || Array.isArray(input)) throw PipeError.root('is not an object', input)
	const obj = {}
	const errors: PipeError[] = []
	for (const key of Object.keys(pipes)) {
		const value = input[key]
		const validity = pipes[key].validate(value)
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
	additionalProperties: false,
})

export const object = <T extends Record<string, Pipe<any, any, any>>>(objectPipes: T) =>
	pipe<PipeInput<ObjectPipe<T>>, PipeOutput<ObjectPipe<T>>, any>(objectPipeFn, {
		schema: () => makeObjectSchema(objectPipes),
		context: () => ({ objectPipes }),
	})

export const objectPick = <T extends ObjectPipe<Record<string, Pipe<any, any, any>>>, S extends ReadonlyArray<keyof PipeInput<T> & string>>(
	branch: T,
	keys: S,
) =>
	makeBranchPipe<T, Pick<PipeInput<T>, S[number]>, Pick<PipeOutput<T>, S[number]>, any>(branch, objectPipeFn, {
		schema: (s) => ({
			...s,
			properties: Object.fromEntries(Object.entries(s.properties ?? {}).filter(([key]) => keys.includes(key as S[number]))),
			required: (s.required ?? []).filter((key) => keys.includes(key as S[number])),
		}),
		context: (c) => ({
			...c,
			objectPipes: Object.fromEntries(Object.entries(c.objectPipes ?? {}).filter(([key]) => keys.includes(key as S[number]))),
		}),
	})

export const objectOmit = <T extends ObjectPipe<Record<string, Pipe<any, any, any>>>, S extends ReadonlyArray<keyof PipeInput<T> & string>>(
	branch: T,
	keys: S,
) =>
	makeBranchPipe<T, Omit<PipeInput<T>, S[number]>, Omit<PipeOutput<T>, S[number]>, any>(branch, objectPipeFn, {
		schema: (s) => ({
			...s,
			properties: Object.fromEntries(Object.entries(s.properties ?? {}).filter(([key]) => !keys.includes(key as S[number]))),
			required: (s.required ?? []).filter((key) => !keys.includes(key as S[number])),
		}),
		context: (c) => ({
			...c,
			objectPipes: Object.fromEntries(Object.entries(c.objectPipes ?? {}).filter(([key]) => !keys.includes(key as S[number]))),
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

export const record = <K extends Pipe<any, PropertyKey, any>, V extends Pipe<any, any, any>>(kPipe: K, vPipe: V) =>
	pipe<Record<PipeInput<K>, PipeInput<V>>, Record<PipeOutput<K>, PipeOutput<V>>, any>(
		(input: unknown) => {
			if (typeof input !== 'object' || input === null || Array.isArray(input)) throw PipeError.root(['is not an object'], input)
			const obj = {} as object
			const errors: PipeError[] = []
			for (const [k, v] of Object.entries(input)) {
				const kValidity = kPipe.validate(k)
				const vValidity = vPipe.validate(v)
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
