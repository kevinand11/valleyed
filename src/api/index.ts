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
import { VBase } from './base'

export const v = {
	or: VBase.createType(VOr),
	and: VBase.createType(VAnd),
	string: VBase.createType(VString),
	number: VBase.createType(VNumber),
	boolean: VBase.createType(VBoolean),
	time: VBase.createType(VTime),
	file: VBase.createType(VFile),
	array: VBase.createType(VArray),
	tuple: VBase.createType(VTuple),
	object: VBase.createType(VObject),
	record: VBase.createType(VRecord),
	map: VBase.createType(VMap),
	null: (err?: string) => new VCore<null>().addRule((val: null) => isNull(err)(val)),
	undefined: (err?: string) => new VCore<undefined>().addRule((val: undefined) => isUndefined(err)(val)),
	instanceof: <T> (classDef: new () => T, err?: string) => new VCore<T>().addRule((val: T) => isInstanceOf(classDef, err)(val)),
	any: () => new VCore<any>(),
	force: {
		string: VBase.createForcedType<VString, string, ConstructorParameters<typeof VString>>(VString, (v) => String(v)),
		number: VBase.createForcedType<VNumber, number, ConstructorParameters<typeof VNumber>>(VNumber, (v) => Number(v)),
		boolean: VBase.createForcedType<VBoolean, boolean, ConstructorParameters<typeof VBoolean>>(VBoolean, (v) => Boolean(v)),
		time: VBase.createForcedType<VTime<Date>, Date, ConstructorParameters<typeof VTime>>(VTime, (v) => new Date(v as any))
	}
}