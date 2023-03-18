import { isInstanceOf, isNull, isUndefined } from '../rules'
import { Differ } from '../utils/differ'
import { VArray } from './arrays'
import { VBase } from './base'
import { VBoolean } from './booleans'
import { VCore } from './core'
import { VFile } from './files'
import { VAnd, VOr } from './junctions'
import { VNumber } from './numbers'
import { VObject } from './objects'
import { VMap, VRecord } from './records'
import { VString } from './strings'
import { VTime } from './times'
import { VTuple } from './tuples'

export { VCore }

export const v = {
	is: <T> (value: T) => new VCore<T>().eq(value),
	in: <T> (values: Readonly<T[]>, comparer = Differ.equal as (val: any, arrayItem: T) => boolean) => new VCore<T>().in(values, comparer),
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
	null: (err?: string) => new VCore<null>().addRule(isNull(err)),
	undefined: (err?: string) => new VCore<undefined>().addRule(isUndefined(err)),
	instanceof: <T> (classDef: new () => T, err?: string) => new VCore<T>().addRule(isInstanceOf(classDef, err)),
	any: <T = any> () => new VCore<T>(),
	force: {
		string: VBase.createForcedType<VString, ConstructorParameters<typeof VString>>(VString, (v) => String(v)),
		number: VBase.createForcedType<VNumber, ConstructorParameters<typeof VNumber>>(VNumber, (v) => Number(v)),
		boolean: VBase.createForcedType<VBoolean, ConstructorParameters<typeof VBoolean>>(VBoolean, (v) => Boolean(v)),
		time: VBase.createForcedType<VTime<Date>, ConstructorParameters<typeof VTime>>(VTime, (v) => new Date(v as any))
	}
}