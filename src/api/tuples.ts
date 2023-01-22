import { VCore } from './core'
import { isArray, isTuple } from '../rules'
import { makeRule } from '../utils/rules'

type TupleToCompare<T extends Readonly<[any, any][]>> = { [k in keyof T]: VCore<T[k][0], T[k][1]> }
// @ts-ignore
type Join<I extends any[], O extends any[]> = { [k in keyof I]: [I[k], O[k]] }
type Mapper<I extends any[], O extends any[]> = TupleToCompare<Join<I, O>>

export class VTuple<I extends any[], O extends any[]> extends VCore<I, O> {
	constructor (schema: Mapper<I, O>, err?: string) {
		super()
		this.addTyping(isArray(err))
		this.addRule(makeRule((value: O) => {
			if (schema.length !== value.length) value.length = schema.length
			const mapped = value.reduce((acc, cur, i) => {
				const comp = schema[i].parse(cur)
				acc[0].push(comp.value)
				acc[1].push(comp.valid)
				return acc
			}, [[] as O[], [] as boolean[]] as const)
			return isTuple<O>(mapped[1].map((v) => () => v), err)(mapped[0])
		}))
	}
}