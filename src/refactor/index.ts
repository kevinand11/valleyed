import { VString } from './strings'
import { VNumber } from './numbers'
import { VFile } from './files'
import { VCore } from './core'
import { isBoolean, isNull, isUndefined } from '../rules'
import { VArray } from './arrays'
import { O, Schema, VObject } from './objects'

export const validate = {
	string: (err?: string) => new VString(err),
	number: (err?: string) => new VNumber(err),
	boolean: (err?: string) => new VBoolean(err),
	file: <T> (err?: string) => new VFile<T>(err),
	null: (err?: string) => new VNull(err),
	undefined: (err?: string) => new VUndefined(err),
	array: <T> (err?: string) => new VArray<T>(err),
	object: <T extends O> (schema: Schema<T>, err?: string) => new VObject<T>(schema, err)
}

class VBoolean extends VCore<boolean> {
	constructor (err?: string) {
		super()
		this.addRule((val: boolean) => isBoolean(val, err))
	}
}

class VNull extends VCore<null> {
	constructor (err?: string) {
		super()
		this.addRule((val: null) => isNull(val, err))
	}
}

class VUndefined extends VCore<undefined> {
	constructor (err?: string) {
		super()
		this.addRule((val: undefined) => isUndefined(val, err))
	}
}