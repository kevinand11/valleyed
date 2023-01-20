import { VCore } from './core'
import { GetMap, isArray, isTuple } from '../rules'
import { makeRule } from '../utils/rules'

type TupleToCompare<T extends Readonly<any[]>> = { [k in keyof T]: VCore<T[k]> }
type Mapper<A extends any[]> = TupleToCompare<GetMap<A>>

export class VTuple<T extends any[]> extends VCore<T> {
	schema: Mapper<T> = [] as any

	static create<T extends any[]> (schema: Mapper<T>, err?: string) {
		const v = new VTuple<T>()
		v.schema = schema
		v.addTyping(isArray(err))
		v.addSanitizer((value: T) => v.trim(value))
		v.addRule(makeRule<T>((value: T) => {
			const mapped = value.reduce((acc, cur, i) => {
				const comp = schema[i].parse(cur)
				acc[0].push(comp.value)
				acc[1].push(comp.valid)
				return acc
			}, [[] as T[], [] as boolean[]] as const)
			return isTuple<T>(mapped[1].map((v) => () => v), err)(mapped[0])
		}))
		return v
	}

	private trim (value: any) {
		if (this.schema.length === value.length) return value
		return this.schema.map((_, i) => value[i])
	}
}