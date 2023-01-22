import { VCore } from './core'
import { GetMap, isArray, isTuple } from '../rules'
import { makeRule } from '../utils/rules'

type ExtractI<T extends ReadonlyArray<VCore<any>>> =
	{ [K in keyof T]: T[K] extends VCore<infer I, any, any> ? I : never }
type ExtractO<T extends ReadonlyArray<VCore<any>>> =
	{ [K in keyof T]: T[K] extends VCore<any, infer O> ? O : never }
type ExtractTr<T extends ReadonlyArray<VCore<any>>> =
	{ [K in keyof T]: T[K] extends VCore<any, any, infer Tr> ? Tr : never }

export class VTuple<T extends ReadonlyArray<VCore<any>>> extends VCore<ExtractI<T>, ExtractO<T>, ExtractTr<T>> {
	constructor (schema: GetMap<T>, err?: string) {
		super()
		this.addTyping(isArray(err))
		// @ts-ignore
		this.addRule(makeRule((value) => {
			// @ts-ignore
			if (schema.length !== value.length) value.length = schema.length
			const mapped = value.reduce((acc, cur, i) => {
				const comp = schema[i].parse(cur)
				acc[0].push(comp.value)
				acc[1].push(comp.valid)
				return acc
			}, [[] as ExtractO<T>, [] as boolean[]] as const)
			return isTuple(mapped[1].map((v) => () => v), err)(mapped[0])
		}))
	}
}