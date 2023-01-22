import { VCore } from './core'
import { isTime } from '../rules'

type Timeable = Date | string | number

export class VTime<T extends Timeable = Timeable, I = T, Tr = T> extends VCore<I, T, Tr> {
	constructor (err?: string) {
		super()
		this.addTyping(isTime(err))
	}

	asStamp () {
		return new VTime<T, I, number>()
			.clone(this)
			.setTransform((v) => new Date(v).valueOf())
	}

	asString () {
		return new VTime<T, I, string>()
			.clone(this)
			.setTransform((v) => new Date(v).toString())
	}

	asDate () {
		return new VTime<T, I, Date>()
			.clone(this)
			.setTransform((v) => new Date(v))
	}
}