import { PipeError, PipeInput, PipeOutput, type Pipe } from './base'
import { context, standard, schema, compileToValidate } from './base/pipes'

type ObjectPipe<T extends Record<string, Pipe<any, any>>> = Pipe<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }>

const objCompile: Parameters<typeof standard>[0] = ({ input, context }, rootContext) => `(() => {
	if (typeof ${input} !== 'object' || ${input} === null || Array.isArray(${input})) return ${context}.PipeError.root('is not an object', ${input});
	const obj = {};
	const errors = [];
	let validity;
	${Object.entries((rootContext.branches as Record<string, Pipe<any, any>>) ?? {})
		.map(
			([k, branch]) => `validity = ${compileToValidate(branch, rootContext, `${input}['${k}']`, context)};
	if (!validity.valid) errors.push(${context}.PipeError.path('${k}', validity.error, ${input}['${k}']));
	else obj['${k}'] = validity.value;`,
		)
		.join('\n\t')}
	if (errors.length) throw ${context}.PipeError.rootFrom(errors, ${input});
	return obj;
})()`

export const object = <T extends Record<string, Pipe<any, any>>>(branches: T) =>
	standard<PipeInput<ObjectPipe<T>>, PipeOutput<ObjectPipe<T>>>(objCompile, {
		schema: () => ({
			type: 'object',
			properties: Object.fromEntries(Object.entries(branches ?? {}).map(([key, pipe]) => [key, schema(pipe)])),
			required: Object.entries(branches ?? {})
				.filter(([, pipe]) => !context(pipe).optional)
				.map(([key]) => key),
			additionalProperties: false,
		}),
		context: () => ({ branches, PipeError }),
	})

export const objectPick = <T extends ObjectPipe<Record<string, Pipe<any, any>>>, S extends ReadonlyArray<keyof PipeInput<T> & string>>(
	branch: T,
	keys: S,
) =>
	standard<Pick<PipeInput<T>, S[number]>, Pick<PipeOutput<T>, S[number]>>(objCompile, {
		schema: (c) => ({
			...branch.schema(c),
			properties: Object.fromEntries(
				Object.entries(branch.schema(c).properties ?? {}).filter(([key]) => keys.includes(key as S[number])),
			),
			required: (branch.schema(c).required ?? []).filter((key) => keys.includes(key as S[number])),
		}),
		context: () => ({
			...branch.context(),
			branches: Object.fromEntries(
				Object.entries((branch.context().branches as Record<string, Pipe<any, any>>) ?? {}).filter(([key]) =>
					keys.includes(key as S[number]),
				),
			),
		}),
	})

export const objectOmit = <T extends ObjectPipe<Record<string, Pipe<any, any>>>, S extends ReadonlyArray<keyof PipeInput<T> & string>>(
	branch: T,
	keys: S,
) =>
	standard<Omit<PipeInput<T>, S[number]>, Omit<PipeOutput<T>, S[number]>>(objCompile, {
		schema: (c) => ({
			...branch.schema(c),
			properties: Object.fromEntries(
				Object.entries(branch.schema(c).properties ?? {}).filter(([key]) => !keys.includes(key as S[number])),
			),
			required: (branch.schema(c).required ?? []).filter((key) => !keys.includes(key as S[number])),
		}),
		context: () => ({
			...branch.context(),
			branches: Object.fromEntries(
				Object.entries((branch.context().branches as Record<string, Pipe<any, any>>) ?? {}).filter(
					([key]) => !keys.includes(key as S[number]),
				),
			),
		}),
	})

export const record = <K extends Pipe<any, PropertyKey>, V extends Pipe<any, any>>(kPipe: K, vPipe: V) =>
	standard<Record<PipeInput<K>, PipeInput<V>>, Record<PipeOutput<K>, PipeOutput<V>>>(
		({ input, context }, rootContext) => `(() => {
			if (typeof ${input} !== 'object' || ${input} === null || Array.isArray(${input})) return ${context}.PipeError.root(['is not an object'], ${input})
			const obj = {};
			const errors = [];
			for (let [k, v] of Object.entries(input)) {
				const kValidity = ${compileToValidate(kPipe, rootContext, 'k', context)};
				const vValidity = ${compileToValidate(vPipe, rootContext, 'v', context)};
				if (!kValidity.valid) errors.push(${context}.PipeError.path(k, kValidity.error, k));
				if (!vValidity.valid) errors.push(${context}.PipeError.path(k, vValidity.error, v));
				if (kValidity.valid && vValidity.valid) obj[kValidity.value] = vValidity.value;
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
