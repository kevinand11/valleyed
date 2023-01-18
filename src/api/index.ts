import { VString } from './strings'
import { VNumber } from './numbers'
import { VFile } from './files'
import { VCore } from './core'
import { isNull, isUndefined } from '../rules'
import { VArray } from './arrays'
import { Schema, VAnd, VObject, VOr } from './objects'
import { VBoolean } from './booleans'

export const v = {
	or: <T extends VCore<any>[]> (rules: T) => new VOr<T>(rules),
	and: <T> (rules: VCore<T>[]) => new VAnd<T>(rules),
	string: (err?: string) => new VString(err),
	number: (err?: string) => new VNumber(err),
	boolean: (err?: string) => new VBoolean(err),
	file: (err?: string) => new VFile(err),
	array: <T> (comparer: VCore<T, T>, type: string, err?: string) => new VArray<T>(comparer, type, err),
	object: <T extends Record<string, any>> (schema: Schema<T>, ignTrim?: boolean, err?: string) => new VObject<T>(schema, ignTrim, err),
	null: (err?: string) => {
		const v = new VCore<null>()
		v.addRule((val: null) => isNull(err)(val))
		return v
	},
	undefined: (err?: string) => {
		const v = new VCore<undefined>()
		v.addRule((val: undefined) => isUndefined(err)(val))
		return v
	},
	force: {
		string: () => {
			const v = new VString<unknown>()
			v.addSanitizer((value) => String(value))
			v.forced = true
			return v
		},
		number: () => {
			const v = new VNumber<unknown>()
			v.addSanitizer((value) => Number(value))
			v.forced = true
			return v
		},
		boolean: () => {
			const v = new VBoolean<unknown>()
			v.addSanitizer((value) => Boolean(value))
			v.forced = true
			return v
		}
	}
}