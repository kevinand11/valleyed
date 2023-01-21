import { VString } from './strings'
import { VNumber } from './numbers'
import { VFile } from './files'
import { VCore } from './core'
import { isInstanceOf, isNull, isUndefined } from '../rules'
import { VArray } from './arrays'
import { VObject } from './objects'
import { VAnd, VOr } from './junctions'
import { VBoolean } from './booleans'
import { VTuple } from './tuples'
import { VMap, VRecord } from './records'
import { VTime } from './times'

const force = <I, O, A extends Array<any>, C extends VCore<I, O>> (create: (...args: A) => C, constructor: (arg: I) => O) => {
	return ((...args: Parameters<typeof create>) => {
		const v = create(...args)
		// @ts-ignore
		v._forced = true
		v.addSanitizer((value) => constructor(value as any))
		return v as ReturnType<typeof create>
	})
}

export const v = {
	or: VOr.create,
	and: VAnd.create,
	string: VString.create as typeof VString.create<string>,
	number: VNumber.create as typeof VNumber.create<number>,
	boolean: VBoolean.create as typeof VBoolean.create<boolean>,
	time: VTime.create as typeof VTime.create,
	file: VFile.create,
	array: VArray.create,
	tuple: VTuple.create,
	object: VObject.create,
	record: VRecord.create,
	map: VMap.create,
	null: (err?: string) => VCore.c<null>().addRule((val: null) => isNull(err)(val)),
	undefined: (err?: string) => VCore.c<undefined>().addRule((val: undefined) => isUndefined(err)(val)),
	instanceof: <T> (classDef: new () => T, err?: string) => VCore.c<T>().addRule((val: T) => isInstanceOf(classDef, err)(val)),
	any: () => VCore.c<any>(),
	force: {
		string: force((...args: Parameters<typeof VString.create>) => VString.create<unknown>(...args), String),
		number: force((...args: Parameters<typeof VNumber.create>) => VNumber.create<unknown>(...args), Number),
		boolean: force((...args: Parameters<typeof VBoolean.create>) => VBoolean.create<unknown>(...args), Boolean),
		time: force((...args: Parameters<typeof VTime.create<Date>>) => VTime.create<Date, unknown>(...args), (v: unknown) => new Date(v as any))
	}
}