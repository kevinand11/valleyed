import { PipeError, PipeInput, PipeOutput, type Pipe } from './base'
import { context, pipe, schema, validate, compileToValidate } from './base/pipes'

type ObjectPipe<T extends Record<string, Pipe<any, any, any>>> = Pipe<
	{ [K in keyof T]: PipeInput<T[K]> },
	{ [K in keyof T]: PipeOutput<T[K]> },
	any
>

export const object = <T extends Record<string, Pipe<any, any, any>>>(branches: T) =>
	pipe<PipeInput<ObjectPipe<T>>, PipeOutput<ObjectPipe<T>>, any>(
		(input, context) => {
			if (typeof input !== 'object' || input === null || Array.isArray(input)) throw PipeError.root('is not an object', input)
			const obj = {} as any
			const errors: PipeError[] = []
			for (const key of context.objectKeys ?? Object.keys(branches)) {
				if (!(key in branches)) continue
				const value = input[key]
				const validity = validate(branches[key], value)
				if (!validity.valid) errors.push(PipeError.path(key, validity.error, value))
				else obj[key] = validity.value
			}
			if (errors.length) throw PipeError.rootFrom(errors, input)
			return obj
		},
		{
			compile: ({ input, context }, rootContext) => `(() => {
				if (typeof ${input} !== 'object' || ${input} === null || Array.isArray(${input})) return ${context}.PipeError.root('is not an object', ${input})
				const obj = {}
				const errors = []
				${Object.entries(branches)
					.map(
						([k, branch]) => `(() => {
	const validity = ${compileToValidate(branch, rootContext, `${input}['${k}']`, context)}
	if (!validity.valid) errors.push(${context}.PipeError.path(key, validity.error, ${input}['${k}']))
	else obj[key] = validity.value
})()`,
					)
					.join('\n')}
				if (errors.length) throw ${context}.PipeError.rootFrom(errors, ${input})
				return obj
			})()`,
			schema: () => ({
				type: 'object',
				properties: Object.fromEntries(Object.entries(branches ?? {}).map(([key, pipe]) => [key, schema(pipe)])),
				required: Object.entries(branches ?? {})
					.filter(([, pipe]) => !context(pipe).optional)
					.map(([key]) => key),
				additionalProperties: false,
			}),
			context: () => ({ objectKeys: Object.keys(branches), PipeError }),
		},
	)

export const objectPick = <T extends ObjectPipe<Record<string, Pipe<any, any, any>>>, S extends ReadonlyArray<keyof PipeInput<T> & string>>(
	branch: T,
	keys: S,
) =>
	pipe<Pick<PipeInput<T>, S[number]>, Pick<PipeOutput<T>, S[number]>, any>(branch.fn as any, {
		schema: (c) => ({
			...branch.schema(c),
			properties: Object.fromEntries(
				Object.entries(branch.schema(c).properties ?? {}).filter(([key]) => keys.includes(key as S[number])),
			),
			required: (branch.schema(c).required ?? []).filter((key) => keys.includes(key as S[number])),
		}),
		compile: branch.compile,
		context: () => ({
			...branch.context(),
			objectKeys: (branch.context().objectKeys ?? []).filter((key) => keys.includes(key as S[number])),
		}),
	})

export const objectOmit = <T extends ObjectPipe<Record<string, Pipe<any, any, any>>>, S extends ReadonlyArray<keyof PipeInput<T> & string>>(
	branch: T,
	keys: S,
) =>
	pipe<Omit<PipeInput<T>, S[number]>, Omit<PipeOutput<T>, S[number]>, any>(branch.fn as any, {
		schema: (c) => ({
			...branch.schema(c),
			properties: Object.fromEntries(
				Object.entries(branch.schema(c).properties ?? {}).filter(([key]) => !keys.includes(key as S[number])),
			),
			required: (branch.schema(c).required ?? []).filter((key) => !keys.includes(key as S[number])),
		}),
		compile: branch.compile,
		context: () => ({
			...branch.context(),
			objectKeys: (branch.context().objectKeys ?? []).filter((key) => !keys.includes(key as S[number])),
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
			compile: ({ input, context }, rootContext) => `(() => {
				if (typeof ${input} !== 'object' || ${input} === null || Array.isArray(${input})) return ${context}.PipeError.root(['is not an object'], ${input})
				const obj = {}
				const errors = []
				for (const [k, v] of Object.entries(input)) {
					const kValidity = ${compileToValidate(kPipe, rootContext, 'k', context)}
					const vValidity = ${compileToValidate(vPipe, rootContext, 'v', context)}
					if (!kValidity.valid) errors.push(${context}.PipeError.path(k, kValidity.error, k))
					if (!vValidity.valid) errors.push(${context}.PipeError.path(k, vValidity.error, v))
					if (kValidity.valid && vValidity.valid) {
						if (k !== kValidity.value) delete obj[k]
						obj[kValidity.value] = vValidity.value
					}
				}
				if (errors.length) throw ${context}.PipeError.rootFrom(errors, ${input})
				return obj
			})()`,
			context: () => ({ PipeError }),
			schema: () => ({
				type: 'object',
				propertyNames: schema(kPipe),
				additionalProperties: schema(vPipe),
			}),
		},
	)

export const asMap = <K extends PropertyKey, V>() =>
	pipe<Record<K, V>, Map<K, V>, any>((input) => new Map<K, V>(Object.entries(input) as any), {
		compile: ({ input }) => `new Map(Object.entries(${input}))`,
	})
