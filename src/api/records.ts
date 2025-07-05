import { PipeInput, PipeOutput, type Pipe } from './base'
import { context, standard, schema, compileNested } from './base/pipes'
import { getRandomValue } from '../utils/functions'

type ObjectPipe<T extends Record<string, Pipe<any, any>>> = Pipe<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }>

const objCompile: (branches: Record<string, Pipe<any, any>>) => Parameters<typeof standard>[0] =
	(branches) =>
	({ input, path }, opts) => {
		const resVarname = `res_${getRandomValue()}`
		const errorsVarname = `errors_${getRandomValue()}`
		const validatedVarname = `validated_${getRandomValue()}`
		return [
			`if (typeof ${input} !== 'object' || ${input} === null || Array.isArray(${input})) return PipeError.root('is not an object', ${input}, ${path})`,
			`const ${resVarname} = {}`,
			opts.failEarly ? '' : `const ${errorsVarname} = []`,
			`let ${validatedVarname}`,
			...Object.entries(branches).flatMap(([k, branch]) => [
				`${validatedVarname} = ${input}['${k}']`,
				...compileNested({ opts, pipe: branch, input: validatedVarname, key: k }),
				`if (!(${validatedVarname} instanceof PipeError)) ${resVarname}['${k}'] = ${validatedVarname}`,
				opts.failEarly ? `else return ${validatedVarname}` : `else ${errorsVarname}.push(${validatedVarname})`,
			]),
			opts.failEarly ? '' : `if (${errorsVarname}.length) return PipeError.rootFrom(${errorsVarname})`,
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
		context: { branches },
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
	const kFnVarname = `kFn_${getRandomValue()}`
	const vFnVarname = `vFn_${getRandomValue()}`
	const resVarname = `res_${getRandomValue()}`
	const errorsVarname = `errors_${getRandomValue()}`
	return standard<Record<PipeInput<K>, PipeInput<V>>, Record<PipeOutput<K>, PipeOutput<V>>>(
		({ input, path }, opts) => [
			`if (typeof ${input} !== 'object' || ${input} === null || Array.isArray(${input})) return PipeError.root(['is not an object'], ${input}, ${path})`,
			`const ${resVarname} = {};`,
			opts.failEarly ? '' : `const ${errorsVarname} = [];`,
			...compileNested({ opts, pipe: kPipe, fn: kFnVarname }),
			...compileNested({ opts, pipe: vPipe, fn: vFnVarname }),
			`for (let [k, v] of Object.entries(${input})) {`,
			...[
				`	const kValidated = ${kFnVarname}(k)`,
				`	const vValidated = ${vFnVarname}(v)`,
				opts.failEarly
					? `	if (kValidated instanceof PipeError) return PipeError.path(k, kValidity)`
					: `	if (kValidated instanceof PipeError) ${errorsVarname}.push(kValidated, k)`,
				opts.failEarly
					? `	if (vValidated instanceof PipeError) return PipeError.path(v, vValidity)`
					: `	if (vValidated instanceof PipeError) ${errorsVarname}.push(vValidated);`,
				`	if (!(kValidated instanceof PipeError) && !(vValidated instanceof PipeError)) ${resVarname}[kValidated] = vValidated;`,
			],
			`}`,
			opts.failEarly ? '' : `if (${errorsVarname}.length) return PipeError.rootFrom(${errorsVarname})`,
			`${input} = ${resVarname}`,
		],
		{
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
