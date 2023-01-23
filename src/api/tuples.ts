import { VCore } from './core'
import { GetMap, isArray, isTuple } from '../rules'
import { makeRule } from '../utils/rules'
import { ExtractI, ExtractO, ExtractTr } from './base'

type G1<T extends ReadonlyArray<VCore<any>>> = { [K in keyof T]: ExtractI<T[K]> }
type G2<T extends ReadonlyArray<VCore<any>>> = { [K in keyof T]: ExtractO<T[K]> }
type G3<T extends ReadonlyArray<VCore<any>>> = { [K in keyof T]: ExtractTr<T[K]> }

export class VTuple<T extends ReadonlyArray<VCore<any>>> extends VCore<G1<T>, G2<T>, G3<T>> {
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
			}, [[] as G2<T>, [] as boolean[]] as const)
			return isTuple(mapped[1].map((v) => () => v), err)(mapped[0])
		}))
	}
}