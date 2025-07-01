import { PipeError, PipeInput, PipeOutput, type Pipe } from './base'
import { context, standard, schema, compileToValidate } from './base/pipes'

type ObjectPipe<T extends Record<string, Pipe<any, any>>> = Pipe<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }>

export const object = <T extends Record<string, Pipe<any, any>>>(branches: T) =>
	standard<PipeInput<ObjectPipe<T>>, PipeOutput<ObjectPipe<T>>>(
		({ input, context }, rootContext) => `(() => {
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
		{
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

export const objectPick = <T extends ObjectPipe<Record<string, Pipe<any, any>>>, S extends ReadonlyArray<keyof PipeInput<T> & string>>(
	branch: T,
	keys: S,
) =>
	standard<Pick<PipeInput<T>, S[number]>, Pick<PipeOutput<T>, S[number]>>(branch.compile, {
		schema: (c) => ({
			...branch.schema(c),
			properties: Object.fromEntries(
				Object.entries(branch.schema(c).properties ?? {}).filter(([key]) => keys.includes(key as S[number])),
			),
			required: (branch.schema(c).required ?? []).filter((key) => keys.includes(key as S[number])),
		}),
		context: () => ({
			...branch.context(),
			objectKeys: (branch.context().objectKeys ?? []).filter((key) => keys.includes(key as S[number])),
		}),
	})

export const objectOmit = <T extends ObjectPipe<Record<string, Pipe<any, any>>>, S extends ReadonlyArray<keyof PipeInput<T> & string>>(
	branch: T,
	keys: S,
) =>
	standard<Omit<PipeInput<T>, S[number]>, Omit<PipeOutput<T>, S[number]>>(branch.compile, {
		schema: (c) => ({
			...branch.schema(c),
			properties: Object.fromEntries(
				Object.entries(branch.schema(c).properties ?? {}).filter(([key]) => !keys.includes(key as S[number])),
			),
			required: (branch.schema(c).required ?? []).filter((key) => !keys.includes(key as S[number])),
		}),
		context: () => ({
			...branch.context(),
			objectKeys: (branch.context().objectKeys ?? []).filter((key) => !keys.includes(key as S[number])),
		}),
	})

export const record = <K extends Pipe<any, PropertyKey>, V extends Pipe<any, any>>(kPipe: K, vPipe: V) =>
	standard<Record<PipeInput<K>, PipeInput<V>>, Record<PipeOutput<K>, PipeOutput<V>>>(
		({ input, context }, rootContext) => `(() => {
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
		{
			context: () => ({ PipeError }),
			schema: () => ({
				type: 'object',
				propertyNames: schema(kPipe),
				additionalProperties: schema(vPipe),
			}),
		},
	)

export const asMap = <K extends PropertyKey, V>() => standard<Record<K, V>, Map<K, V>>(({ input }) => `new Map(Object.entries(${input}))`)
