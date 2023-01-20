import { VString } from './strings'
import { VNumber } from './numbers'
import { VFile } from './files'
import { VCore } from './core'
import { isInstanceOf, isNull, isUndefined } from '../rules'
import { VArray } from './arrays'
import { VAnd, VObject, VOr } from './objects'
import { VBoolean } from './booleans'
import { VTuple } from './tuples'
import { VMap, VRecord } from './records'
import { Timeable, VTime } from './times'

type PrimitiveFunc<T> = (err?: string) => T

const force = <I, O, A extends Array<any>, C extends VCore<I, O>> (create: (...args: A) => C, constructor: (arg: I) => O) => {
	return ((...args: Parameters<typeof create>) => {
		const v = create(...args)
		// @ts-ignore
		v.forced = true
		v.addSanitizer((value) => constructor(value as any))
		return v as ReturnType<typeof create>
	})
}

export const v = {
	or: VOr.create,
	and: VAnd.create,
	string: VString.create as PrimitiveFunc<VString>,
	number: VNumber.create as PrimitiveFunc<VNumber>,
	boolean: VBoolean.create as PrimitiveFunc<VBoolean>,
	time: VTime.create as PrimitiveFunc<VTime>,
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
		time: force((...args: Parameters<typeof VTime.create>) => VTime.create<unknown>(...args), Date as () => Timeable)
	}
}