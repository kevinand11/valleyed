import { VCore } from './core'
import { isObject } from '../rules'

export type O = { [K in string]: any }
// @ts-ignore
export type Schema<T extends O> = { [K in T]: Schema<T> | VCore<any> }

export class VObject<T extends O> extends VCore<T> {
	schema: Schema<T>

	constructor (schema: Schema<T>, err?: string) {
		super()
		this.schema = schema
		this.addRule(isObject(schema, err))
	}
}