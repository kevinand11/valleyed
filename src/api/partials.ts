import { VCore } from './core'

export class VPartial<I, O, P> extends VCore<I | P, O | P> {
	constructor (c: VCore<I, O>) {
		super()
		this.clone(c)
	}
}