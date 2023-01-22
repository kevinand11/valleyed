import { VCore } from './core'
import { isTime } from '../rules'

export type Timeable = Date | string | number

export class VTime<I extends Timeable = Timeable, O = I, Tr = I> extends VCore<I, O, Tr> {
	constructor (err?: string) {
		super()
		this.addTyping(isTime(err))
	}

	asStamp () {
		return new VTime<I, O, number>()
			.clone(this)
			.setTransform((v) => new Date(v as any).valueOf())
	}

	asString () {
		return new VTime<I, O, string>()
			.clone(this)
			.setTransform((v) => new Date(v as any).toString())
	}

	asDate () {
		return new VTime<I, O, Date>()
			.clone(this)
			.setTransform((v) => new Date(v as any))
	}
}