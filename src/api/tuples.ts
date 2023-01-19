import { coreToComp, VCore } from './core'
import { GetMap, isTuple } from '../rules'

type TupleToCompare<T extends Readonly<any[]>> = { [k in keyof T]: VCore<T[k]> }
type Mapper<A extends any[]> = TupleToCompare<GetMap<A>>

export class VTuple<T extends any[]> extends VCore<T> {
	schema: Mapper<T> = [] as any

	static create<T extends any[]> (schema: Mapper<T>, err?: string) {
		const v = new VTuple<T>()
		v.schema = schema
		v.addSanitizer((value: T) => v.trim(value))
		v.addRule(isTuple<T>(schema.map(coreToComp) as any, err))
		return v
	}

	private trim (value: any) {
		if (this.schema.length === value.length) return value
		return this.schema.map((_, i) => value[i])
	}
}