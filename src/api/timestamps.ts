import { VCore } from './core'
import { isTime } from '../rules'

export type Dateable = Date | string | number

export class VTimestamp<I = Dateable> extends VCore<I, Dateable> {
	static create<I = Dateable> (err?: string) {
		const v = new VTimestamp<I>()
		v.addRule(isTime(err))
		return v
	}
}