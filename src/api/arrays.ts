import { PipeError, PipeInput, type Pipe, type PipeOutput } from './base'
import { pipe, schema, validate } from './base/pipes'

export const array = <T extends Pipe<any, any, any>>(pipeSchema: T, err = 'is not an array') =>
	pipe<PipeInput<T>[], PipeOutput<T>[], any>(
		(input: unknown) => {
			if (!Array.isArray(input)) throw PipeError.root(err, input)
			if (input.length === 0) return input
			let hasError = false
			const res = input.map((i, idx) => {
				const validity = validate(pipeSchema, i)
				if (validity.valid) return validity.value
				hasError = true
				return PipeError.path(idx, validity.error, i)
			})
			if (hasError)
				throw PipeError.rootFrom(
					res.filter((r) => r instanceof PipeError),
					input,
				)
			return res
		},
		{
			compile: ({ input, context }) => `(() => {
				const { PipeError, validate, pipeSchema } = ${context}
				if (!Array.isArray(${input})) return PipeError.root('${err}', ${input})
				if (${input}.length === 0) return ${input}
				let hasError = false
				const res = ${input}.map((i, idx) => {
					const validity = validate(pipeSchema, i)
					if (validity.valid) return validity.value
					hasError = true
					return PipeError.path(idx, validity.error, i)
				})
				if (hasError))
					throw PipeError.rootFrom(res.filter((r) => r instanceof PipeError), ${input})
				return res
			})()`,
			context: () => ({ PipeError, validate, pipeSchema }),
			schema: () => ({ type: 'array', items: schema(pipeSchema) }),
		},
	)

export const tuple = <T extends ReadonlyArray<Pipe<any, any, any>>>(pipes: readonly [...T], err = 'is not an array') =>
	pipe<{ [K in keyof T]: PipeInput<T[K]> }, { [K in keyof T]: PipeOutput<T[K]> }, any>(
		(input: unknown) => {
			if (!Array.isArray(input)) throw PipeError.root(err, input)
			if (pipes.length === 0) return input as any
			let hasError = false
			const res = pipes.map((pipe, idx) => {
				const validity = validate(pipe, input[idx])
				if (validity.valid) return validity.value
				hasError = true
				return PipeError.path(idx, validity.error, input[idx])
			})
			if (hasError)
				throw PipeError.rootFrom(
					res.filter((r) => r instanceof PipeError),
					input,
				)
			return res
		},
		{
			compile: ({ input, context }) => `(() => {
				const { PipeError, validate, pipes } = ${context}
				if (!Array.isArray(${input})) return PipeError.root('${err}', ${input})
				if (pipes.length === 0) return ${input}
				let hasError = false
				const res = pipes.map((pipe, idx) => {
					const validity = validate(pipe, ${input}[idx])
					if (validity.valid) return validity.value
					hasError = true
					return PipeError.path(idx, validity.error, ${input}[idx])
				})
				if (hasError) throw PipeError.rootFrom(res.filter((r) => r instanceof PipeError), ${input})
				return res
			})()`,
			context: () => ({ PipeError, validate, pipes }),
			schema: () => ({
				type: 'array',
				items: pipes.map((pipe) => schema(pipe)),
				minItems: pipes.length,
				maxItems: pipes.length,
			}),
		},
	)

export const asSet = <T>(keyFn: (i: T) => PropertyKey = (v) => v as string) =>
	pipe<T[], T[], any>(
		(input) => {
			const obj: Record<PropertyKey, boolean> = {}
			return input.reduce<T[]>((acc, cur) => {
				const key = keyFn(cur)
				if (!obj[key]) {
					obj[key] = true
					acc.push(cur)
				}
				return acc
			}, [])
		},
		{
			compile: ({ input, context }) => `(() => {
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
			context: () => ({ keyFn }),
		},
	)
