import { GetMap, isArray, isTuple } from '../rules'
import { makeRule } from '../utils/rules'
import { ExtractI } from './base'
import { VCore } from './core'

type G1<T extends ReadonlyArray<VCore<any>>> = { [K in keyof T]: ExtractI<T[K]> }

export class VTuple<T extends ReadonlyArray<VCore<any>>> extends VCore<G1<T>> {
	constructor (schema: GetMap<T>, err?: string) {
		super()
		this.addTyping(isArray(err))
		this.addTyping(makeRule<G1<T>>((value) => {
			const val = value as G1<T>
			// @ts-ignore
			if (schema.length !== val.length) val.length = schema.length
			const mapped = schema.reduce((acc, cur, i) => {
				const comp = cur.parse(val?.[i])
				acc[0].push(comp.value)
				acc[1].push(comp.valid)
				return acc
			}, [[] as G1<T>[], [] as boolean[]] as const)
			return isTuple(mapped[1].map((v) => () => v), err)(mapped[0]) as any
		}))
	}
}