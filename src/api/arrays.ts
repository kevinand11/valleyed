import { PipeError, PipeInput, type Pipe, type PipeOutput } from './base'
import { standard, schema, validate, compileToValidate } from './base/pipes'

export const array = <T extends Pipe<any, any>>(branch: T, err = 'is not an array') =>
	standard<PipeInput<T>[], PipeOutput<T>[]>(
		({ input, context }, rootContext) => `(() => {
			const { PipeError, validate } = ${context};
			if (!Array.isArray(${input})) return PipeError.root('${err}', ${input});
			if (${input}.length === 0) return ${input};
			let hasError = false;
			const res = ${input}.map((i, idx) => {
				const validity = ${compileToValidate(branch, rootContext, 'i', context)};
				if (validity.valid) return validity.value;
				hasError = true;
				return PipeError.path(idx, validity.error, i);
			})
			if (hasError) throw PipeError.rootFrom(res.filter((r) => r instanceof PipeError), ${input});
			return res;
		})()`,
		{
			context: () => ({ PipeError }),
			schema: () => ({ type: 'array', items: schema(branch) }),
		},
	)

export const tuple = <T extends ReadonlyArray<Pipe<any, any>>>(branches: readonly [...T], err = 'is not an array') =>
	standard<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }>(
		({ input, context }, rootContext) =>
			branches.length === 0
				? input
				: `(() => {
const { PipeError, validate } = ${context};
if (!Array.isArray(${input})) return PipeError.root('${err}', ${input});
const res = [];
let hasError = false;
${branches
	.map(
		(_, idx) => `(() => {
	const validity = ${compileToValidate(branches[idx], rootContext, `${input}[${idx}]`, context)}
	if (validity.valid) return res.push(validity.value)
	hasError = true
	return res.push(PipeError.path(${idx}, validity.error, ${input}[${idx}]))
})();`,
	)
	.join('\n')}
if (hasError) throw PipeError.rootFrom(res.filter((r) => r instanceof PipeError), ${input});
return res;
})()`,
		{
			context: () => ({ PipeError, validate }),
			schema: () => ({
				type: 'array',
				items: branches.map((pipe) => schema(pipe)),
				minItems: branches.length,
				maxItems: branches.length,
			}),
		},
	)

export const asSet = <T>(keyFn: (i: T) => PropertyKey = (v) => v as string) =>
	standard<T[], T[]>(
		({ input, context }) => `(() => {
			const { keyFn } = ${context}
			const obj = {}
			return ${input}.reduce((acc, cur) => {
				const key = keyFn(cur)
				if (!obj[key]) {
					obj[key] = true
					acc.push(cur)
				}
				return acc
			}, [])
		})()`,
		{
			context: () => ({ keyFn }),
		},
	)
