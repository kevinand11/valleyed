import type { GetMap } from '../rules'
import { isArray, isTuple } from '../rules'
import type { ExtractI, ExtractO } from './base'
import { VCore } from './core'
import { makeRule } from '../utils/rules'

type GI<T extends ReadonlyArray<VCore<any>>> = { [K in keyof T]: ExtractI<T[K]> }
type GO<T extends ReadonlyArray<VCore<any>>> = { [K in keyof T]: ExtractO<T[K]> }

export class VTuple<T extends ReadonlyArray<VCore<any>>> extends VCore<GI<T>, GO<T>> {
	constructor(schema: GetMap<T>, err?: string) {
		super()
		this.addTyping(isArray(err))
		this.addTyping(
			makeRule<GI<T>>((value) => {
				const val = value as GI<T>
				// @ts-ignore
				if (schema.length !== val.length) val.length = schema.length
				const mapped = schema.reduce(
					(acc, cur, i) => {
						const comp = cur.parse(val?.[i])
						acc[0].push(comp.value)
						acc[1].push(comp.valid)
						return acc
					},
					[[] as GI<T>[], [] as boolean[]] as const,
				)
				return isTuple(
					mapped[1].map((v) => () => v),
					err,
				)(mapped[0]) as any
			}),
		)
	}
}
