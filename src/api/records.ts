import { PipeError, PipeInput, PipeOutput, type Pipe } from './base'
import { context, standard, schema, compileToValidate } from './base/pipes'
import { getRandomValue } from '../utils/functions'

type ObjectPipe<T extends Record<string, Pipe<any, any>>> = Pipe<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }>

const objCompile: (branches: Record<string, Pipe<any, any>>) => Parameters<typeof standard>[0] =
	(branches) =>
	({ input, context }, rootContext, failEarly) => {
		const resVarname = `res_${getRandomValue()}`
		const errorsVarname = `errors_${getRandomValue()}`
		const validityVarname = `validity_${getRandomValue()}`
		return [
			`if (typeof ${input} !== 'object' || ${input} === null || Array.isArray(${input})) throw ${context}.PipeError.root('is not an object', ${input})`,
			`const ${resVarname} = {}`,
			failEarly ? '' : `const ${errorsVarname} = []`,
			`let ${validityVarname}`,
			...Object.entries(branches).flatMap(([k, branch]) => [
				...compileToValidate({
					pipe: branch,
					rootContext,
					input: `${input}['${k}']`,
					context,
					prefix: `${validityVarname} = `,
					failEarly,
				}),
				`if (${validityVarname}.valid) ${resVarname}['${k}'] = ${validityVarname}.value`,
				failEarly
					? `else return ${validityVarname}.error`
					: `else ${errorsVarname}.push(${context}.PipeError.path('${k}', ${validityVarname}.error, ${input}['${k}']))`,
			]),
			failEarly ? '' : `if (${errorsVarname}.length) throw ${context}.PipeError.rootFrom(${errorsVarname}, ${input})`,
			`${input} = ${resVarname}`,
		]
	}

export const object = <T extends Record<string, Pipe<any, any>>>(branches: T) =>
	standard<PipeInput<ObjectPipe<T>>, PipeOutput<ObjectPipe<T>>>(objCompile(branches), {
		schema: () => ({
			type: 'object',
			properties: Object.fromEntries(Object.entries(branches ?? {}).map(([key, pipe]) => [key, schema(pipe)])),
			required: Object.entries(branches ?? {})
				.filter(([, pipe]) => !context(pipe).optional)
				.map(([key]) => key),
			additionalProperties: false,
		}),
		context: { branches, PipeError },
	})

export const objectPick = <T extends ObjectPipe<Record<string, Pipe<any, any>>>, S extends ReadonlyArray<keyof PipeInput<T> & string>>(
	branch: T,
	keys: S,
) => {
	const ctx = context(branch)
	const sch = schema(branch)
	const branches = Object.fromEntries(
		Object.entries((ctx.branches as Record<string, Pipe<any, any>>) ?? {}).filter(([key]) => keys.includes(key as S[number])),
	)
	return standard<Pick<PipeInput<T>, S[number]>, Pick<PipeOutput<T>, S[number]>>(objCompile(branches), {
		schema: () => ({
			...sch,
			properties: Object.fromEntries(Object.entries(sch.properties ?? {}).filter(([key]) => keys.includes(key as S[number]))),
			required: (sch.required ?? []).filter((key) => keys.includes(key as S[number])),
		}),
		context: { ...ctx, branches },
	})
}

export const objectOmit = <T extends ObjectPipe<Record<string, Pipe<any, any>>>, S extends ReadonlyArray<keyof PipeInput<T> & string>>(
	branch: T,
	keys: S,
) => {
	const ctx = context(branch)
	const sch = schema(branch)
	const branches = Object.fromEntries(
		Object.entries((ctx.branches as Record<string, Pipe<any, any>>) ?? {}).filter(([key]) => !keys.includes(key as S[number])),
	)
	return standard<Omit<PipeInput<T>, S[number]>, Omit<PipeOutput<T>, S[number]>>(objCompile(branches), {
		schema: () => ({
			...sch,
			properties: Object.fromEntries(Object.entries(sch.properties ?? {}).filter(([key]) => !keys.includes(key as S[number]))),
			required: (sch.required ?? []).filter((key) => !keys.includes(key as S[number])),
		}),
		context: { ...ctx, branches },
	})
}

export const record = <K extends Pipe<any, PropertyKey>, V extends Pipe<any, any>>(kPipe: K, vPipe: V) => {
	const resVarname = `res_${getRandomValue()}`
	const errorsVarname = `errors_${getRandomValue()}`
	return standard<Record<PipeInput<K>, PipeInput<V>>, Record<PipeOutput<K>, PipeOutput<V>>>(
		({ input, context }, rootContext, failEarly) => [
			`if (typeof ${input} !== 'object' || ${input} === null || Array.isArray(${input})) throw ${context}.PipeError.root(['is not an object'], ${input})`,
			`const ${resVarname} = {};`,
			`const ${errorsVarname} = [];`,
			`for (let [k, v] of Object.entries(${input})) {`,
			...[
				...compileToValidate({ pipe: kPipe, rootContext, input: 'k', context, prefix: `const kValidity = ` }).map((l) => `	${l}`),
				...compileToValidate({ pipe: vPipe, rootContext, input: 'v', context, prefix: `const vValidity = ` }).map((l) => `	${l}`),
				failEarly
					? `	if (!kValidity.valid) return kValidity.error`
					: `	if (!kValidity.valid) ${errorsVarname}.push(${context}.PipeError.path(k, kValidity.error, k));`,
				failEarly
					? `	if (!vValidity.valid) return vValidity.error`
					: `	if (!vValidity.valid) ${errorsVarname}.push(${context}.PipeError.path(k, vValidity.error, v));`,
				`	if (kValidity.valid && vValidity.valid) ${resVarname}[kValidity.value] = vValidity.value;`,
			],
			`}`,
			failEarly ? '' : `if (${errorsVarname}.length) throw ${context}.PipeError.rootFrom(${errorsVarname}, ${input})`,
			`${input} = ${resVarname}`,
		],
		{
			context: { PipeError },
			schema: () => ({
				type: 'object',
				propertyNames: schema(kPipe),
				additionalProperties: schema(vPipe),
			}),
		},
	)
}

export const asMap = <K extends PropertyKey, V>() =>
	standard<Record<K, V>, Map<K, V>>(({ input }) => [`${input} = new Map(Object.entries(${input}))`])
