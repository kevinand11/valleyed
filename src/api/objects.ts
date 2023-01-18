import { VCore } from './core'
import { and, isObject, or } from '../rules'

export type Schema<T extends Record<string, any>> = { [k in keyof T]: VCore<T[k]> }

export class VObject<T extends Record<string, any>> extends VCore<T> {
	schema: Schema<T>

	constructor (schema: Schema<T>, err?: string) {
		super()
		this.schema = schema
		this.addRule(isObject(schema, err))
	}
}

type GetVCoreG<C extends VCore<any>> = C extends VCore<infer T> ? T : unknown;

export class VOr<T extends VCore<any>[]> extends VCore<GetVCoreG<T[number]>> {
	constructor (rules: T, err?: string) {
		super()
		this.addRule(or(rules.map((v) => v.rules), err))
	}
}

export class VAnd<T> extends VCore<T> {
	constructor (rules: VCore<T>[], err?: string) {
		super()
		this.addRule(and(rules.map((v) => v.rules), err))
	}
}