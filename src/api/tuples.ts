import { VCore } from './core'
import { GetMap, isArray, isTuple } from '../rules'
import { makeRule } from '../utils/rules'

type TupleToCompare<T extends Readonly<any[]>> = { [k in keyof T]: VCore<T[k]> }
type Mapper<A extends any[]> = TupleToCompare<GetMap<A>>

export class VTuple<T extends any[]> extends VCore<T> {
	constructor (schema: Mapper<T>, err?: string) {
		super()
		this.addTyping(isArray(err))
		this.addRule(makeRule<T>((value: T) => {
			if (schema.length !== value.length) value.length = schema.length
			const mapped = value.reduce((acc, cur, i) => {
				const comp = schema[i].parse(cur)
				acc[0].push(comp.value)
				acc[1].push(comp.valid)
				return acc
			}, [[] as T[], [] as boolean[]] as const)
			return isTuple<T>(mapped[1].map((v) => () => v), err)(mapped[0])
		}))
	}
}