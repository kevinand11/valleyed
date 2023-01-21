import { VCore } from './core'
import { isTime } from '../rules'

type Timeable = Date | string | number

export class VTime<T extends Timeable = Timeable, I = T, Tr = T> extends VCore<I, T, Tr> {
	static create<T extends Timeable, I = T, Tr = T> (err?: string) {
		const v = new VTime<T, I, Tr>()
		v.addTyping(isTime(err))
		return v
	}

	asStamp () {
		return VTime.create<T, I, number>()
			.clone(this)
			.setTransform((v) => new Date(v).valueOf())
	}

	asString () {
		return VTime.create<T, I, string>()
			.clone(this)
			.setTransform((v) => new Date(v).toString())
	}

	asDate () {
		return VTime.create<T, I, Date>()
			.clone(this)
			.setTransform((v) => new Date(v))
	}
}